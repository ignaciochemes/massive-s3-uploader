import React, { useEffect } from 'react';
import { ProgressBar } from 'react-bootstrap';

interface FileUploadProgressProps {
    file: any;
    uploadProgress: Record<string, number>;
}


const FileUploadProcess: React.FC<FileUploadProgressProps> = ({ file, uploadProgress }) => {
    return (
        <ProgressBar variant='success'
            now={uploadProgress[file.name] || 0} max={100}
            label={`${Math.round(uploadProgress[file.name])}%`}
            style={{
                borderRadius: '2px',
            }}
        >
        </ProgressBar>
    );
}

export default FileUploadProcess;