import { Button, Container, Paper, Stack, TextField } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../providers/SocketProvider';

const Lobby = () => {

    //styles
    const paperStyle = { padding: 20, height: '40vh', margin: 100 };

    // const [ email, setEmail ] = useState('');
    const [ room, setRoom ] = useState('');
    const socket = useSocket();
    const navigate = useNavigate();

    const handleSubmitForm = useCallback((e) => {
        e.preventDefault();
        console.log(`Joining with the following details :: ${room}`);
        navigate(`/room/${room}`);
    }, [room, navigate]);

    const startNewMeeting = useCallback(() => {
        console.log(`start new Meeting clicked !`);
        socket.emit('create-room');        
    }, [socket]);

    const startAIChat = (e) => {
        navigate('/chat');
    }

    return (
        <>
            <Container maxWidth='sm' style={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
                <Paper elevation={10} style={paperStyle}>
                    <form autoComplete="off" onSubmit={handleSubmitForm}>
                        <Stack spacing={1}>
                            <TextField id='meeting-id' type='text' value={room} onChange={(e) => setRoom(e.target.value) } label="Meeting ID" variant="standard" />
                            <br/>                            
                            <Button type="submit" variant="outlined">Join meeting</Button>
                        </Stack>            
                    </form>            
                    <br/><br/>
                    <Button variant="contained" fullWidth onClick={startNewMeeting}>Start new meeting</Button>
                </Paper>                

                <Paper elevation={10} style={{marginTop : '10px', width: '200px'}}>
                    <Button variant="contained" fullWidth onClick={startAIChat}>Start AI chat</Button>                                        
                </Paper>
            </Container>            
            {/* <Container fluid>
                <br/>
                <Row>
                    <Col md={4}></Col>
                    <Col md={4} className='container-border container-padding'>
                        <Row className='add-space'>
                            <Form.Group  controlId="exampleForm.ControlInput1">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value) } placeholder="name@example.com" />
                            </Form.Group>
                        </Row>
                        <Row className='add-space'>
                            <Form onSubmit={handleSubmitForm}>
                                <Form.Group controlId="exampleForm.ControlTextarea1">
                                    <Form.Label>Meeting ID</Form.Label>
                                    <Form.Control type='text' value={room} onChange={(e) => setRoom(e.target.value) } />
                                </Form.Group>
                                <br/>
                                <Form.Group controlId="exampleForm.button">
                                    <Button type="submit" variant="primary">Join meeting</Button>
                                </Form.Group>
                            </Form>
                        </Row>     
                        <br/>                   
                        <Row className='add-space container-padding'>
                            <Button variant="primary" size="md" onClick={startNewMeeting}>Start new meeting</Button>
                        </Row>                        
                    </Col>
                    <Col md={4}></Col>
                </Row>
            </Container> */}
        </>
    );
}

export default Lobby;