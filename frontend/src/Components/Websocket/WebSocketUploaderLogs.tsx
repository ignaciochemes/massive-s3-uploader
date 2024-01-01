// WebSocketUploaderLogs.tsx

import React from "react";
import { Badge, Col } from "react-bootstrap";
import { CreateNowDate } from "../../Helpers/Functions";

interface WebSocketUploaderLogsProps {
    messages: any[];
}

const WebSocketUploaderLogs: React.FC<WebSocketUploaderLogsProps> = ({ messages }) => {
    return (
        <div>
            <ul style={{
                padding: '0',
                margin: '0'
            }}>
                {messages.map((log, logIndex) => (
                    <Col key={logIndex} style={{
                        padding: '1px',
                        margin: '0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderColor: 'rgb(239, 240, 243)',
                        backgroundColor: 'rgb(239, 240, 243)',
                        borderStyle: 'solid',
                        borderWidth: '2px',
                        borderRadius: '2px',
                        marginBottom: '5px',
                    }}>
                        <Badge bg="info" style={{
                            marginRight: '5px',
                            marginLeft: '5px',
                            fontSize: '12px',
                            borderRadius: '2px',
                        }}>
                            {`Log ${logIndex + 1}`}
                        </Badge>
                        {log.log}
                        <Badge bg="secondary" style={{
                            marginRight: '5px',
                            marginLeft: '5px',
                            fontSize: '12px',
                            borderRadius: '2px',
                        }}>
                            {log.date}
                        </Badge>
                    </Col>
                ))}
            </ul>
        </div>
    );
};

export default WebSocketUploaderLogs;


