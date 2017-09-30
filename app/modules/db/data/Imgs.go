package data

import (
	"time"
)

//公共 圖像
type Imgs struct {
	//自動生成的 資源標識
	Id int64

	//資源類別 (僅作爲參考)
	Style int `xorm:"index notnull"`

	//檔案大小
	Size int64 `xorm:"default 0"`

	//名稱
	Name string `xorm:"default ''"`

	//所在目錄
	Pid int64 `xorm:"index default 0"`

	//檔案創建時間
	Create time.Time `xorm:"created"`
}
