package manipulator

import (
	"errors"
	"king-bbs/app/modules/db/data"
	"strings"
)

type User struct {
	Manipulator
}

//驗證用戶名 是否 唯一
func (m User) CheckUser(val string) (bool, error) {
	val = strings.TrimSpace(val)
	if val == "" {
		return false, errors.New("param can't be empty")
	}
	bean := &data.User{Name: val}
	has, e := m.Get(bean, "id")
	if e != nil {
		return false, e
	}
	return has, nil
}

//驗證郵箱 是否 唯一
func (m User) CheckEmail(val string) (bool, error) {
	val = strings.TrimSpace(val)
	if val == "" {
		return false, errors.New("param can't be empty")
	}
	bean := &data.User{Email: val}
	has, e := m.Get(bean, "id")
	if e != nil {
		return false, e
	}
	return has, nil
}

//驗證 是否是 指定用戶
func (m User) Login(bean *data.User, name, pwd string) (bool, error) {
	if strings.Contains(name, "@") {
		bean.Email = name
	} else {
		bean.Name = name
	}
	bean.Pwd = pwd

	return m.Get(bean)
}
