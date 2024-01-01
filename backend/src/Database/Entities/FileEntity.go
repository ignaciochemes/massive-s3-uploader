package Entities

import "gorm.io/gorm"

type FileEntity struct {
	gorm.Model
	ID         int    `gorm:"primaryKey;autoIncrement:true"`
	Name       string `gorm:"type:varchar(255);not null"`
	Extension  string `gorm:"type:varchar(255);not null"`
	Type       string `gorm:"type:varchar(255);not null"`
	Size       int64  `gorm:"type:int;not null"`
	LocationS3 string `gorm:"type:varchar(255);not null"`
}
