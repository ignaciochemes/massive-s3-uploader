import React, { useState } from 'react';
import TableInformation from '../Components/TableInformation';
import FileUploader from '../Components/Files/FileUploader';
import NewNavbar from '../Components/Navbar';
import TableDbInformation from '../Components/FilesDb/TableInformation';
import LogsTableInformation from '../Components/Logs/LogsTableInformation';
import WebSocketConnection from '../Components/Websocket/WebSocketConnection';
import WebSocketToast from '../Components/Websocket/WebSocketToasts';

const AppContainer: React.FC = () => {
    const [toShow, setToShow] = useState(1)
    const [isWebSocketConnected, setIsWebSocketConnected] = useState<boolean>(false);
    const [lastJsonMessage, setLastJsonMessage] = useState<any | null>(null);

    const handleWebSocketOpen = () => {
        setIsWebSocketConnected(true);
    };

    const handleWebSocketMessage = (message: any) => {
        setLastJsonMessage(message);
    };

    return (
        <div>
            <WebSocketConnection onOpen={handleWebSocketOpen} onMessage={handleWebSocketMessage} />
            <WebSocketToast message={lastJsonMessage} />
            <NewNavbar setToShow={setToShow} setIsWebSocketConnected={setIsWebSocketConnected} isWebSocketConnected={isWebSocketConnected} />
            {toShow === 1 && <FileUploader message={lastJsonMessage} />}
            {toShow === 2 && <TableInformation />}
            {toShow === 3 && <TableDbInformation />}
            {toShow === 4 && <LogsTableInformation />}
        </div>
    );
}

export default AppContainer;