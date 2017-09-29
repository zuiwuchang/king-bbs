package data

//公共 圖像
type Imgs struct {
	//自動生成的 資源標識
	Id int64

	//資源類別 (僅作爲參考)
	Style int `xorm:"index"`

	//檔案大小
	Size int64

	//名稱
	Name string
}
