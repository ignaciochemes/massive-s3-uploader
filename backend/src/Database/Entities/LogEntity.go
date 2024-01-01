package Entities

import "gorm.io/gorm"

type LogEntity struct {
	gorm.Model
	ID        int    `gorm:"primaryKey;autoIncrement:true"`
	Level     string `gorm:"type:varchar(255);not null"`
	Message   string `gorm:"type:varchar(255);not null"`
	TimeStamp int    `gorm:"type:int;not null"`
}
