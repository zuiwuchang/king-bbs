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

	var path string
	e := session.Begin()
	if e != nil {
		return e
	}
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
