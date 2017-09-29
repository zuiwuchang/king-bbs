package controllers

import (
	"github.com/revel/revel"
	"king-bbs/app/modules/ajax"
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

	return c.Render(id)
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
