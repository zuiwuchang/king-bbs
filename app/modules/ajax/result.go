package ajax

const (
	//bool
	True  = 1
	False = 0

	//執行成功
	Ok = 0

	//數據庫 返回錯誤
	ErrorDb = 100
	//無效的參數
	ErrorParams = 101
)

type ResultBase struct {
	//錯誤碼
	Code int
	//返回的字符串值
	Str string
	//返回的 整型值
	Val int64
	//當發生錯誤時 返回 錯誤描述 字符串
	Emsg string
}
