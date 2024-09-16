import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import { useParams } from 'react-router-dom';
import { useRoom } from '../providers/RoomProvider';
import { useSocket } from '../providers/SocketProvider';
import VideoComponent from './VideoComponent';
import { Avatar, BottomNavigation, BottomNavigationAction, Box, Grid, Paper, Typography } from '@mui/material';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import FiberManualRecordTwoToneIcon from '@mui/icons-material/FiberManualRecordTwoTone';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#1A2027',
    ...theme.typography.body2,
    // padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    boxShadow: 'none'
  }));

const Room = () => {
    const { id } = useParams();
    const socket = useSocket(); 
    const { stream, remoteStream, peerId, shareScreen, screenStream, toggleMute, toggleCamera, isMuted, isCameraOff, recordingStatus, audio, recorderCanvas } = useRoom();
    const [ value, setValue ] = useState(null);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    
    useEffect(() => {
        if(id && peerId) {
            socket.emit('join-room', {roomId : id, peerId : peerId});
        }
    }, [socket, id, peerId]);

    useEffect(() => {
        // somebody clicked on "Stop sharing"
        if(!screenStream) {
            return;
        }
        screenStream.getVideoTracks()[0].onended = function () {
           // stopShareScreen();
        };
    }, [screenStream])

    return (
        <div>
            <Box
                sx={{
                    width: '100%',
                    height: '100vh',
                    bgcolor: '#1A2027',
                    // '&:hover': {
                    //     bgcolor: 'primary.dark',
                    // },
                    flexGrow: 1
                }}
            >
                <Typography style={{color: '#fff'}} variant='subtitle1' gutterBottom align='center'>Meeting Room ID :: {id}</Typography>
                {screenStream ?
                    <Grid container>
                        <Grid item xs={9}>
                            <Item>
                                <VideoComponent stream={screenStream}></VideoComponent>
                            </Item>
                        </Grid>
                        <Grid item xs={3}>
                            <Grid container direction={'column'} alignItems={'center'} justifyContent={'center'}>
                                {stream ?
                                    <Grid item xs={12}>
                                        <Item>
                                            <VideoComponent stream={stream}></VideoComponent>
                                        </Item>
                                    </Grid> :
                                    ''
                                }
                                {remoteStream ?
                                    <Grid item xs={12}>
                                        <Item>
                                            <VideoComponent stream={remoteStream}></VideoComponent>
                                        </Item>
                                    </Grid> :
                                    ''
                                }                            
                            </Grid>                            
                        </Grid>
                    </Grid>
                    :
                    <Grid container spacing={2} alignItems={'center'} justifyContent={'center'}>
                            {stream ?
                                <Grid item xs={6}>
                                    <Item>
                                        <VideoComponent stream={stream}></VideoComponent>
                                        {audio ? (
                                            <div style={{backgroundColor: 'white'}}>
                                                <audio src={audio} controls></audio>
                                                <a download href={audio}>
                                                    Download Recording
                                                </a>
                                            </div>
                                        ) : 'null'}
                                    </Item>
                                </Grid> :
                                ''
                            }
                            {remoteStream ?
                                <Grid item xs={6}>
                                    <Item>
                                        <VideoComponent stream={remoteStream}></VideoComponent>
                                    </Item>
                                </Grid> :
                                ''
                            }
                    </Grid>
                }
            </Box>
            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
                <BottomNavigation
                    showLabels
                    value={value}
                    onChange={(event, newValue) => { 
                        if(newValue === 0) {
                            toggleMute();
                        }
                        if(newValue === 1) {
                            toggleCamera();
                        }
                        if(newValue === 2 && !screenStream) {
                            console.log('starting screen sharing');
                            shareScreen();
                            setIsScreenSharing(true);
                            setValue(newValue);
                        } else if(newValue === 2 && screenStream) {
                            console.log('stopping screen sharing');
                            setIsScreenSharing(false);
                            setValue(null);
                        }
                        if(newValue === 3) {
                            if(recordingStatus === 'inactive') {
                                //onRecordingStart();
                            } else if(recordingStatus === 'recording') {
                                //onRecordingStop();
                            } else if(recordingStatus === 'pause') {

                            }
                        }
                    }}
                >
                    { isMuted ? 
                        <BottomNavigationAction label="Microphone" icon={ <Avatar> <MicOffIcon /> </Avatar> } /> :
                        <BottomNavigationAction label="Microphone" icon={ <MicOffIcon /> } />
                    }
                    { isCameraOff ? 
                        <BottomNavigationAction label="Camera" icon={ <Avatar> <VideocamOffIcon /> </Avatar> } /> :
                        <BottomNavigationAction label="Camera" icon={ <VideocamOffIcon /> } />
                    }
                    <BottomNavigationAction label="Screen Share" icon={<ScreenShareIcon />} />
                    { recordingStatus === 'inactive' ? <BottomNavigationAction label="Start recording" icon={<FiberManualRecordTwoToneIcon />} /> :
                      recordingStatus === 'recording' ? <BottomNavigationAction label="Stop recording" icon={<FiberManualRecordTwoToneIcon style={{backgroundColor: 'red'}}/>} /> :
                      ''
                    }
                </BottomNavigation>            
            </Paper>   
            <canvas ref={recorderCanvas} style={{width: '800px', height: '400px'}}>
            </canvas>
        </div>
    );
}

export default Room;