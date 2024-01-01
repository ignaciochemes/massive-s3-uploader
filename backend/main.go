package main

import (
	"encoding/json"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/requestid"

	Configurations "massive-uploader-s3/src/Configs"
	"massive-uploader-s3/src/Controllers"
	"massive-uploader-s3/src/Database"
	"massive-uploader-s3/src/Services"
)

func main() {
	Configurations.EnvironmentSelector()
	DbInstance := Database.NewDatabaseInstance()
	db := DbInstance.DB

	var sess = Services.CreateS3Session()

	app := fiber.New(fiber.Config{
		AppName:           "massive-uploader-s3",
		JSONEncoder:       json.Marshal,
		JSONDecoder:       json.Unmarshal,
		CaseSensitive:     true,
		StrictRouting:     true,
		ServerHeader:      "massive-uploader-s3-ms",
		EnablePrintRoutes: false,
		BodyLimit:         1024 * 1024 * 2048,
	})
	app.Server().MaxConnsPerIP = 10
	app.Use(requestid.New())
	app.Use(logger.New(logger.Config{
		Format: "${pid} ${locals:requestid} ${status} - ${method} ${path}​\n",
	}))

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	app.Use(func(c *fiber.Ctx) error {
		c.Set("Content-Type", "application/json")
		return c.Next()
	})

	Controllers.HealthCheckController(app)
	Controllers.FilesController(app, sess, db)
	Controllers.MonitorController(app)
	Controllers.AwsController(app, sess)
	Controllers.LogController(app, sess, db)

	app.Listen(os.Getenv("PORT"))
}
