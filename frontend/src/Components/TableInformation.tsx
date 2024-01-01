import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import { FormatBytes } from '../Helpers/Functions';
import copy from 'clipboard-copy';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faDownload, faEye } from '@fortawesome/free-solid-svg-icons';
import NewSpinner from './Spinner';
import { Button, Col, Form, Row, Table } from 'react-bootstrap';

const ITEMS_PER_PAGE = 15;

interface File {
    data: File[];
    totalSize: number;
}

const TableInformation: React.FC = () => {
    const [loadingFiles, setLoadingFiles] = useState<boolean>(false);
    const [files, setFiles] = useState<File | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [modalVisible, setModalVisible] = useState(false);
    const [fileLoadingState, setFileLoadingState] = useState<Record<number, boolean>>({});
    const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [folders, setFolders] = useState<string[]>([]);
    const [buckets, setBuckets] = useState<string[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string>('');
    const [selectedBucket, setSelectedBucket] = useState<string>('');

    useEffect(() => {
        if (selectedFolder === '' || selectedBucket === '') {
            fetchBuckets();
            setCurrentPage(1);
        }

        if (selectedBucket !== '') {
            fetchFolders();
            setCurrentPage(1);
        }
        if (selectedFolder !== '') {
            fetchFiles();
            setCurrentPage(1);
        }
    }, [selectedBucket, selectedFolder]);

    const fetchBuckets = async () => {
        await axios.get(`${process.env.REACT_APP_API_URL}/aws/buckets`)
            .then(response => {
                setBuckets(response.data.data);
            })
            .catch(error => {
                console.error('Error fetching bucket:', error);
            });
    }

    const fetchFolders = async () => {
        await axios.get(`${process.env.REACT_APP_API_URL}/aws/folders?bucket=${selectedBucket}`)
            .then(response => {
                if (response.data.data.length === 0) {
                    setFolders(['']);
                }
                setFolders(response.data.data);
            })
            .catch(error => {
                console.error('Error fetching folders:', error);
            });
    }

    const fetchFiles = async () => {
        try {
            setLoadingFiles(true);
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/files/list/s3?bucket=${selectedBucket}&folder=${selectedFolder}`);
            setFiles(response.data);
        } catch (error) {
            setFiles(null);
        } finally {
            setLoadingFiles(false);
        }
    };

    const handleViewFile = async (downloadLink: string, index: number) => {
        setFileLoadingState((prevState) => ({
            ...prevState,
            [index]: true,
        }));
        try {
            const response = await axios.get(downloadLink);
            Papa.parse(response.data, {
                complete: (result) => {
                    setSelectedFileContent(JSON.stringify(result.data, null, 2));
                },
                header: true,
            });
            setModalVisible(true);
        } catch (error) {
            console.error('Fetch data error:', error);
        } finally {
            setFileLoadingState((prevState) => ({
                ...prevState,
                [index]: false,
            }));
        }
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleDownload = (downloadLink) => {
        window.location.href = downloadLink;
    };

    const handleCopyKey = (key: string, index: number) => {
        copy(key);
        setCopiedIndex(index);
    };

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

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
                Last files uploaded to S3
            </h3>
            {loadingFiles && <NewSpinner />}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '10px',
            }}>
                <label>
                    <Form>
                        <Row>
                            <Col>
                                <Form.Select
                                    value={selectedBucket}
                                    onChange={(e) => setSelectedBucket(e.target.value)}
                                    style={{
                                        borderRadius: '2px',
                                    }}
                                >
                                    <option value="">-- Select Bucket --</option>
                                    {buckets.map((bucket, index) => (
                                        <option key={index} value={bucket}>
                                            {bucket}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col>
                                <Form.Select
                                    value={selectedFolder}
                                    onChange={(e) => setSelectedFolder(e.target.value)}
                                    style={{
                                        borderRadius: '2px',
                                    }}
                                >
                                    <option value="">-- Select folder --</option>
                                    {folders.map((folder, index) => (
                                        <option key={index} value={folder}>
                                            {folder}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>
                        </Row>
                    </Form>
                </label>
            </div>
            {files !== null ? (
                <>
                    <p style={{
                        background: 'rgb(59, 76, 89)',
                        color: '#fff',
                        padding: '5px 10px',
                        borderRadius: '2px',
                        marginBottom: '10px',
                    }}>
                        Bucket total usage: {FormatBytes(files.totalSize)}
                    </p>
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
                                <th>Key</th>
                                <th style={{
                                    width: '100px',
                                    minWidth: '100px',
                                }}>
                                    Size</th>
                                <th style={{
                                    width: '250px',
                                    minWidth: '250px',
                                }}>
                                    Creation Date
                                </th>
                                <th style={{
                                    width: '100px',
                                    minWidth: '100px',
                                }}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {files?.data?.slice(startIndex, endIndex).map((file: any, index) => (
                                <tr key={index}>
                                    <td>{startIndex + index + 1}</td>
                                    <td className="d-flex justify-content-between" style={{
                                        alignItems: 'center',
                                    }}>
                                        {file.key ? (
                                            <>
                                                <span>{file.key}</span>
                                                <Button
                                                    onClick={() => handleCopyKey(file.key, index)}
                                                    disabled={copiedIndex === index}
                                                    size='sm'
                                                    style={{
                                                        fontSize: '10px',
                                                        backgroundColor: 'rgb(239, 240, 243)',
                                                        borderColor: 'rgb(239, 240, 243)',
                                                        color: '#000',
                                                        borderRadius: '2px',
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faCopy} />
                                                </Button>
                                            </>
                                        ) : (
                                            'Key not found'
                                        )}
                                    </td>
                                    <td>{file?.size ? FormatBytes(file.size) : 'No Size'}</td>
                                    <td>{file?.lastModified ? new Date(file.lastModified).toLocaleString() : 'Date not found'}</td>
                                    <td>
                                        {file?.downloadLink && (
                                            <div>
                                                <Button
                                                    onClick={() => handleDownload(file.downloadLink)}
                                                    size='sm'
                                                    style={{
                                                        fontSize: '10px',
                                                        marginRight: '5px',
                                                        backgroundColor: '#146eb4',
                                                        borderColor: '#146eb4',
                                                        borderRadius: '2px',
                                                    }}>
                                                    <FontAwesomeIcon icon={faDownload} />
                                                </Button>
                                                <Button
                                                    onClick={() => handleViewFile(file.downloadLink, index)}
                                                    size='sm'
                                                    style={{
                                                        fontSize: '10px',
                                                        backgroundColor: '#ec7211',
                                                        borderColor: '#ec7211',
                                                        borderRadius: '2px',
                                                    }}
                                                    disabled={fileLoadingState[index]}
                                                >
                                                    {fileLoadingState[index] ? (
                                                        <NewSpinner size='sm' />
                                                    ) : (
                                                        <FontAwesomeIcon icon={faEye} />
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <div>
                        {files.data && files.data.length > ITEMS_PER_PAGE && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: '10px',
                            }}>
                                <Button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    style={{
                                        borderColor: '#687078',
                                        borderRadius: '2px',
                                        backgroundColor: '#fff',
                                        color: '#16191f',
                                    }}
                                >
                                    Previous
                                </Button>
                                <p style={{
                                    margin: '0 10px',
                                }}>
                                    Page {currentPage} of {Math.ceil(files.data.length / ITEMS_PER_PAGE)}
                                </p>
                                <Button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === Math.ceil(files.data.length / ITEMS_PER_PAGE)}
                                    style={{
                                        borderColor: '#687078',
                                        borderRadius: '2px',
                                        backgroundColor: '#fff',
                                        color: '#16191f',
                                    }}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                    <br />
                    {modalVisible && (
                        <div
                            style={{
                                position: 'fixed',
                                top: '0',
                                left: '0',
                                width: '100%',
                                height: '100%',
                                background: 'rgba(0, 0, 0, 0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', maxWidth: '80%', maxHeight: '80%', overflow: 'auto' }}>
                                <button style={{ float: 'right', fontSize: '16px', cursor: 'pointer' }} onClick={() => setModalVisible(false)}>
                                    X
                                </button>
                                <h3>File Content</h3>
                                <textarea style={{ width: '900px', height: '600px' }} readOnly value={selectedFileContent || ''} />
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <p>There are not files</p>
            )}
        </div>
    )
}

export default TableInformation;