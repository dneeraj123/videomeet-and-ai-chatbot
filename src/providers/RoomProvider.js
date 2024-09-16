import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "./SocketProvider";
import PeerService from "../services/peer";
import { v4 as uuidv4 } from 'uuid';

const RoomContext = createContext(null);
const RoomProvider = (props) => {

    const navigate = useNavigate();
    const socket = useSocket();
    const [peerId, setPeerId] = useState('');
    const [roomId, setRoomId] = useState('');

    const [creator, setCreator] = useState(false);
    const [peerConnection, setPeerConnection] = useState(null);
    const [stream, setStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [screenStream, setScreenStream] = useState(null);
    const [recordPreview, setRecordPreview] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);

    const mediaRecorder = useRef(null);
    const [recordingStatus, setRecordingStatus] = useState('inactive');
    const chunks = useRef([]);
    const combinedStream = useRef(null);
    const recordStream = useRef(null);
    const recorderCanvas = useRef(null);
    const mimeType = "video/webm";
    const [audio, setRecordedAudio] = useState(null);

    // const [chunks, setChunks] = useState([]);

    useEffect(() => {
        //create peerId
        setPeerId(uuidv4());
        //create peer connection
        // peerConnection = new PeerService();
        setPeerConnection(new PeerService());

    }, []);

    useEffect(() => {
        //server responded back event listeners
        console.log('This use effect is called when creator, roomId, peerConnection object changes');
        socket.on('room-created', handleRoomCreated);
        socket.on('room-joined', handleRoomJoined);
        socket.on('user-joined', handleUserJoined);
        socket.on('candidate', handleCandidateReceived);
        socket.on('offer', handleOfferReceived);
        socket.on('answer', handleAnswerReceived);
        socket.on('started-screen-sharing', handleRemoteScreenShare);
        socket.on('user-disconnected', handleUserDisconnected);

        return () => {
            socket.off('room-created', handleRoomCreated);
            socket.off('room-joined', handleRoomJoined);
            socket.off('user-joined', handleUserJoined);
            socket.off('candidate', handleCandidateReceived);
            socket.off('offer', handleOfferReceived);
            socket.off('answer', handleAnswerReceived);
            socket.off('started-screen-sharing', handleRemoteScreenShare);
            socket.off('user-disconnected', handleUserDisconnected);
        };

    }, [creator, roomId, peerConnection]);

    useEffect(() => {
        console.log(`Rendered and variable are : ${stream} ${remoteStream} ${creator} ${peerConnection} ${roomId} ${chunks.current}`);
    });

    const handleRoomCreated = ({ roomId }) => {
        console.log(`Room created :: ${roomId}`);
        setCreator(true);
        navigate(`/room/${roomId}`);
    };

    const handleRoomJoined = ({ roomId, peerId }) => {
        console.log(`Room joined :: ${roomId} ${peerId}`);
        navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then((stream) => {
            //set my stream
            setRoomId(roomId);
            setStream(stream);
            peerConnection.createPeerConnection();
            //set ice candidate listener
            peerConnection.peer.onicecandidate = (event) => {
                socket.emit('candidate', { roomId: roomId, candidate: event?.candidate });
            };
            //set remote stream
            peerConnection.peer.ontrack = (event) => {
                console.log('ontrack event called !');
                if (event.streams[1]) {
                    //this is screen sharing stream
                    setScreenStream(event.streams[1]);
                    return;
                }
                setRemoteStream(event.streams[0]);
            };
            //add local tracks to send to remote
            peerConnection.peer.addTrack(stream.getTracks()[0], stream);
            peerConnection.peer.addTrack(stream.getTracks()[1], stream);

            //send get user media done to server
            socket.emit('get-user-media-done', { roomId: roomId, peerId: peerId });


        }, (error) => {
            alert(`Couldn't access user media ${error}!`);
        });
    }

    const handleUserJoined = async ({ peerId }) => {
        console.log(`Another user joined the room :: ${roomId} with userID ${peerId} `);
        //create and send offer
        const offer = await peerConnection.createOffer();
        socket.emit('offer', { roomId: roomId, offer: offer });
    };

    const handleCandidateReceived = (candidate) => {
        if (candidate) {
            console.log(`Candidate received and adding it`);
            var iceCandidate = new RTCIceCandidate(candidate);
            peerConnection.peer.addIceCandidate(iceCandidate);
        }
    };

    const handleOfferReceived = async (offer) => {
        // if(!creator) {
        console.log(`Offer received`);
        console.log(`Setting remote description`);
        await peerConnection.setRemoteDescription(offer);
        console.log(`Creating and sending answer`);
        const answer = await peerConnection.createAnswer();
        socket.emit('answer', { roomId: roomId, answer: answer });
    };

    const handleAnswerReceived = async (answer) => {
        // if(creator) {
        console.log(`Answer received`);
        console.log(`Setting remote description as answer`);
        await peerConnection.setRemoteDescription(answer);
        console.log(`Negotiation complete`);
    };

    const handleUserDisconnected = ({ peerId }) => {
        console.log(`User disconnected`, peerId);
        setRemoteStream(null);
    };

    const shareScreen = () => {
        navigator.mediaDevices.getDisplayMedia({
            video: {
                width: { ideal: 1920, max: 1920 },
                height: { ideal: 1080, max: 1080 }
            }, audio: false
        }).then(async (displayStream) => {
            //add track for screen sharing
            peerConnection.peer.addTrack(displayStream.getTracks()[0], stream, displayStream);
            setScreenStream(displayStream);
            const offer = await peerConnection.createOffer();
            socket.emit('start-screen-sharing', { roomId: roomId, peerId: peerId, offer: offer });
        }, (error) => {
            alert('Error getting user display media', error);
        })
    };

    const handleRemoteScreenShare = () => {
        console.log('Another user started sharing screen');
    }

    const toggleMute = () => {
        if(isMuted) {
            stream.getTracks()[0].enabled = true;
        } else {
            stream.getTracks()[0].enabled = false;
        }
        setIsMuted(!isMuted);
    }

    const toggleCamera = () => {
        if(isCameraOff) {
            navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then((stream) => {
                const videoTrack = stream.getVideoTracks()[0];
                const audioTrack = stream.getAudioTracks()[0];
                const videoSender = peerConnection.peer.getSenders().find((s) => s.track.kind === videoTrack.kind);
                videoSender.replaceTrack(videoTrack);                
                const audioSender = peerConnection.peer.getSenders().find((s) => s.track.kind === audioTrack.kind);
                audioSender.replaceTrack(audioTrack);                
                setStream(stream);  
            }, (err) => {

            });
        } else {
            stream.getTracks()[1].enabled = false;
            stream.getTracks()[1].stop();
        }
        setIsCameraOff(!isCameraOff);
    }

    // const onRecordingStop = () => {
    //     setRecordingStatus('inactive');        
    //     if(mediaRecorder.current) {
    //         mediaRecorder.current.onstop = () => {
    //             console.log('Final chunk array is :: ', chunks.current);
    //             const blob = new Blob(chunks.current, { type: mimeType });
    //             const url = URL.createObjectURL(blob);
    //             setRecordedAudio(url);
    //             // setChunks([]);
    //             chunks.current = [];
    //         };            
    //         mediaRecorder.current.stop();
    //     }
    // };

    // const onRecordingStart = async () => {
    //     let ctx = canvas.getContext("2d");
    //     let displayStream = recorderCanvas.current.captureStream(25);
    //     setRecordingStatus('recording');
    //     mediaRecorder.current = new MediaRecorder(displayStream, { type: mimeType });
    //     mediaRecorder.current.ondataavailable = (e) => {
    //         if (typeof e.data === "undefined") return;
    //         if (e.data.size === 0) return;         
    //         console.log('ondataavailable :: ', e.data);   
    //         chunks.current.push(e.data);
    //         console.log('ondataavailable chunks :: ', chunks.current);   
    //     }

    //     mediaRecorder.current.start(10000);
        // let localChunks = [];
        // setChunks([...chunks, e.data]);
        // localChunks.push(e.data);
        // setChunks(localChunks);
        // const inputSources = await window.ipcRenderer.invoke('getSources');
        // console.log('inputSources are :: ', inputSources);
        // const callWindow = inputSources.filter((item) => item.name === 'client');

        // const constraints = {
        //     // audio: {
        //     //     mandatory: {
        //     //       chromeMediaSource: 'desktop'
        //     //     }
        //     // },
        //     audio: false,
        //     video: {
        //       mandatory: {
        //         chromeMediaSource: 'desktop'
        //         // chromeMediaSourceId: 'window:525650:0'
        //       }
        //     }
        // };
        // const RStream = await navigator.mediaDevices.getUserMedia(constraints);
        // recordStream.current = RStream;
        // setRecordPreview(RStream);
        // combinedStream.current = new MediaStream();
        // if(stream) {
        //     stream.getTracks().forEach((track) => {
        //         combinedStream.current.addTrack(track.clone());
        //     });
        // }
        // if(remoteStream) {
        //     remoteStream.getTracks().forEach((track) => {
        //         combinedStream.current.addTrack(track.clone());
        //     });
        // }
    // };

    return (
        <RoomContext.Provider value={{ stream, remoteStream, creator, peerId, shareScreen, screenStream, toggleMute, toggleCamera, isMuted, isCameraOff, recordingStatus, audio, recorderCanvas }}>
            {props.children}
        </RoomContext.Provider>
    );
}

export const useRoom = () => useContext(RoomContext);

export default RoomProvider;