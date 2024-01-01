package Controllers

import "github.com/gofiber/fiber/v2"

func HealthCheckController(app *fiber.App) {
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(200).JSON(fiber.Map{
			"message": "Server is running",
		})
	})
}
