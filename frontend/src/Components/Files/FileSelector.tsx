import React, { ChangeEvent, useRef, useState } from 'react';
import { Form } from 'react-bootstrap';

interface FileSelectorProps {
    onSelect: (files: File[]) => void;
}

const FileSelector: React.FC<FileSelectorProps> = ({ onSelect }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            onSelect(files);
        }
    };

    return (
        <Form.Group>
            <Form.Label style={{
                display: 'block',
                marginBottom: '5px',
                fontSize: '16px',
                fontWeight: 'bold',
            }}>
                UPLOAD FILES
            </Form.Label>
            <Form.Control
                type="file"
                onChange={handleFileChange}
                multiple
                ref={fileInputRef}
                style={{
                    padding: '5px',
                    borderRadius: '2px',
                    fontSize: '16px',
                    backgroundColor: '#fff',
                    borderColor: '#687078',
                }}
            />
        </Form.Group>
    )
}

export default FileSelector;