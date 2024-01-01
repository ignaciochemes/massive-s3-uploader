import React, { useEffect, useState } from "react";
import axios from "axios";
import NewSpinner from "../Spinner";
import { Table } from "react-bootstrap";

const LogsTableInformation: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [logList, setLogList] = useState<any[]>([]);

    useEffect(() => {
        handleGetLogs();
    }, []);

    const handleGetLogs = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/logs`);
            setLogList(response.data.data);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            margin: '10px',
            height: 'auto',
        }}>
            <h3 style={{
                background: 'rgb(59, 76, 89)',
                color: '#fff',
                padding: '5px 10px',
                borderRadius: '2px',
                marginBottom: '10px',
            }}>
                System logs
            </h3>
            {loading && <NewSpinner />}
            {logList.length > 0 ? (
                <>
                    <Table striped bordered hover variant="dark" responsive size='m' style={{
                        fontSize: '14px',
                    }}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Level</th>
                                <th>Message</th>
                                <th style={{
                                    width: '300px',
                                    minWidth: '300px',
                                }}>
                                    Create Date
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {logList.map((log: any, index) => (
                                <tr key={index}>
                                    <td>{log.ID}</td>
                                    <td style={{
                                        color: log.Level === 'ERROR' ? 'rgb(249, 90, 83)' : 'rgb(68, 132, 48)',
                                    }}>{log.Level}</td>
                                    <td>{log.Message}</td>
                                    <td>{log.CreatedAt}</td>
                                </tr>
                            )
                            )}
                        </tbody>
                    </Table>
                </>
            ) : (
                <div style={{
                    textAlign: 'center',
                    fontSize: '20px',
                    color: '#fff',
                }}>
                    No logs to show
                </div>

            )}
        </div>
    );
}

export default LogsTableInformation;