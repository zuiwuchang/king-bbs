package intercepts

import (
	"github.com/revel/revel"
	"king-bbs/app/controllers"
)

//驗證 是否 已經登入
func CheckLogin(c *revel.Controller) revel.Result {
	if _, ok := c.Session["User"]; ok {
		return nil
	}

	return c.Redirect(controllers.NoLogin.Login)
}

//驗證 是否  未登入
func CheckNoLogin(c *revel.Controller) revel.Result {
	if _, ok := c.Session["User"]; ok {
		return c.Redirect(controllers.App.Index)
	}
	return nil
}
