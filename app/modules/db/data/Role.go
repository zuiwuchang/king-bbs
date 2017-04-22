package data

//角色
type Role struct {
	//自動生成的 角色標識
	Id int64

	//可管理的 版塊
	Root string

	//可寫入的 版塊
	Write string

	//可讀取的 版塊
	Read string
}
