package controllers

import (
	"github.com/revel/revel"
	"king-bbs/app/modules/ajax"
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
func (c NoLogin) CheckUser() revel.Result {
	var rs ajax.ResultBase
	return c.RenderJson(rs)
}

//驗證郵箱是否重複
func (c NoLogin) CheckEmail() revel.Result {
	var rs ajax.ResultBase
	rs.Val = 1
	rs.Emsg = "234"
	return c.RenderJson(rs)
}
