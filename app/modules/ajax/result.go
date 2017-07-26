package ajax

type ResultBase struct {
	//錯誤碼
	Code int
	//返回的字符串值
	Str string
	//返回的 整型值
	Val int
	//當發生錯誤時 返回 錯誤描述 字符串
	Emsg string
}
