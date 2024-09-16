import React, { createContext, useContext, useMemo } from "react";
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SocketProvider = (props) => {
    const socket = useMemo(() => {
        console.log("Socket created on client side !");
        return io('localhost:8000');
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    );
}

//custom hook
export const useSocket = () => useContext(SocketContext);

export default SocketProvider;