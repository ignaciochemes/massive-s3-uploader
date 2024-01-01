package Controllers

import (
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/gofiber/fiber/v2"

	Services "massive-uploader-s3/src/Services"
)

func AwsController(app *fiber.App, sess *session.Session) {
	app.Get("/aws/folders", func(c *fiber.Ctx) error {
		bucket := c.Query("bucket")
		if bucket == "" {
			return c.Status(400).JSON(fiber.Map{
				"message": "Error, you need to send a bucket",
			})
		}
		resp, err := Services.ListBucketFolders(sess, bucket)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{
				"message": "Error on get bucket folders",
			})
		}
		return c.Status(200).JSON(fiber.Map{
			"message": "Folders listed successfully",
			"data":    resp,
		})
	})

	app.Get("/aws/buckets", func(c *fiber.Ctx) error {
		resp, err := Services.ListBuckets(sess)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{
				"message": "Error on get buckets",
			})
		}
		return c.Status(200).JSON(fiber.Map{
			"message": "Buckets listed successfully",
			"data":    resp,
		})
	})
}
