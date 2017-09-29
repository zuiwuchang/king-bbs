package data

const (
	SourceFolder = 0
	SourceImg    = 1
	SourceVideo  = 2
	SourceBinary = 3
)

//服務器上保存的資源 圖像 檔案 視頻
type Source struct {
	//自動生成的 資源標識
	Id int64

	//資源 唯一標記 md5
	Hash string `xorm:"notnull unique"`

	//資源類別 (僅作爲參考)
	Style int `xorm:"index"`

	//檔案大小
	Size int64
}
