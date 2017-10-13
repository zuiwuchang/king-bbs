package controllers

import (
	"fmt"
	"github.com/revel/revel"
	"king-bbs/app/modules/ajax"
	"king-bbs/app/modules/db/data"
	"king-bbs/app/modules/db/manipulator"
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
	//當前檔案夾 id
	var m manipulator.Imgs
	beans, e := m.FindByPid(id)
	if e != nil {
		return c.RenderError(e)
	}

	if beans != nil {
		beans = append(beans, data.Imgs{Id: 100, Style: data.SourceImg, Name: "檔案測試", Size: 1000})
		beans = append(beans, data.Imgs{Id: 101, Style: data.SourceImg, Name: "檔案測試1024", Size: 1024})
		beans = append(beans, data.Imgs{Id: 102, Style: data.SourceImg, Name: "檔案測試2", Size: 100000})
		beans = append(beans, data.Imgs{Id: 103, Style: data.SourceImg, Name: "檔案測試3", Size: 10000000})
		beans = append(beans, data.Imgs{Id: 104, Style: data.SourceImg, Name: "檔案測試1G", Size: 1024 * 1024 * 1024})
	}
	return c.Render(id, beans)
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

//上傳 檔案
func (c Root) NewFile(style, name string, file []byte) revel.Result {
	fmt.Println(style)
	fmt.Println(name)
	fmt.Println(len(file))
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
		//直接 複製

	} else {
		//創建 上傳 檔案
		if id, ids, e := mSoruce.NewFile(hash, name, style); e != nil {
			result.Code = ajax.ErrorDb
			result.Emsg = e.Error()
			return c.RenderJSON(&result)
		} else {
			//返回
			result.Val = id
			result.Ids = ids
			result.BlockSize = manipulator.GetBlockSize()
			return c.RenderJSON(&result)
		}
	}
	return c.RenderJSON(&result)
}
