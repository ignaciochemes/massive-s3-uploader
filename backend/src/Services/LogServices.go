package Services

import (
	"fmt"
	"massive-uploader-s3/src/Daos"
	"massive-uploader-s3/src/Database/Entities"

	"gorm.io/gorm"
)

func SaveLog(level string, message string, timestamp int, db *gorm.DB) error {
	err := Daos.SaveLog(level, message, timestamp, db)
	if err != nil {
		return fmt.Errorf("Error saving log: %v", err)
	}
	return nil
}

func GetAllLogs(db *gorm.DB) ([]Entities.LogEntity, error) {
	results, err := Daos.GetAllLogs(db)
	if err != nil {
		return nil, err
	}
	return results, nil
}
