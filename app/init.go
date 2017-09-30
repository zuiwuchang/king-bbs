package app

import (
	"fmt"
	"github.com/revel/revel"
	"king-bbs/app/controllers"
	"king-bbs/app/modules/db/manipulator"
	"king-bbs/app/modules/intercepts"
	"time"
)

const (
	KB = 1024
	MB = 1024 * 1024
	GB = 1024 * 1024 * 1024
)

func init() {
	/***	註冊自定義 模板函數	***/
	//格式化 時間 顯示 字符串
	revel.TemplateFuncs["dateString"] = func(t time.Time) string {
		if t.IsZero() {
			return ""
		}
		return t.Format("2006-01-02")
	}
	revel.TemplateFuncs["timeString"] = func(t time.Time) string {
		if t.IsZero() {
			return ""
		}
		return t.Format("15:04:05")
	}
	revel.TemplateFuncs["dateTimeString"] = func(t time.Time) string {
		if t.IsZero() {
			return ""
		}
		return t.Format("2006-01-02 15:04:05")
	}
	//格式化 檔案大小 顯示 字符串
	revel.TemplateFuncs["sizeString"] = func(size int64) string {
		if size == 0 {
			return "-"
		}
		if size >= GB {
			gb := size / GB
			mod := int(float64(size%GB) / GB * 100)
			if mod > 0 {
				return fmt.Sprintf("%v.%02v gb", gb, mod)
			}
			return fmt.Sprint(gb, " gb")
		} else if size >= MB {
			mb := size / MB
			mod := int(float64(size%MB) / MB * 100)
			if mod > 0 {
				return fmt.Sprintf("%v.%02v mb", mb, mod)
			}
			return fmt.Sprint(mb, " mb ", mod)
		} else if size >= KB {
			kb := size / KB
			mod := int(float64(size%KB) / KB * 100)
			if mod > 0 {
				return fmt.Sprintf("%v.%02v kb", kb, mod)
			}
			return fmt.Sprint(kb, " kb")
		}
		return fmt.Sprint(size, " b")
	}

	// Filters is the default set of global filters.
	revel.Filters = []revel.Filter{
		revel.PanicFilter,             // Recover from panics and display an error page instead.
		revel.RouterFilter,            // Use the routing table to select the right Action
		revel.FilterConfiguringFilter, // A hook for adding or removing per-Action filters.
		revel.ParamsFilter,            // Parse parameters into Controller.Params.
		revel.SessionFilter,           // Restore and write the session cookie.
		revel.FlashFilter,             // Restore and write the flash cookie.
		revel.ValidationFilter,        // Restore kept validation errors and save new ones from cookie.
		//revel.I18nFilter,              // Resolve the requested language
		func(c *revel.Controller, fc []revel.Filter) {
			//驗證語言是否被支持
			if c.Request.Locale != "zh" {
				//替換爲支持的 語言
				locale := "zh"
				c.Request.Locale = locale
				c.ViewArgs[revel.CurrentLocaleViewArg] = locale
			}
			fc[0](c, fc[1:])
		},
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
	//檢查 是否 沒有登入 使頁面只能被未登入用戶訪問
	revel.InterceptFunc(intercepts.CheckNoLogin, revel.BEFORE, &controllers.NoLogin{})

	//檢查 是否 已經登入 使頁面只能被登入用戶訪問

	//檢查 頁面 只能被 root 訪問
	revel.InterceptFunc(intercepts.CheckRoot, revel.BEFORE, &controllers.Root{})
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
