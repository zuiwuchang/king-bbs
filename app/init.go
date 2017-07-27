package app

import (
	"github.com/revel/revel"
	"king-bbs/app/controllers"
	"king-bbs/app/modules/db/manipulator"
	"king-bbs/app/modules/intercepts"
)

func init() {
	// Filters is the default set of global filters.
	revel.Filters = []revel.Filter{
		revel.PanicFilter,             // Recover from panics and display an error page instead.
		revel.RouterFilter,            // Use the routing table to select the right Action
		revel.FilterConfiguringFilter, // A hook for adding or removing per-Action filters.
		revel.ParamsFilter,            // Parse parameters into Controller.Params.
		revel.SessionFilter,           // Restore and write the session cookie.
		revel.FlashFilter,             // Restore and write the flash cookie.
		revel.ValidationFilter,        // Restore kept validation errors and save new ones from cookie.
		func(c *revel.Controller, fc []revel.Filter) {
			//替換默認的 i18n 解析
			locale := "zh"
			c.Request.Locale = locale
			c.RenderArgs[revel.CurrentLocaleRenderArg] = locale

			fc[0](c, fc[1:])
		},
		//revel.I18nFilter,        // Resolve the requested language
		HeaderFilter,            // Add some security based headers
		revel.InterceptorFilter, // Run interceptors around the action.
		revel.CompressFilter,    // Compress the result.
		revel.ActionInvoker,     // Invoke the action.
	}

	// register startup functions with OnAppStart
	// ( order dependent )
	revel.OnAppStart(func() {
		//初始化 數據庫
		manipulator.Initialize()
	})
	// revel.OnAppStart(FillCache)

	/*	註冊 攔截器	*/
	//檢查 session 過期 需要對所有頁面 註冊
	revel.InterceptFunc(intercepts.CheckNoLogin, revel.BEFORE, &controllers.NoLogin{})
}

// TODO turn this into revel.HeaderFilter
// should probably also have a filter for CSRF
// not sure if it can go in the same filter or not
var HeaderFilter = func(c *revel.Controller, fc []revel.Filter) {
	// Add some common security headers
	c.Response.Out.Header().Add("X-Frame-Options", "SAMEORIGIN")
	c.Response.Out.Header().Add("X-XSS-Protection", "1; mode=block")
	c.Response.Out.Header().Add("X-Content-Type-Options", "nosniff")

	fc[0](c, fc[1:]) // Execute the next filter stage.
}
