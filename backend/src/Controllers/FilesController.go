package Controllers

import (
	"io/ioutil"
	"log"
	"sync"

	Services "massive-uploader-s3/src/Services"
	"massive-uploader-s3/src/Structs"

	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

var wsConnections = make(map[*websocket.Conn]struct{})
var wsMutex sync.Mutex

func FilesController(app *fiber.App, sess *session.Session, db *gorm.DB) {

	app.Get("/ws", websocket.New(func(c *websocket.Conn) {
		wsMutex.Lock()
		defer wsMutex.Unlock()
		wsConnections[c] = struct{}{}
		defer delete(wsConnections, c)
		log.Println("Nueva conexión WebSocket establecida")
		defer c.Close()
		messageChannel := make(chan string, 1)
		go func() {
			for {
				_, _, err := c.ReadMessage()
				if err != nil {
					log.Println(err)
					close(messageChannel)
					return
				}
			}
		}()
		select {
		case <-messageChannel:
			return
		}
	}))

	app.Post("/files/upload", func(c *fiber.Ctx) error {
		bucket := c.Query("bucket")
		folder := c.Query("folder")
		if bucket == "" {
			return c.Status(400).JSON(fiber.Map{
				"message": "Error, you need to send a bucket",
			})
		}
		if folder == "" {
			return c.Status(400).JSON(fiber.Map{
				"message": "Error, you need to send a folder",
			})
		}
		if c.Request().Header.ContentLength() > 1024*1024*2048 {
			return c.Status(413).JSON(fiber.Map{
				"message": "Files size is greater than 2.14GB",
			})
		}
		form, err := c.MultipartForm()
		if err != nil {
			return c.Status(500).JSON(fiber.Map{
				"message": "Error, you need to send files",
			})
		}
		var files []*Structs.File
		for _, fileHeader := range form.File["files"] {
			file, err := fileHeader.Open()
			if err != nil {
				return c.Status(500).JSON(fiber.Map{
					"message": "Error on upload file",
				})
			}
			defer file.Close()
			fileContent, err := ioutil.ReadAll(file)
			if err != nil {
				return c.Status(500).JSON(fiber.Map{
					"message": "Error on upload file",
				})
			}

			fileData := &Structs.File{
				FileName:  fileHeader.Filename,
				FileSize:  fileHeader.Size,
				Extension: fileHeader.Filename[len(fileHeader.Filename)-3:],
				Type:      fileHeader.Header.Get("Content-Type"),
				Content:   fileContent,
			}
			files = append(files, fileData)
		}

		Services.UploadFile(sess, files, bucket, folder, wsConnections, db)

		return nil
	})

	app.Get("/files/list/s3", func(c *fiber.Ctx) error {
		bucket := c.Query("bucket")
		folder := c.Query("folder")
		if bucket == "" {
			return c.Status(400).JSON(fiber.Map{
				"message": "Error, you need to send a bucket",
			})
		}
		files, totalSize, err := Services.ListFiles(sess, bucket, folder, db)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{
				"message": "Error on list files",
			})
		}
		return c.Status(200).JSON(fiber.Map{
			"message":   "All files listed successfully",
			"data":      files,
			"totalSize": totalSize,
		})
	})

	app.Get("/files/list", func(c *fiber.Ctx) error {
		files, err := Services.ListFilesFromDB(db)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{
				"message": "Error on list files",
			})
		}
		return c.Status(200).JSON(fiber.Map{
			"message": "All files listed successfully",
			"data":    files,
		})
	})

}
