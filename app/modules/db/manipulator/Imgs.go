package manipulator

import (
	"fmt"
	"github.com/go-xorm/xorm"
	"king-bbs/app/modules/db/data"
	"strings"
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

//刪除 資源
func (m Imgs) Remove(ids []int64) error {
	session := NewSession()
	defer session.Close()

	e := session.Begin()
	if e != nil {
		return e
	}
	defer func() {
		if e == nil {
			session.Commit()
		} else {
			session.Rollback()
		}
	}()
	e = m.remove(session, ids)
	return e

}
func (m Imgs) remove(session *xorm.Session, ids []int64) error {
	if len(ids) == 0 {
		return nil
	}
	strs := make([]string, len(ids))
	for i := 0; i < len(ids); i++ {
		strs[i] = fmt.Sprint(ids[i])
	}
	str := "id in (" + strings.Join(strs, ",") + ")"

	var beans []data.Imgs
	e := session.Where(str).Find(&beans)
	if e != nil {
		return e
	}

	ids = ids[0:0]
	strs = strs[0:0]
	for i := 0; i < len(beans); i++ {
		if beans[i].Style == data.SourceFolder {
			//檔案夾
			ids = append(ids, beans[i].Id)
		} else {
			//非檔案夾
			strs = append(strs, fmt.Sprint(beans[i].Id))
		}
	}
	//刪除 非檔案夾
	if len(strs) > 0 {
		str = "id in (" + strings.Join(strs, ",") + ")"
		_, e = session.Where(str).Delete(&data.Imgs{})
		if e != nil {
			return e
		}
	}
	if len(ids) == 0 {
		return nil
	}

	return m.removeFolder(session, ids)
}
func (m Imgs) removeFolder(session *xorm.Session, ids []int64) error {
	//刪除 檔案夾
	strs := make([]string, len(ids))
	for i := 0; i < len(ids); i++ {
		strs[i] = fmt.Sprint(ids[i])
	}
	str := "id in (" + strings.Join(strs, ",") + ")"
	_, e := session.Where(str).Delete(&data.Imgs{})
	if e != nil {
		return e
	}

	//刪除 子項目
	for i := 0; i < len(ids); i++ {
		var beans []data.Imgs
		e = session.Where("pid = ?", ids[i]).Find(&beans)
		if e != nil {
			return e
		}
		if len(beans) < 0 {
			continue
		}
		items := make([]int64, len(beans))
		for j := 0; j < len(beans); j++ {
			items[j] = beans[j].Id
		}
		//remove
		e = m.remove(session, items)
		if e != nil {
			return e
		}
	}
	return nil
}
func (m Imgs) Rename(items []data.SourceRename) error {
	session := NewSession()
	defer session.Close()

	e := session.Begin()
	defer func() {
		if e == nil {
			session.Commit()
		} else {
			session.Rollback()
		}
	}()

	for i := 0; i < len(items); i++ {
		_, e = session.Id(items[i].Id).Update(&data.Imgs{Name: items[i].Name})
		if e != nil {
			return e
		}
	}
	return nil
}

//返回 路徑
func (m Imgs) FindPath(id int64) ([]data.Imgs, error) {
	engine := GetEngine()
	beans := make([]data.Imgs, 0, 10)

	for id != 0 {
		var bean data.Imgs
		if has, e := engine.Id(id).Cols("id", "pid", "name").Get(&bean); e != nil {
			return nil, e
		} else if !has {
			return nil, fmt.Errorf("id not found (%v)", id)
		}
		if bean.Style != data.SourceFolder {
			return nil, fmt.Errorf("source not folder (%v)", id)
		}

		beans = append(beans, bean)
		id = bean.Pid
	}

	return beans, nil
}
