import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Button, Navbar, NavDropdown } from 'react-bootstrap';
import WebSocketStatusIndicator from './Websocket/WebSocketStatus';
import WebSocketHandler from './Websocket/WebSocketHandler';

interface NavbarProps {
    setToShow: (number: number) => void;
    setIsWebSocketConnected: (isConnected: boolean) => void;
    isWebSocketConnected: boolean;
}

const NewNavbar: React.FC<NavbarProps> = ({ setToShow, setIsWebSocketConnected, isWebSocketConnected }) => {
    return (
        <>
            <BootstrapNavbar style={{
                borderRadius: '2px',
                justifyContent: 'space-between',
                padding: '10px',
                backgroundColor: '#232f3e',
                boxShadow: '0 0 10px 0 rgba(0,0,0,0.2)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <BootstrapNavbar.Brand style={{
                        marginRight: '20px',
                        fontFamily: 'monospace',
                        fontSize: '30px',
                        fontWeight: 500,
                        color: '#fff',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        margin: '0',
                        padding: '0',
                        cursor: 'default'
                    }}>MUS3</BootstrapNavbar.Brand>
                    <Nav className="mr-auto">
                        <Nav.Link onClick={() => setToShow(1)} style={{
                            marginRight: '10px',
                            marginLeft: '10px',
                            fontSize: '20px',
                            color: '#fff',
                        }}>UPLOADER</Nav.Link>
                        <NavDropdown title={<span style={{
                            color: '#fff',
                        }}>FILES</span>} style={{
                            marginRight: '10px',
                            marginLeft: '10px',
                            fontSize: '20px',
                        }}>
                            <NavDropdown.Item onClick={() => setToShow(2)}>S3 FILE LIST</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item onClick={() => setToShow(3)}>DB FILE LIST</NavDropdown.Item>
                        </NavDropdown>
                        <Nav.Link onClick={() => setToShow(4)} style={{
                            marginRight: '10px',
                            marginLeft: '10px',
                            fontSize: '20px',
                            color: '#fff',
                        }}>LOGS</Nav.Link>
                    </Nav>
                </div>
                <Nav>
                    <WebSocketStatusIndicator isWebSocketConnected={isWebSocketConnected} />
                </Nav>
            </BootstrapNavbar>
        </>
    );
}

export default NewNavbar;