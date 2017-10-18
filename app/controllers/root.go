package controllers

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/revel/revel"
	"king-bbs/app/modules/ajax"
	"king-bbs/app/modules/db/data"
	"king-bbs/app/modules/db/manipulator"
	"strconv"
	"strings"
)

//僅 root 可訪問 服務器管理
type Root struct {
	*revel.Controller
}

//控制主頁
func (c Root) Index() revel.Result {
	return c.Render()
}

//控制關於
func (c Root) About() revel.Result {
	return c.Render()
}

//配置信息
func (c Root) Configure() revel.Result {
	return c.Render()
}

//資源管理
func (c Root) Source() revel.Result {
	return c.Render()
}

//用戶管理
func (c Root) User() revel.Result {
	return c.Render()
}

//角色管理
func (c Root) Role() revel.Result {
	return c.Render()
}

//文章 板塊 管理
func (c Root) Plate() revel.Result {
	return c.Render()
}

//文章 類別 管理
func (c Root) Group() revel.Result {
	return c.Render()
}

//公共圖像
func (c Root) Imgs(id int64) revel.Result {
	var m manipulator.Imgs
	//返回 路徑
	var paths []data.Imgs
	if id == 0 {
		paths = make([]data.Imgs, 1)
		paths[0] = data.Imgs{Id: 0}
	} else {
		var e error
		paths, e = m.FindPath(id)
		if e != nil {
			return c.RenderError(e)
		}
		paths = append(paths, data.Imgs{Id: 0})
	}

	//返回 子項目
	beans, e := m.FindByPid(id)
	if e != nil {
		return c.RenderError(e)
	}

	return c.Render(id, beans, paths)
}
func (c Root) FindImgs(id int64) revel.Result {
	var result ajax.ResultFindImgs

	var m manipulator.Imgs
	//返回 路徑
	var paths []data.Imgs
	if id == 0 {
		paths = make([]data.Imgs, 1)
		paths[0] = data.Imgs{Id: 0}
	} else {
		var e error
		paths, e = m.FindPath(id)
		if e != nil {
			result.Code = ajax.ErrorDb
			result.Emsg = e.Error()
			return c.RenderJSON(&result)
		}
		paths = append(paths, data.Imgs{Id: 0})
	}

	//返回 子項目
	beans, e := m.FindByPid(id)
	if e != nil {
		result.Code = ajax.ErrorDb
		result.Emsg = e.Error()
		return c.RenderJSON(&result)
	}

	result.Childs = beans
	result.Paths = paths
	return c.RenderJSON(&result)
}
func (c Root) NewImgsFolder(pid int64, name string) revel.Result {
	//當前檔案夾 id
	var result ajax.ResultBase

	name = strings.TrimSpace(name)
	if name == "" {
		result.Code = ajax.ErrorParams
		result.Emsg = c.Message("Root.E.Floder.Empty")
		return c.RenderJSON(&result)
	}

	var m manipulator.Imgs
	id, e := m.NewFolder(pid, name)
	if e == nil {
		result.Val = id
	} else {
		result.Code = ajax.ErrorDb
		result.Emsg = e.Error()
	}

	return c.RenderJSON(&result)
}
func (c Root) RemoveImgs(ids string) revel.Result {
	var result ajax.ResultBase
	ids = strings.TrimSpace(ids)
	strs := strings.Split(ids, ",")
	items := make([]int64, 0, len(strs))
	var id int64
	for i := 0; i < len(strs); i++ {
		id, _ = strconv.ParseInt(strs[i], 10, 64)
		if id != 0 {
			items = append(items, id)
		}
	}
	if len(items) == 0 {
		return c.RenderJSON(&result)
	}

	var m manipulator.Imgs
	e := m.Remove(items)
	if e != nil {
		result.Code = ajax.ErrorDb
		result.Emsg = e.Error()
	}
	return c.RenderJSON(&result)
}
func (c Root) RenameImgs(str string) revel.Result {
	var result ajax.ResultBase
	var items []data.SourceRename
	e := json.Unmarshal([]byte(str), &items)
	if e != nil {
		result.Code = ajax.Fault
		result.Emsg = e.Error()
		return c.RenderJSON(&result)
	}
	if len(items) > 0 {
		var m manipulator.Imgs
		e = m.Rename(items)
		if e != nil {
			result.Code = ajax.Fault
			result.Emsg = e.Error()
			return c.RenderJSON(&result)
		}
	}
	return c.RenderJSON(&result)
}
func (c Root) PreviewImgs(id int64) revel.Result {
	if id == 0 {
		return c.RenderError(errors.New("id not found (0)"))
	}

	bean := &data.Imgs{Id: id}
	var m manipulator.Imgs
	if has, e := m.Get(bean); e != nil {
		return c.RenderError(e)
	} else if !has {
		return c.RenderError(fmt.Errorf("id not found (%v)", id))
	}
	return c.Render(bean)
}
func (c Root) ImgsMoveTo(folder int64, files string) revel.Result {
	var result ajax.ResultBase
	files = strings.TrimSpace(files)
	if files == "" {
		return c.RenderJSON(&result)
	}

	strs := strings.Split(files, ",")
	ids := make([]int64, 0, len(strs))
	for i := 0; i < len(strs); i++ {
		if id, _ := strconv.ParseInt(strs[i], 10, 64); id != 0 {
			ids = append(ids, id)
		}
	}
	if len(ids) > 0 {
		var m manipulator.Imgs
		if e := m.MoveTo(folder, ids); e != nil {
			result.Code = ajax.ErrorDb
			result.Emsg = e.Error()
		}
	}
	return c.RenderJSON(&result)
}

//返回檔案夾
func (c Root) FoldersImgs() revel.Result {
	var result ajax.ResultFoldersImgs
	var m manipulator.Imgs
	if beans, e := m.Folders(); e != nil {
		result.Code = ajax.ErrorDb
		result.Emsg = e.Error()
		return c.RenderJSON(&result)
	} else {
		result.Folders = beans
	}
	return c.RenderJSON(&result)
}

//公共視頻
func (c Root) Videos(id int64) revel.Result {
	//當前檔案夾 id

	return c.Render(id)
}

//公共檔案
func (c Root) Binarys(id int64) revel.Result {
	//當前檔案夾 id

	return c.Render(id)
}

//上傳 檔案 分塊
func (c Root) NewFileChunk(sid int64 /*資源id*/, file []byte /*二進制數據*/, chunk /*分塊索引*/, chunks /*分塊數量*/ int) revel.Result {
	var m manipulator.Source
	if chunks == 0 { //不需要分片的 完整檔案
		e := m.CreateNewFile(sid, file)
		if e != nil {
			return c.RenderError(e)
		}
	} else {
		//需要分片的檔案
		e := m.CreateNewFileChunk(sid, file, chunk, chunks)
		if e != nil {
			return c.RenderError(e)
		}
	}
	return c.RenderText("ok")
}

//創建一個 分塊上傳檔案
func (c Root) CreateNewFile(hash, name string, style int, pid int64) revel.Result {
	var result ajax.ResultCreateNewFile
	hash = strings.TrimSpace(hash)
	name = strings.TrimSpace(name)
	if hash == "" {
		result.Code = ajax.ErrorParams
		result.Emsg = c.Message("Root.E.Hash.Empty")
		return c.RenderJSON(&result)
	}
	var mSoruce manipulator.Source
	var source data.Source = data.Source{Hash: hash}
	has, e := mSoruce.Get(&source)
	if e != nil {
		result.Code = ajax.ErrorDb
		result.Emsg = e.Error()
		return c.RenderJSON(&result)
	} else if has {
		//已經存在資源
		if data.SourceStatusOk == source.Status {
			//直接 複製
			if style == data.SourceImg {
				var mImgs manipulator.Imgs
				result.Val, e = mImgs.Clone(&source, pid, name)
				if e != nil {
					result.Code = ajax.ErrorDb
					result.Emsg = e.Error()
					return c.RenderJSON(&result)
				}
				result.Sid = source.Id
			}
			result.Code = ajax.NewOk
			return c.RenderJSON(&result)
		} else {
			//需要上傳 分塊
			if blocks, e := mSoruce.FindBlocks(source.Id); e != nil {
				result.Code = ajax.ErrorDb
				result.Emsg = e.Error()
				return c.RenderJSON(&result)
			} else {
				result.Val = source.Id
				result.Chunks = blocks
				result.ChunkSize = manipulator.GetBlockSize()
				return c.RenderJSON(&result)
			}
		}
	} else {
		//創建 上傳 檔案
		if id, blocks, e := mSoruce.NewFile(hash, name, style); e != nil {
			result.Code = ajax.ErrorDb
			result.Emsg = e.Error()
			return c.RenderJSON(&result)
		} else {
			//返回
			result.Val = id
			result.Chunks = blocks
			result.ChunkSize = manipulator.GetBlockSize()
			return c.RenderJSON(&result)
		}
	}
	return c.RenderJSON(&result)
}

//創建一個檔案副本
func (c Root) CloneNewFile(sid int64, name string, style int, pid int64) revel.Result {
	var result ajax.ResultBase
	if sid == 0 {
		result.Code = ajax.ErrorParams
		result.Emsg = fmt.Sprintf("sid not found (%v)", sid)
		return c.RenderJSON(&result)
	}
	name = strings.TrimSpace(name)

	//驗證資源 有效
	var mSoruce manipulator.Source
	var source data.Source = data.Source{Id: sid}
	has, e := mSoruce.Get(&source)
	if e != nil {
		result.Code = ajax.ErrorDb
		result.Emsg = e.Error()
		return c.RenderJSON(&result)
	} else if !has {
		result.Code = ajax.False
		result.Emsg = fmt.Sprintf("sid not found (%v)", sid)
		return c.RenderJSON(&result)
	} else if data.SourceStatusOk != source.Status {
		result.Code = ajax.Fault
		result.Emsg = fmt.Sprintf("source(%v) wait chunk", sid)
		return c.RenderJSON(&result)
	}

	//複製 檔案
	switch style {
	case data.SourceImg:
		var mImgs manipulator.Imgs
		result.Val, e = mImgs.Clone(&source, pid, name)
		if e != nil {
			result.Code = ajax.ErrorDb
			result.Emsg = e.Error()
			return c.RenderJSON(&result)
		}
	}
	return c.RenderJSON(&result)

}
