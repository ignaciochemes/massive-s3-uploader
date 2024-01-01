# Massive Uploader S3 - MUS3

This is a project that implements a bulk file upload service to Amazon S3, accompanied by a user interface for visualizing and managing the uploaded files.

![262shots_so](https://github.com/ignaciochemes/massive-uploader-s3/assets/54911521/73b7e474-b879-4384-b8df-0a5ed4af43e0)

## Features

- Seamless AWS S3 integration for file uploads.
- Real-time WebSocket notifications for upload progress.
- Modern and responsive user interface.

## Technologies

- **Backend:**
  - Go (Golang)
  - Fiber (Web Framework)
  - AWS SDK for Go (S3 Integration)
  - Fiber WebSocket (WebSocket Communication)

- **Frontend:**
  - React
  - Vite.js (Build Tool)
  - Axios (HTTP Requests)
  - WebSocket API

## Backend

### Prerequisites

- Go (v1.16 or higher)
- AWS CLI (to configure Amazon S3 credentials)
- Project dependencies (can be installed by running `go get ./...` in the project directory)

### Configuration

1. Configure AWS credentials by running `aws configure`.

2. Copy the `.env.example` file to `.env.local` and fill in the required environment variables.

### Execution

To start the backend, run the following command:

```bash
go run main.go local (or go run main.go prod)
```

or
```bash
air local (or air prod)
```

The server will be available at http://localhost:33003 by default.

## Frontend

## Prerequisites

- Node.js (v14 or higher)
- npm (installed with Node.js)
- Vite.js (installed globally using `npm install -g create-vite`)

## Configuration

1. Navigate to the frontend directory (`/frontend`) from the project root.
2. Copy the `.env.example` file to `.env` and fill in the required environment variables.

## Installation

Run the following commands to install dependencies and start the application:

```bash
npm install
npm run dev
```
The application will be available at http://localhost:5173/ by default.

## Usage

1. **Backend Setup:**
   - Ensure you have Go installed (version 1.17 or higher).
   - Navigate to the backend directory (`/backend`) from the project root.
   - Copy the `.env.example` file to `.env` and fill in the required environment variables.
   - Run the following commands to install dependencies and start the backend server:

     ```bash
     go mod tidy
     go run main.go
     ```

   - The backend will be available at `http://localhost:33003` by default.

2. **Frontend Setup:**
   - Navigate to the frontend directory (`/frontend`) from the project root.
   - Copy the `.env.example` file to `.env` and fill in the required environment variables.
   - Run the following commands to install dependencies and start the frontend application:

     ```bash
     npm install
     npm run dev
     ```

   - The frontend will be available at `http://localhost:5173` by default.

3. **Application Workflow:**
   - Access the frontend via a web browser.
   - Upload files using the user interface.
   - View the list of uploaded files and perform actions such as downloading or viewing their file content.

4. **Contributing:**
   - Feel free to contribute to the project by opening issues or submitting pull requests. All help is welcome!

5. **License:**
   - This project is licensed under the [MIT License](../LICENSE).
