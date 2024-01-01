import React, { useEffect, useState } from 'react';

const WebSocketStatusIndicator = ({ isWebSocketConnected }) => {
    const [blink, setBlink] = useState(false);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setBlink((prevBlink) => !prevBlink);
        }, 1500);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const circleStyle = {
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: isWebSocketConnected ? (blink ? 'green' : '#333') : 'red',
        display: 'inline-block',
        marginRight: '5px',
        transition: 'background 0.5s ease',
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isWebSocketConnected ? 'green' : 'red',
        }}>
            <span style={circleStyle}></span>
            {isWebSocketConnected ? 'Connected' : 'Disconnected'}
        </div>
    );
};

export default WebSocketStatusIndicator;