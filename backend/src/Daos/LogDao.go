package Daos

import (
	"massive-uploader-s3/src/Database/Entities"

	"gorm.io/gorm"
)

func SaveLog(level string, message string, timestamp int, db *gorm.DB) error {
	logEntity := &Entities.LogEntity{
		Level:     level,
		Message:   message,
		TimeStamp: timestamp,
	}
	err := db.Create(logEntity).Error
	if err != nil {
		return err
	}
	return nil
}

func GetAllLogs(db *gorm.DB) ([]Entities.LogEntity, error) {
	var results []Entities.LogEntity
	err := db.Order("id desc").Limit(100).Find(&results).Error
	if err != nil {
		return nil, err
	}
	return results, nil
}
