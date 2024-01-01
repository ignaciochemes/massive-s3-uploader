package Database

import (
	"fmt"
	"log"
	Entities "massive-uploader-s3/src/Database/Entities"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type DatabaseInstance struct {
	DB *gorm.DB
}

var instance *DatabaseInstance

func NewDatabaseInstance() *DatabaseInstance {
	if instance == nil {
		instance = &DatabaseInstance{}
		instance.connect()
	}
	return instance
}

func (dbInstance *DatabaseInstance) connect() {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", os.Getenv("DATABASE_USER"), os.Getenv("DATABASE_PASSWORD"), os.Getenv("DATABASE_HOST"), os.Getenv("DATABASE_PORT"), os.Getenv("DATABASE_NAME"))
	db, err := gorm.Open(mysql.New(mysql.Config{
		DSN: dsn,
	}), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	log.Println("Database connected")
	db.AutoMigrate(&Entities.FileEntity{})
	db.AutoMigrate(&Entities.LogEntity{})
	dbInstance.DB = db
}
