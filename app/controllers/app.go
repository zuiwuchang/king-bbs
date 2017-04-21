package controllers

import "github.com/revel/revel"

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

//登入
func (c App) Login() revel.Result {
	return c.Render()
}

//註冊
func (c App) Join() revel.Result {
	return c.Render()
}
