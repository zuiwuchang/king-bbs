package data

const (
	SourceFolder = 0
	SourceImg    = 1
	SourceVideo  = 2
	SourceBinary = 3

	//上傳 完畢
	SourceStatusOk = 1
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

	//檔案上傳狀態
	Status int `xorm:"index"`
}

//資源 已上傳的 分塊
type SourceBlock struct {
	//所屬資源id
	Sid int64 `xorm:"index"`
	//塊索引
	Chunk int
}
