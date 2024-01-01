package Controllers

import (
	Services "massive-uploader-s3/src/Services"

	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func LogController(app *fiber.App, sess *session.Session, db *gorm.DB) {
	app.Get("/logs", func(c *fiber.Ctx) error {
		results, err := Services.GetAllLogs(db)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(200).JSON(fiber.Map{
			"message": "All logs listed successfully",
			"data":    results,
		})
	})
}
