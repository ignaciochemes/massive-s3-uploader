package Controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/monitor"
)

func MonitorController(app *fiber.App) {
	app.Get("/monitor/metrics", monitor.New(
		monitor.Config{
			Title: "Massive Uploader S3 backend - Metrics",
		}),
	)
}
