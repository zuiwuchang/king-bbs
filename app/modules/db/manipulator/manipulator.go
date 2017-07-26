package manipulator

type Manipulator struct {
}

func (m Manipulator) Get(bean interface{}, cols ...string) (bool, error) {
	return GetEngine().Cols(cols...).Get(bean)
}
