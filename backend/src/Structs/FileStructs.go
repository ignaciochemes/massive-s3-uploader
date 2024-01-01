package Structs

import "time"

type File struct {
	FileName  string
	FileSize  int64
	Extension string
	Type      string
	Content   []byte
}
type FileResponse struct {
	Key          string    `json:"key"`
	Size         int64     `json:"size"`
	LastModified time.Time `json:"lastModified"`
	DownloadLink string    `json:"downloadLink"`
}
