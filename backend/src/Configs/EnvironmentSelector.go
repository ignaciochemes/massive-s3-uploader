package Configurations

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func EnvironmentSelector() {
	args := os.Args
	if len(args) < 2 {
		log.Fatal("No parameter provided")
		return
	}
	env := args[1]

	var envFile string
	switch env {
	case "local":
		envFile = ".env.local"
	case "dev":
		envFile = ".env.dev"
	case "prod":
		envFile = ".env"
	default:
		log.Println("Invalid args. Please provide a valid environment")
		return
	}

	err := godotenv.Load(envFile)
	if err != nil {
		log.Printf("Error loading %s file", envFile)
		return
	}

	log.Printf("Environment %s loaded", env)
}
