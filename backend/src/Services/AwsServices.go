package Services

import (
	"bytes"
	"fmt"
	"massive-uploader-s3/src/Structs"
	"os"
	"sort"
	"sync"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/gofiber/contrib/websocket"
)

func CreateS3Session() *session.Session {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(os.Getenv("AWS_S3_REGION")),
		Credentials: credentials.NewStaticCredentials(
			os.Getenv("AWS_ACCESS_KEY_ID"),
			os.Getenv("AWS_SECRET_ACCESS_KEY"),
			"",
		),
	})
	if err != nil {
		panic(err)
	}
	return sess
}

func ListBuckets(sess *session.Session) ([]string, error) {
	svc := s3.New(sess)
	resp, err := svc.ListBuckets(nil)
	if err != nil {
		return nil, err
	}
	var buckets []string
	for _, bucket := range resp.Buckets {
		buckets = append(buckets, *bucket.Name)
	}
	return buckets, nil
}

func ListBucketFolders(sess *session.Session, bucket string) ([]string, error) {
	svc := s3.New(sess)
	resp, err := svc.ListObjectsV2(&s3.ListObjectsV2Input{
		Bucket:    aws.String(bucket),
		Delimiter: aws.String("/"),
	})
	if err != nil {
		return nil, err
	}
	var folders []string
	for _, commonPrefix := range resp.CommonPrefixes {
		folders = append(folders, *commonPrefix.Prefix)
	}
	return folders, nil
}

func UploadFileToS3(sess *session.Session, file *Structs.File, bucket string, folder string) error {
	uploader := s3manager.NewUploader(sess)
	_, err := uploader.Upload(&s3manager.UploadInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(folder + "/" + file.FileName),
		Body:   bytes.NewReader(file.Content),
	})
	if err != nil {
		return err
	}
	return nil
}

func UploadFileToS3Parts(sess *session.Session, file *Structs.File, bucket string, folder string, wsConnections map[*websocket.Conn]struct{}) error {
	expiryDate := time.Now().AddDate(0, 0, 1)
	svc := s3.New(sess)
	_, err := svc.HeadObject(&s3.HeadObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(folder + "/" + file.FileName),
	})
	if err == nil {
		return fmt.Errorf("File already exists")
	}
	createResp, err := svc.CreateMultipartUpload(&s3.CreateMultipartUploadInput{
		Bucket:  aws.String(bucket),
		Key:     aws.String(folder + "/" + file.FileName),
		Expires: &expiryDate,
	})
	if err != nil {
		return err
	}
	buffer := make([]byte, file.FileSize)
	wsResponseCreateFileBuffer := map[string]interface{}{
		"messageType": "uploadingLog",
		"log":         fmt.Sprintf("Creating buffer of %v bytes", file.FileSize),
		"date":        fmt.Sprintf("%v", time.Now().Format("2006-01-02 15:04:05")),
	}
	for wsConnection := range wsConnections {
		wsConnection.WriteJSON(wsResponseCreateFileBuffer)
	}
	var start, currentSize int
	var remaining = int(file.FileSize)
	var partNumber int = 1
	var completedParts []*s3.CompletedPart
	ch := make(chan partUploadResult)

	wsResponseFileCompletedParts := map[string]interface{}{
		"messageType": "uploadingLog",
		"log":         fmt.Sprintf("Completed parts: %v", len(completedParts)),
		"date":        fmt.Sprintf("%v", time.Now().Format("2006-01-02 15:04:05")),
	}
	for wsConnection := range wsConnections {
		wsConnection.WriteJSON(wsResponseFileCompletedParts)
	}

	for start = 0; remaining > 0; start += PartSize {
		wg.Add(1)
		if remaining < PartSize {
			currentSize = remaining
		} else {
			currentSize = PartSize
		}
		go _uploadToS3(createResp, buffer[start:start+currentSize], partNumber, &wg, ch, svc)

		remaining -= currentSize
		fmt.Printf("Uploading of part %v started and remaining is %v \n", partNumber, remaining)
		response := map[string]interface{}{
			"messageType": "uploadingLog",
			"log":         fmt.Sprintf("Uploading of part %v started and remaining is %v \n", partNumber, remaining),
			"date":        fmt.Sprintf("%v", time.Now().Format("2006-01-02 15:04:05")),
		}
		for wsConnection := range wsConnections {
			wsConnection.WriteJSON(response)
		}
		partNumber++
	}

	go func() {
		wg.Wait()
		close(ch)
	}()

	for result := range ch {
		if result.err != nil {
			_, err = svc.AbortMultipartUpload(&s3.AbortMultipartUploadInput{
				Bucket:   aws.String(bucket),
				Key:      aws.String(folder + "/" + file.FileName),
				UploadId: createResp.UploadId,
			})
			if err != nil {
				os.Exit(1)
			}
		}
		fmt.Printf("Uploading of part %v has been finished \n", *result.completedPart.PartNumber)
		response := map[string]interface{}{
			"messageType": "uploadingLog",
			"log":         fmt.Sprintf("Uploading of part %v has been finished \n", *result.completedPart.PartNumber),
			"date":        fmt.Sprintf("%v", time.Now().Format("2006-01-02 15:04:05")),
		}
		for wsConnection := range wsConnections {
			wsConnection.WriteJSON(response)
		}
		completedParts = append(completedParts, result.completedPart)
	}

	sort.Slice(completedParts, func(i, j int) bool {
		return *completedParts[i].PartNumber < *completedParts[j].PartNumber
	})
	resp, err := svc.CompleteMultipartUpload(&s3.CompleteMultipartUploadInput{
		Bucket:   createResp.Bucket,
		Key:      createResp.Key,
		UploadId: createResp.UploadId,
		MultipartUpload: &s3.CompletedMultipartUpload{
			Parts: completedParts,
		},
	})
	if err != nil {
		fmt.Print(err)
		return err
	}
	fmt.Printf("Successfully uploaded file: %v \n", resp)
	return nil
}

func _uploadToS3(resp *s3.CreateMultipartUploadOutput, fileBytes []byte, partNum int, wg *sync.WaitGroup, ch chan partUploadResult, svc *s3.S3) {
	defer wg.Done()
	var try int
	fmt.Printf("Uploading %v \n", len(fileBytes))
	for try <= RETRIES {
		uploadRes, err := svc.UploadPart(&s3.UploadPartInput{
			Body:          bytes.NewReader(fileBytes),
			Bucket:        resp.Bucket,
			Key:           resp.Key,
			PartNumber:    aws.Int64(int64(partNum)),
			UploadId:      resp.UploadId,
			ContentLength: aws.Int64(int64(len(fileBytes))),
		})
		if err != nil {
			if try == RETRIES {
				ch <- partUploadResult{nil, err}
				return
			} else {
				try++
				time.Sleep(time.Duration(time.Second * 15))
			}
		} else {
			ch <- partUploadResult{
				&s3.CompletedPart{
					ETag:       uploadRes.ETag,
					PartNumber: aws.Int64(int64(partNum)),
				}, nil,
			}
			return
		}
	}
	ch <- partUploadResult{}
}
