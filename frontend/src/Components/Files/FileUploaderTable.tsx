import React, { Fragment, useEffect, useState } from "react"
import { Card, Table } from "react-bootstrap";
import { FormatBytes } from "../../Helpers/Functions";
import FileUploadProcess from "./FileUploadProcess";
import WebSocketUploaderLogs from "../Websocket/WebSocketUploaderLogs";

interface FileUploaderTableProps {
    files: Blob[];
    uploadProgress: Record<string, number>;
    message?: any;
}

const FileUploaderTable: React.FC<FileUploaderTableProps> = ({ files, uploadProgress, message }) => {
    const [selectedFile, setSelectedFile] = useState<number | null>(null);
    const [logs, setLogs] = useState<any[][]>([]);

    const handleRowClick = (index: number) => {
        setSelectedFile((prevSelectedFile) => (prevSelectedFile === index ? null : index));
    };

    useEffect(() => {
        if (message) {
            const parsedMessage = JSON.parse(message.data);
            if (parsedMessage?.messageType === "uploadingLog") {
                setLogs((prevLogs) => {
                    const currentIndex = selectedFile !== null ? selectedFile : 0;
                    const newLogs = [...prevLogs];
                    if (!newLogs[currentIndex]) {
                        newLogs[currentIndex] = [];
                    }
                    newLogs[currentIndex].push({
                        log: parsedMessage.log,
                        date: parsedMessage.date,
                    });
                    return newLogs;
                });
            }
        }
    }, [message, selectedFile]);


    return (
        <>
            <Table striped bordered hover variant="dark" responsive size='m' style={{
                fontSize: '14px',
                marginTop: '20px',
            }}>
                <tbody>
                    {files.map((file: any, index: number) => (
                        <Fragment key={index}>
                            <tr onClick={() => handleRowClick(index)} style={{ cursor: "pointer" }}>
                                <td>{index}</td>
                                <td>{file.name}</td>
                                <td style={{
                                    width: '250px',
                                    minWidth: '250px',
                                }}>
                                    <FileUploadProcess file={file} uploadProgress={uploadProgress} /></td>
                                <td>{FormatBytes(file.size)}</td>
                            </tr>
                            {selectedFile === index && (
                                <tr>
                                    <td colSpan={4}>
                                        <Card style={{
                                            width: '100%',
                                            minWidth: '100%',
                                            maxWidth: '100%',
                                            borderRadius: '2px',
                                            backgroundColor: '#212529'
                                        }}>
                                            <Card.Body style={{
                                                padding: '0',
                                                margin: '0',
                                            }}>
                                                <WebSocketUploaderLogs messages={logs[selectedFile] || []} />
                                            </Card.Body>
                                        </Card>
                                    </td>
                                </tr>
                            )}
                        </Fragment>
                    ))}
                </tbody>
            </Table>

        </>
    )
};

export default FileUploaderTable;