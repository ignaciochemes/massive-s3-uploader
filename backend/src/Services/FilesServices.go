package Services

import (
	"fmt"
	"massive-uploader-s3/src/Daos"
	"massive-uploader-s3/src/Database/Entities"
	"massive-uploader-s3/src/Helpers"
	"massive-uploader-s3/src/Structs"
	"os"
	"sync"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/gofiber/contrib/websocket"
	"gorm.io/gorm"
)

const (
	PartSize = 1024 * 1024 * 5
	RETRIES  = 2
)

type partUploadResult struct {
	completedPart *s3.CompletedPart
	err           error
}

var wg = sync.WaitGroup{}
var ch = make(chan partUploadResult)

func UploadFile(sess *session.Session, files []*Structs.File, bucket string, folder string, wsConnections map[*websocket.Conn]struct{}, db *gorm.DB) error {
	for _, file := range files {
		err := UploadFileToS3Parts(sess, file, bucket, folder, wsConnections)
		s3Location := fmt.Sprint(bucket+"/", folder, file.FileName)
		if err != nil {
			Daos.SaveLog("ERROR", fmt.Sprint("Error uploading file"), Helpers.GetCurrentTimestamp(), db)
			response := map[string]interface{}{
				"messageType": "error",
				"error":       err.Error(),
			}
			for wsConnection := range wsConnections {
				wsConnection.WriteJSON(response)
			}
			return err
		}
		Daos.SaveFile(file, s3Location, db)
		Daos.SaveLog("INFO", fmt.Sprint("File uploaded: ", file.FileName), Helpers.GetCurrentTimestamp(), db)
		response := map[string]interface{}{
			"messageType": "success",
			"fileName":    file.FileName,
			"fileSize":    file.FileSize,
			"extension":   file.Extension,
			"type":        file.Type,
		}
		for wsConnection := range wsConnections {
			wsConnection.WriteJSON(response)
		}
	}
	return nil
}

func ListFiles(sess *session.Session, bucket string, folder string, db *gorm.DB) ([]*Structs.FileResponse, int64, error) {
	svc := s3.New(sess)
	resp, err := svc.ListObjectsV2(&s3.ListObjectsV2Input{
		Bucket: aws.String(bucket),
		Prefix: aws.String(folder),
	})
	if err != nil {
		Daos.SaveLog("ERROR", fmt.Sprint("Error listing files"), Helpers.GetCurrentTimestamp(), db)
		return nil, 0, err
	}
	var filesInfo []*Structs.FileResponse
	var totalSize int64
	for _, item := range resp.Contents {
		if *item.Size == 0 {
			continue
		}
		presignedURL, err := _generatePresignedURL(bucket, *item.Key, db)
		if err != nil {
			return nil, 0, err
		}

		fileInfo := &Structs.FileResponse{
			Key:          *item.Key,
			Size:         *item.Size,
			LastModified: *item.LastModified,
			DownloadLink: presignedURL,
		}
		filesInfo = append(filesInfo, fileInfo)
	}
	totalSize = Helpers.CalculateTotalSize(filesInfo)
	return filesInfo, totalSize, nil
}

func ListFilesFromDB(db *gorm.DB) ([]*Entities.FileEntity, error) {
	files, err := Daos.GetAll(db)
	if err != nil {
		return nil, err
	}
	return files, nil
}

func GetFileInDatabase(locationS3 string, db *gorm.DB) (*Entities.FileEntity, error) {
	file, err := Daos.GetFileByLocationS3(locationS3, db)
	if err != nil {
		return nil, err
	}
	return file, nil
}

func _generatePresignedURL(bucket string, key string, db *gorm.DB) (string, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(os.Getenv("AWS_S3_REGION")),
	})
	if err != nil {
		Daos.SaveLog("ERROR", fmt.Sprint("Error creating session"), Helpers.GetCurrentTimestamp(), db)
		return "", err
	}

	downloader := s3manager.NewDownloader(sess)
	req, _ := downloader.S3.GetObjectRequest(&s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
	url, err := req.Presign(15 * time.Minute)
	if err != nil {
		Daos.SaveLog("ERROR", fmt.Sprint("Error generating presigned URL"), Helpers.GetCurrentTimestamp(), db)
		return "", err
	}

	return url, nil
}
