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
