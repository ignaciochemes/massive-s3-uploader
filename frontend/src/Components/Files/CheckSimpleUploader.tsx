import React from 'react';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';

const popover = (
    <Popover id="popover-basic" style={{
        borderRadius: '2px',
    }}>
        <Popover.Header as="h3">Simple mode Information</Popover.Header>
        <Popover.Body>
            With the <strong>simple mode</strong> you can hide the information table generated when loading the files.
            This feature is optional and can be used when you want to upload a large number of files.
        </Popover.Body>
    </Popover>
);

const CheckSimpleUploader: React.FC = () => {
    return (
        <OverlayTrigger placement="right" overlay={popover}>
            <Button style={{
                width: '100%',
                maxWidth: '300px',
                backgroundColor: '#fff',
                borderColor: '#687078',
                borderRadius: '2px',
                color: '#687078',
                fontWeight: 'bold',
                boxShadow: '0 0 10px 0 rgba(0,0,0,.1)',
            }}>Whats?</Button>
        </OverlayTrigger>
    )
};

export default CheckSimpleUploader;