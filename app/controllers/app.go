package controllers

import "github.com/revel/revel"

//所有用戶 都可訪問
type App struct {
	*revel.Controller
}

//主頁
func (c App) Index() revel.Result {
	return c.Render()
}

//關於
func (c App) About() revel.Result {
	return c.Render()
}

//登出
func (c App) Logout() revel.Result {
	for key, _ := range c.Session {
		delete(c.Session, key)
	}
	return c.Redirect(App.Index)
}
