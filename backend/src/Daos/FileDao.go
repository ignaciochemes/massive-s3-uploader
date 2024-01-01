package Daos

import (
	"massive-uploader-s3/src/Database/Entities"
	"massive-uploader-s3/src/Structs"

	"gorm.io/gorm"
)

func SaveFile(file *Structs.File, s3Location string, db *gorm.DB) error {
	fileEntity := &Entities.FileEntity{
		Name:       file.FileName,
		Extension:  file.Extension,
		Type:       file.Type,
		Size:       file.FileSize,
		LocationS3: s3Location,
	}
	err := db.Create(fileEntity).Error
	if err != nil {
		return err
	}
	return nil
}

func GetAll(db *gorm.DB) ([]*Entities.FileEntity, error) {
	files := []*Entities.FileEntity{}
	err := db.Order("id desc").Find(&files).Error
	if err != nil {
		return nil, err
	}
	return files, nil
}

func GetFileByLocationS3(locationS3 string, db *gorm.DB) (*Entities.FileEntity, error) {
	file := &Entities.FileEntity{}
	err := db.Where("location_s3 = ?", locationS3).First(file).Error
	if err != nil {
		return nil, err
	}
	return file, nil
}
