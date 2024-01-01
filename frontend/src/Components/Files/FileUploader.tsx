import React, { useState, useRef, useEffect } from 'react';
import axios, { CancelTokenSource, isCancel } from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { FormatBytes } from '../../Helpers/Functions';
import FileSelector from './FileSelector';
import NewSpinner from '../Spinner';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FileUploaderTable from './FileUploaderTable';
import { faArrowUpFromBracket, faCircle } from '@fortawesome/free-solid-svg-icons';
import CheckSimpleUploader from './CheckSimpleUploader';

interface FileUploaderProps {
    message?: any;
}

const FileUploader: React.FC<FileUploaderProps> = ({ message }) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const [totalSize, setTotalSize] = useState<number>(0);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [folders, setFolders] = useState<string[]>([]);
    const [buckets, setBuckets] = useState<string[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string>('');
    const [selectedBucket, setSelectedBucket] = useState<string>('');
    const [simpleUploader, setSimpleUploader] = useState<boolean>(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const cancelTokenSource = useRef<CancelTokenSource | null>(null);

    useEffect(() => {
        if (selectedFolder === '' || selectedBucket === '') {
            axios.get(`${process.env.REACT_APP_API_URL}/aws/buckets`)
                .then(response => {
                    setBuckets(response.data.data);
                })
                .catch(error => {
                    console.error('Error fetching bucket:', error);
                });
        }

        if (selectedBucket !== '') {
            axios.get(`${process.env.REACT_APP_API_URL}/aws/folders?bucket=${selectedBucket}`)
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
    }, [selectedBucket, selectedFolder]);

    const handleFileSelect = (files: File[]) => {
        setSelectedFiles(files);
        const size = files.reduce((acc, file) => acc + file.size, 0);
        setTotalSize(size);
    };

    const handleFileUpload = async () => {
        setLoading(true);
        cancelTokenSource.current = axios.CancelToken.source();

        const formData = new FormData();
        selectedFiles.forEach((file) => {
            formData.append('files', file);
            setUploadProgress((prevProgress) => ({ ...prevProgress, [file.name]: 0 }));
        });
        if (!selectedFolder) {
            alert('Please select a folder');
            return;
        }
        axios.post(`${process.env.REACT_APP_API_URL}/files/upload?bucket=${selectedBucket}&folder=${selectedFolder}`, formData, {
            cancelToken: cancelTokenSource.current.token,
            onUploadProgress: (progressEvent) => {
                selectedFiles.forEach((file) => {
                    setUploadProgress((prevProgress) => ({
                        ...prevProgress,
                        [file.name]: (progressEvent.loaded / totalSize) * 100,
                    }));
                });
            },
        })
            .then((response) => {
                setSuccessMessage('All files were uploaded successfully.');
            })
            .catch((error) => {
                if (isCancel(error)) {
                    console.log('Canceled request:', error.message);
                } else {
                    console.error('Error uploading files:', error);
                }
            })
            .finally(() => {
                setLoading(false);
                cancelTokenSource.current = null;
            });
    };

    const handleCancel = () => {
        if (cancelTokenSource.current) {
            cancelTokenSource.current.cancel('Request canceled by user');
        }
        setSelectedFiles([]);
        setTotalSize(0);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setLoading(false);
    };

    const handleSimpleMode = (event: boolean) => {
        if (event === true) {
            setSimpleUploader(true);
        } else {
            setSimpleUploader(false);
        }
    }

    return (
        <div className="file-uploader" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' }}>
            <div style={{ maxWidth: '1000px', width: '100%', padding: '20px' }}>
                <h1>Massive File Uploader Tool</h1>
                <Container>
                    <Card style={{
                        padding: '20px',
                        marginBottom: '20px',
                        backgroundColor: '#fbfbfa',
                        borderColor: '#687078',
                        borderRadius: '2px',
                        boxShadow: '0 0 10px 0 rgba(0,0,0,.1)',
                    }}>
                        <Row style={{
                            marginBottom: '20px',
                        }}>
                            <Col>
                                <FontAwesomeIcon icon={faCircle} style={{ marginRight: '5px' }} />
                                <span style={{ fontWeight: 'bold' }}>Selector:</span> Select a bucket and a folder within that bucket. Then, select one or more files from your computer. Finally, click the "Upload Files" button.
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <label>
                                    Select bucket:
                                    <Form.Select
                                        value={selectedBucket}
                                        onChange={(e) => setSelectedBucket(e.target.value)}
                                        style={{
                                            borderColor: '#687078',
                                            borderRadius: '2px',
                                            backgroundColor: '#fff',
                                            color: '#16191f',
                                            minWidth: '300px',
                                            maxWidth: '300px',
                                            boxShadow: '0 0 10px 0 rgba(0,0,0,.1)',
                                        }}>
                                        <option value="">-- Select Bucket --</option>
                                        {buckets.map((bucket, index) => (
                                            <option key={index} value={bucket}>
                                                {bucket}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </label>
                            </Col>
                            <Col>
                                <label>
                                    <span style={{ fontWeight: 'bold', fontStyle: 'italic', textDecoration: 'underline' }}>{selectedBucket}</span>:
                                    {selectedBucket ? (
                                        <Form.Select
                                            value={selectedFolder}
                                            onChange={(e) => setSelectedFolder(e.target.value)}
                                            style={{
                                                borderColor: '#687078',
                                                borderRadius: '2px',
                                                backgroundColor: '#fff',
                                                color: '#16191f',
                                                minWidth: '300px',
                                                maxWidth: '300px',
                                                boxShadow: '0 0 10px 0 rgba(0,0,0,.1)',
                                            }}>
                                            <option value="">-- Select Folder --</option>
                                            {folders.map((folder, index) => (
                                                <option key={index} value={folder}>
                                                    {folder}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    ) : (
                                        <Form.Select
                                            disabled
                                            style={{
                                                borderColor: '#687078',
                                                borderRadius: '2px',
                                                color: '#16191f',
                                                minWidth: '300px',
                                                maxWidth: '300px',
                                                boxShadow: '0 0 10px 0 rgba(0,0,0,.1)',
                                            }}>
                                            <option value="">-- Select Folder --</option>
                                        </Form.Select>
                                    )}
                                </label>
                            </Col>
                        </Row>
                        {selectedBucket && selectedFolder && (
                            <div style={{
                                marginTop: '20px',
                            }}>
                                Selected Path:{' '}
                                <span style={{ fontWeight: 'bold', fontStyle: 'italic' }}>{`s3://${selectedBucket}/${selectedFolder}`}</span>
                            </div>
                        )}
                    </Card>
                </Container>

                <div style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    marginTop: '20px',
                    marginBottom: '20px',
                }}>
                    <FileSelector onSelect={handleFileSelect} />
                </div>
                <div style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    marginTop: '20px',
                    marginBottom: '20px',
                }}>
                    Total size of selected files: {FormatBytes(totalSize)}
                </div>
                <div style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    marginTop: '20px',
                    marginBottom: '20px',
                }}>
                    <Row>
                        <Col>
                            <Form>
                                <Form.Check
                                    type="switch"
                                    id="custom-switch"
                                    label="Simple Mode"
                                    checked={simpleUploader}
                                    onChange={(e) => handleSimpleMode(e.target.checked)}
                                    style={{
                                        minWidth: '150px',
                                        maxWidth: '150px',
                                        marginTop: '10px',
                                    }}
                                />
                            </Form>
                        </Col>
                        <Col>
                            <CheckSimpleUploader />
                        </Col>
                    </Row>
                </div>
                <Row>
                    <Col>
                        <Button onClick={handleFileUpload}
                            disabled={loading || !selectedBucket || !selectedFolder || selectedFiles.length === 0}
                            style={{
                                width: '100%',
                                maxWidth: '300px',
                                backgroundColor: '#ff9900',
                                borderColor: '#ff9900',
                                borderRadius: '2px',
                                color: '#17181f',
                                fontWeight: 'bold',
                                boxShadow: '0 0 10px 0 rgba(0,0,0,.1)',
                            }}>
                            {loading ? (
                                <>
                                    <NewSpinner size='sm' />
                                    <span style={{ marginLeft: '10px' }}>Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faArrowUpFromBracket} />
                                    <span style={{ marginLeft: '10px' }}>Upload Files</span>
                                </>
                            )}
                        </Button>
                    </Col>
                </Row>
                {loading && (
                    <Button
                        onClick={handleCancel}
                        disabled={false}
                        style={{
                            width: '100%',
                            maxWidth: '300px',
                            backgroundColor: '#fff',
                            borderColor: '#687078',
                            borderRadius: '2px',
                            color: '#16191f',
                            fontWeight: 'bold',
                            marginTop: '10px',
                            boxShadow: '0 0 10px 0 rgba(0,0,0,.1)',
                        }}>
                        Cancel
                    </Button>
                )}
                {successMessage && (
                    <div style={{ color: 'green' }}>
                        {successMessage}
                    </div>
                )}
                {selectedFiles.length > 0 && (
                    <>
                        {simpleUploader === false ? (
                            <FileUploaderTable files={selectedFiles} uploadProgress={uploadProgress} message={message} />
                        ) : (
                            <div></div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default FileUploader;