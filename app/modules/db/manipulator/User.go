package manipulator

import (
	"errors"
	"king-bbs/app/modules/db/data"
	"strings"
)

type User struct {
	Manipulator
}

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
