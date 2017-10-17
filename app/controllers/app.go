package controllers

import (
	"fmt"
	"github.com/revel/revel"
	"king-bbs/app/modules/db/manipulator"
	"os"
)

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

//返回 公共資源
func (c App) Source(id int64) revel.Result {
	file := fmt.Sprintf("%s/%v", manipulator.GetFileRoot(), id)
	f, e := os.Open(file)
	if e != nil {
		return c.RenderError(e)
	}
	return c.RenderFile(f, revel.Attachment)
}
