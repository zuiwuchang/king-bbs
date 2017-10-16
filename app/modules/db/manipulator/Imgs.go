package manipulator

import (
	"fmt"
	"king-bbs/app/modules/db/data"
)

type Imgs struct {
	Manipulator
}

func (m Imgs) NewFolder(pid int64, name string) (int64, error) {
	var bean data.Imgs = data.Imgs{Name: name, Style: data.SourceFolder, Pid: pid}
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
		has, e := session.Id(pid).Cols("id").Get(&data.Imgs{})
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
func (m Imgs) FindByPid(pid int64) ([]data.Imgs, error) {
	var rows []data.Imgs
	e := GetEngine().Where("pid = ?", pid).Find(&rows)
	if e != nil {
		return nil, e
	}
	return rows, nil
}

//從 source 中 創建一個資源 副本
func (m Imgs) Clone(src *data.Source, pid int64 /*父檔案夾 id*/, name string /*名稱*/) (int64, error) {
	if pid != 0 {
		return m.clone(src, pid, name)
	}

	var img data.Imgs = data.Imgs{
		Style: data.SourceImg,
		Sid:   src.Id,
		Size:  src.Size,
		Name:  name,
		Pid:   pid,
	}
	_, e := GetEngine().InsertOne(&img)
	if e != nil {
		return 0, e
	}
	return img.Id, nil
}
func (m Imgs) clone(src *data.Source, pid int64 /*父檔案夾 id*/, name string /*名稱*/) (int64, error) {
	session := NewSession()
	defer session.Close()
	e := session.Begin()
	if e != nil {
		return 0, e
	}
	defer func() {
		if e == nil {
			session.Commit()
		} else {
			session.Rollback()
		}
	}()

	var bean data.Imgs
	if has, err := session.Id(pid).Cols("style").Get(&bean); err != nil {
		e = err
		return 0, e
	} else if !has {
		e = fmt.Errorf("pid not found (%v)", pid)
		return 0, e
	}
	if bean.Style != data.SourceFolder {
		e = fmt.Errorf("pid not a folder (%v)", pid)
		return 0, e
	}

	var img data.Imgs = data.Imgs{
		Style: data.SourceImg,
		Sid:   src.Id,
		Size:  src.Size,
		Name:  name,
		Pid:   pid,
	}
	_, e = session.InsertOne(&img)
	if e != nil {
		return 0, e
	}
	return img.Id, nil
}
