package manipulator

type Source struct {
	Manipulator
}

//創建一個 上傳 檔案 返回檔案 id 已上傳分塊id
func (m Source) NewFile(hash, name string, style int) (int64, []int64, error) {
	session := NewSession()
	defer session.Close()

	e := session.Begin()
	if e != nil {
		return 0, nil, e
	}
	defer session.Commit()

	return 0, nil, nil
}
