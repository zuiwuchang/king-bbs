package data

import (
	"time"
)

const (
	//已激活
	USER_STATUS_ACTIVE = 1

	//禁用
	USER_STATUS_DISABLE = 2

	//禁言
	USER_STATUS_NO_SPEAK = 3
)

//註冊用戶
type User struct {
	//自動生成的 用戶標識
	Id int64

	//唯一的 用戶登入名稱 4~12 個 英文字符 數字 - _ .
	Name string `xorm:"notnull unique"`
	//綁定郵箱 可用於 登入 找回密碼 4 - 20個 字符
	Email string `xorm:"notnull unique"`
	//密碼 sha512 值 128個字符
	Pwd string `xorm:"notnull"`

	//頭像
	Face string

	//激活時間
	Create time.Time `xorm:"created"`
	//最後 活動時間
	Last time.Time `xorm:"created"`

	//是否是超級管理員
	Root bool

	//用戶狀態 狀態-到期時間 多個狀態以 ; 分隔
	//不設置時間 一直有效
	Status uint64

	//角色 id-到期時間 多 ; 分隔
	//不設置時間 一直有效
	Role string
}
