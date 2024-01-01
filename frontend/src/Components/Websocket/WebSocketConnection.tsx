import React, { useEffect } from 'react';
import useWebSocket from 'react-use-websocket';

const socketUrl = 'ws://localhost:33003/ws';

interface WebSocketConnectionProps {
    onOpen: () => void;
    onMessage: (message: any) => void;
}

const WebSocketConnection: React.FC<WebSocketConnectionProps> = ({ onOpen, onMessage }) => {
    const { lastJsonMessage, readyState } = useWebSocket(socketUrl, {
        onOpen: onOpen,
        onMessage: onMessage,
        shouldReconnect: (closeEvent) => true,
        reconnectAttempts: 10,
        reconnectInterval: 3000,
    });

    useEffect(() => {
    }, [lastJsonMessage, readyState]);

    return null;
};

export default WebSocketConnection;