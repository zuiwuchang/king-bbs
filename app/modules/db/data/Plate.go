package data

//板塊
type Plate struct {
	//自動生成的 板塊標識
	Id int64

	//板塊 名稱
	Name string

	//板塊 圖示
	Sid int64

	//所在 板塊分類
	Gid int64
}
