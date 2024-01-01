package Helpers

import (
	"massive-uploader-s3/src/Structs"
	"time"
)

func CalculateTotalSize(files []*Structs.FileResponse) int64 {
	var totalSize int64
	for _, file := range files {
		totalSize += file.Size
	}
	return totalSize
}

func GetCurrentTimestamp() int {
	return int(time.Now().Unix())
}
