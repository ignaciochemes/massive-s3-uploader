import React, { useEffect, useState } from "react";
import axios from 'axios';
import NewSpinner from "../Spinner";
import { Table } from "react-bootstrap";
import { FormatBytes } from "../../Helpers/Functions";

const TableDbInformation: React.FC = () => {
    const [loadingFiles, setLoadingFiles] = useState<boolean>(false);
    const [files, setFiles] = useState<[]>([]);

    useEffect(() => {
        handleFiles();
    }, [])

    const handleFiles = async () => {
        try {
            setLoadingFiles(true);
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/files/list`);
            setFiles(response.data.data);
        } catch (error) {
            console.log("Error fetching files", error);
        } finally {
            setLoadingFiles(false);
        }
    }

    return (
        <div style={{
            margin: '10px',
            height: 'auto'
        }}>
            <h3 style={{
                background: 'rgb(59, 76, 89)',
                color: '#fff',
                padding: '5px 10px',
                borderRadius: '2px',
                marginBottom: '10px',
            }}>
                Last files uploaded to the database
            </h3>
            {loadingFiles && <NewSpinner />}
            {!loadingFiles && files.length > 0 && (
                <Table striped bordered hover variant="dark" responsive size='m' style={{
                    fontSize: '14px',
                }}>
                    <thead>
                        <tr>
                            <th style={{
                                width: '25px',
                                minWidth: '25px',
                            }}>
                                #
                            </th>
                            <th>Name</th>
                            <th style={{
                                width: '300px',
                                minWidth: '300px',
                            }}>
                                Upload Date
                            </th>
                            <th style={{
                                width: '100px',
                                minWidth: '100px',
                            }}>
                                Size
                            </th>
                            <th style={{
                                width: '60px',
                                minWidth: '60px',
                            }}>
                                S3
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map((file: any, index: number) => (
                            <tr key={index}>
                                <td>{file.ID}</td>
                                <td className="d-flex justify-content-between" style={{
                                    alignItems: 'center',
                                }}>{file.Name}</td>
                                <td>{file.CreatedAt}</td>
                                <td>{file?.Size ? FormatBytes(file.Size) : '0'}</td>
                                <td>{file.LocationS3 ? 'Yes' : 'No'}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </div>
    );
};

export default TableDbInformation;