import React, { useEffect, useRef } from 'react';

const VideoComponent = (props) => {
    const videoRef = useRef(null);
    const stream = props.stream;

    useEffect(() => {
        if(stream && videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
                videoRef.current.play();
            }    
        }    
    }, [stream]);

    return (
        <>
            <video className='userVideo' ref={videoRef}></video>
        </>
    );
}

export default VideoComponent;