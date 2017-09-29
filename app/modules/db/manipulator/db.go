package manipulator

import (
	_ "github.com/go-sql-driver/mysql"
	"github.com/go-xorm/xorm"
	"github.com/revel/revel"
	"king-bbs/app/modules/crypto"
	"king-bbs/app/modules/db/data"
	"strings"
	"time"
)

var g_engine *xorm.Engine

func Initialize() {
	//get configure
	driver, _ := revel.Config.String("database.driver")
	if driver == "" {
		panic("database.driver not configure at  app.conf")
	}
	source, _ := revel.Config.String("database.source")
	if source == "" {
		panic("database.source not configure at app.conf")
	}

	//create engine
	var err error
	g_engine, err = xorm.NewEngine(driver, source)
	if err != nil {
		panic(err)
	}
	if err = g_engine.Ping(); err != nil {
		panic(err)
	}

	//show sql
	showsql, _ := revel.Config.String("database.showsql")
	showsql = strings.ToLower(showsql)
	if showsql != "" && showsql != "0" && showsql != "false" {
		g_engine.ShowSQL(true)
	}

	//keep live
	interval, _ := revel.Config.Int("database.keeplive")
	if interval < 10 {
		interval = 60
	}
	go func(interval int) {
		for {
			time.Sleep(time.Minute * time.Duration(interval))
			g_engine.Ping()
		}
	}(interval)

	//init table
	var bean data.User
	initTable(&bean)
	if has, err := GetEngine().Cols("id").Get(bean); err != nil {
		panic(err)
	} else if !has {
		//獲取 默認 root 配置
		name, _ := revel.Config.String("root.name")
		if name == "" {
			panic("root.name not configure at  app.conf")
		}
		email, _ := revel.Config.String("root.email")
		if email == "" {
			panic("root.email not configure at  app.conf")
		}
		pwd, _ := revel.Config.String("root.pwd")
		if pwd == "" {
			panic("root.pwd not configure at  app.conf")
		}
		pwd = crypto.GetSha512(pwd)

		//插入 初始化 管理員
		if _, err = GetEngine().InsertOne(&data.User{Name: name,
			Email:  email,
			Pwd:    pwd,
			Status: data.USER_STATUS_ACTIVE,
			Root:   true,
		}); err != nil {
			panic(err)
		}
	}
	initTable(&data.Source{})
	initTable(&data.Imgs{})
}
func initTable(bean interface{}) {
	engine := GetEngine()
	if ok, err := engine.IsTableExist(bean); err != nil {
		panic(err)
	} else if ok {
		engine.Sync2(bean)
	} else {
		if err = engine.CreateTables(bean); err != nil {
			panic(err)
		}
		if err = engine.CreateIndexes(bean); err != nil {
			panic(err)
		}
		if err = engine.CreateUniques(bean); err != nil {
			panic(err)
		}
	}
}
func GetEngine() *xorm.Engine {
	return g_engine
}
func NewSession() *xorm.Session {
	return g_engine.NewSession()
}
