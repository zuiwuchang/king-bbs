package controllers

import (
	"github.com/revel/revel"
	"king-bbs/app/modules/ajax"
	"king-bbs/app/modules/db/manipulator"
)

//只有在未登入時才可訪問 註冊 登入 ...
type NoLogin struct {
	*revel.Controller
}

//註冊
func (c NoLogin) Join() revel.Result {
	return c.Render()
}

//登入
func (c NoLogin) Login() revel.Result {
	return c.Render()
}

//驗證用戶名是否重複
func (c NoLogin) CheckUser(val string) revel.Result {
	var rs ajax.ResultBase

	var m manipulator.User
	has, e := m.CheckUser(val)
	if e != nil {
		rs.Code = ajax.ErrorDb
		rs.Emsg = e.Error()
		return c.RenderJson(rs)
	}

	if has {
		rs.Val = ajax.True
	}
	return c.RenderJson(rs)
}

//驗證郵箱是否重複
func (c NoLogin) CheckEmail(val string) revel.Result {
	var rs ajax.ResultBase

	var m manipulator.User
	has, e := m.CheckEmail(val)
	if e != nil {
		rs.Code = ajax.ErrorDb
		rs.Emsg = e.Error()
		return c.RenderJson(rs)
	}

	if has {
		rs.Val = ajax.True
	}
	return c.RenderJson(rs)
}

//註冊新 用戶
func (c NoLogin) NewUser() revel.Result {

	return c.Render()
}
