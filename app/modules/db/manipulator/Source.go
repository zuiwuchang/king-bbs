package manipulator

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"io/ioutil"
	"king-bbs/app/modules/db/data"
	"os"
)

type Source struct {
	Manipulator
}

//創建一個 上傳 檔案 返回檔案 id 已上傳分塊 索引
func (m Source) NewFile(hash, name string, style int) (int64, []int, error) {
	session := NewSession()
	defer session.Close()

	e := session.Begin()
	if e != nil {
		return 0, nil, e
	}
	defer session.Commit()

	var bean data.Source = data.Source{Style: style, Hash: hash}
	_, e = session.InsertOne(&bean)
	if e != nil {
		return 0, nil, e
	}
	return bean.Id, nil, nil
}

//返回資源 已經 存在的分塊 索引
func (m Source) FindBlocks(id int64) ([]int, error) {
	var rows []data.SourceBlock
	e := GetEngine().Where("sid = ?", id).Cols("chunk").Find(&rows)
	if e != nil {
		return nil, e
	}
	size := len(rows)
	if size > 0 {
		chunks := make([]int, size)
		for i := 0; i < size; i++ {
			chunks[i] = rows[i].Chunk
		}
	}
	return nil, nil
}

//創建 檔案
func (m Source) CreateNewFile(id int64, b []byte) error {
	session := NewSession()
	defer session.Close()

	e := session.Begin()
	if e != nil {
		return e
	}
	var path string
	defer func() {
		if e == nil {
			session.Commit()
		} else {
			if path != "" {
				os.Remove(path)
			}
			session.Rollback()
		}
	}()

	//查詢 檔案 數據
	var bean data.Source
	if has, err := session.Id(id).Get(&bean); err != nil {
		e = err
		return e
	} else if !has {
		e = fmt.Errorf("source not found (%v)", id)
		return e
	}

	//已經完成 直接返回成功
	if bean.Status == data.SourceStatusOk {
		return nil
	}

	//創建檔案
	path = fmt.Sprintf(`%s/%v`, GetFileRoot(), id)
	if e = ioutil.WriteFile(path, b, 0644); e != nil {
		return e
	}

	//計算 md5
	hash := md5.New()
	if _, e = hash.Write(b); e != nil {
		return e
	}
	bean.Hash = hex.EncodeToString(hash.Sum(nil))
	bean.Size = int64(len(b))
	bean.Status = data.SourceStatusOk
	_, e = session.Id(id).Update(&bean)
	return e
}

//根據分片 創建檔案
func (m Source) CreateNewFileChunk(id int64, b []byte, chunk, chunks int) error {
	if chunks < 0 || chunk >= chunks {
		return fmt.Errorf("bad chunk(%v) and chunks(%v)", chunk, chunks)
	}
	if len(b) < 1 || len(b) > GetBlockSize() {
		return fmt.Errorf("bad len(data) (%v)", len(b))
	}

	session := NewSession()
	defer session.Close()

	e := session.Begin()
	if e != nil {
		return e
	}
	var path string
	defer func() {
		if e == nil {
			session.Commit()
		} else {
			if path != "" {
				os.Remove(path)
			}
			session.Rollback()
		}
	}()

	var bean data.Source
	if has, err := session.Id(id).Get(&bean); err != nil {
		e = err
		return e
	} else if !has {
		e = fmt.Errorf("source not found (%v)", id)
		return e
	}

	//檔案已經 創建完整 直接忽略 分片
	if bean.Status == data.SourceStatusOk {
		return nil
	}

	var sourceBlock data.SourceBlock
	if has, err := session.Where("sid = ? and chunk = ?", id, chunk).Cols("sid").Get(&sourceBlock); err != nil {
		e = err
		return e
	} else if !has {
		//創建分片
		sourceBlock.Sid = id
		sourceBlock.Chunk = chunk
		sourceBlock.Data = b
		if g_showSql {
			GetEngine().ShowSQL(false)
		}
		if _, e = session.InsertOne(&sourceBlock); e != nil {
			if g_showSql {
				GetEngine().ShowSQL(true)
			}
			return e
		}
		if g_showSql {
			GetEngine().ShowSQL(true)
		}
	}
	/*else{
		//分片已經存在 無需記錄
	}
	*/

	//驗證 分片是否上傳完畢
	if n, err := session.Where("sid = ?", id).Count(&data.SourceBlock{}); e != nil {
		e = err
		return e
	} else if n < int64(chunks) {
		//等待其它分片
		return nil
	}

	//創建 檔案
	var beans []data.SourceBlock
	if e = session.Where("sid = ?", id).OrderBy("chunk").Find(&beans); e != nil {
		return e
	}
	/*for i := 0; i < len(beans); i++ {
		data := beans[i].Data
		fmt.Printf("%v %v %v", beans[i].Sid, beans[i].Chunk, len(data))
	}
	return nil*/

	path = fmt.Sprintf(`%s/%v`, GetFileRoot(), id)
	//f
	f, err := os.Create(path)
	if err != nil {
		e = err
		return e
	}
	defer f.Close()
	//hash
	hash := md5.New()
	size := int64(0)
	for i := 0; i < len(beans); i++ {
		data := beans[i].Data
		if _, e = f.Write(data); e != nil {
			return e
		}
		if _, e = hash.Write(data); e != nil {
			return e
		}
		size += int64(len(data))
	}

	//更新檔案 狀態
	var source data.Source = data.Source{
		Hash:   hex.EncodeToString(hash.Sum(nil)),
		Size:   size,
		Status: data.SourceStatusOk,
	}
	if _, e = session.Id(id).Update(&source); e != nil {
		return e
	}

	//刪除 分片記錄
	_, e = session.Where("sid = ?", id).Delete(&data.SourceBlock{})
	return e
}
