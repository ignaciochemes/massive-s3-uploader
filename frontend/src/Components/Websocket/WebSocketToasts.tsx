import React, { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';

interface WebSocketToastProps {
    message: any;
}

const WebSocketToast: React.FC<WebSocketToastProps> = ({ message }) => {
    useEffect(() => {
        if (!message) return;
        try {
            message = JSON.parse(message?.data);
        } catch (error) {
            console.log('Error al parsear el mensaje JSON:', error);
            return;
        }
        if (message) {
            if (message.messageType === 'success') {
                toast.success(`File upload: ${message.fileName}`, {
                    position: 'bottom-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    theme: 'dark',
                });
            } else if (message.messageType === 'error') {
                toast.error(`Error: ${message.error}`, {
                    position: 'bottom-right',
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        }
    }, [message]);

    return (
        <div>
            <ToastContainer limit={10} newestOnTop />
        </div>
    );
};

export default WebSocketToast;