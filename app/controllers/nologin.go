package controllers

import (
	"github.com/revel/revel"
	"king-bbs/app/modules/ajax"
	"king-bbs/app/modules/db/data"
	"king-bbs/app/modules/db/manipulator"
	"strings"
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
func (c NoLogin) Login(url string) revel.Result {
	url = strings.TrimSpace(url)
	str := strings.ToLower(url)
	if !strings.HasPrefix(str, "/nologin/") && !strings.HasPrefix(str, "/nologin\\") && url != "" {
		c.Session["_loginTo"] = url
	}
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
		return c.RenderJSON(rs)
	}

	if has {
		rs.Val = ajax.True
	}
	return c.RenderJSON(rs)
}

//驗證郵箱是否重複
func (c NoLogin) CheckEmail(val string) revel.Result {
	var rs ajax.ResultBase

	var m manipulator.User
	has, e := m.CheckEmail(val)
	if e != nil {
		rs.Code = ajax.ErrorDb
		rs.Emsg = e.Error()
		return c.RenderJSON(rs)
	}

	if has {
		rs.Val = ajax.True
	}
	return c.RenderJSON(rs)
}

//註冊新 用戶
func (c NoLogin) NewUser() revel.Result {
	return c.Render()
}

//登入
func (c NoLogin) DoLogin(name, pwd string) revel.Result {
	name = strings.TrimSpace(name)
	pwd = strings.TrimSpace(pwd)
	if name == "" || pwd == "" {
		c.Flash.Error(c.Message("Login.not match"))
		c.Flash.Out["name"] = name
		return c.Redirect(NoLogin.Login)
	}

	var m manipulator.User
	var bean data.User
	has, e := m.Login(&bean, name, pwd)
	if e != nil {
		c.Flash.Error(e.Error())
		c.Flash.Out["name"] = name
		return c.Redirect(NoLogin.Login)
	} else if !has {
		c.Flash.Error(c.Message("Login.not match"))
		c.Flash.Out["name"] = name
		return c.Redirect(NoLogin.Login)
	} else if bean.Status != data.USER_STATUS_ACTIVE && bean.Status != data.USER_STATUS_NO_SPEAK {
		c.Flash.Error(c.Message("Login.not match"))
		c.Flash.Out["name"] = name
		return c.Redirect(NoLogin.Login)
	}

	//更新session
	bean.UpdateSession(c.Session)

	//回到頁面
	if url, ok := c.Session["_loginTo"]; ok {
		delete(c.Session, "_loginTo")
		return c.Redirect(url)
	}
	return c.Redirect(App.Index)
}
