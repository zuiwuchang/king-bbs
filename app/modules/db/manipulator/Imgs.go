package manipulator

import (
	"fmt"
	"king-bbs/app/modules/db/data"
)

type Imgs struct {
	Manipulator
}

func (m Imgs) NewFolder(pid int64, name string) (int64, error) {
	var bean data.Imgs = data.Imgs{Name: name, Style: data.SourceFolder}
	if pid == 0 {
		_, e := GetEngine().InsertOne(&bean)
		if e != nil {
			return 0, e
		}
	} else {

		session := NewSession()
		defer session.Close()
		e := session.Begin()
		if e != nil {
			return 0, e
		}
		defer session.Commit()
		has, e := session.Id(pid).Get(&data.Imgs{})
		if e != nil {
			return 0, e
		} else if !has {
			return 0, fmt.Errorf("pid not found %v", pid)
		}

		_, e = session.InsertOne(&bean)
		if e != nil {
			return 0, e
		}
	}
	return bean.Id, nil
}
