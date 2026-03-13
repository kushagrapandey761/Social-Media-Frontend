import React, { useEffect } from 'react';
import socket from '../../socket';
const Chat = () => {

    useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      console.log("New message:", msg);
    });

    return () => socket.off("receiveMessage");
  }, []);
    return (
        <div>
            <h1>Chat</h1>
        </div>
    );
};

export default Chat;