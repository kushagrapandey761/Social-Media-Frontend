import React, { useState, useEffect, useRef } from "react";
import "./Chat.css";
import socket from "../../socket";
import { api } from "../../services/api";

const Chat = ({onlineUsers}) => {
  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Fetch logged in user and all users
    const fetchData = async () => {
      try {
        // const me = await api.getLoggedInUser();
        const me = localStorage.getItem("LoggedInuserDetails");

        if (me) {
          setCurrentUser(JSON.parse(me));
        }
        const allUsers = await api.getAllUsers();
        setUsers(allUsers.filter(u => u._id !== me._id));
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (activeChat) {
      // Fetch message history
      const fetchMessages = async () => {
        try {
          const history = await api.getMessages(activeChat._id);
          setMessages(history);
        } catch (err) {
          console.error("Failed to fetch messages", err);
        }
      };
      fetchMessages();

      // Join chat room or notify server of active chat
      socket.emit("join_chat", { targetId: activeChat._id });
    }
  }, [activeChat]);

  useEffect(() => {
    socket.on("receiveMessage", (message) => {
      
      // Use String() to ensure we compare strings, avoiding potential ObjectId vs String issues
      const isFromActiveChat = activeChat && (
        String(message.senderId) === String(activeChat._id) || 
        String(message.receiverId) === String(activeChat._id)
      );

      if (isFromActiveChat) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [activeChat]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !currentUser) return;

    const messageData = {
      receiverId: activeChat._id,
      text: newMessage,
    };


    // Optimistic UI update
    setMessages((prev) => [...prev, {...messageData, senderId: currentUser._id,}]);
    
    await api.sendMessage(messageData);
    
    setNewMessage("");
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h2>Messages</h2>
        </div>
        <div className="chat-list">
          {users.map((user) => (
            <div
              key={user._id}
              className={`chat-item ${activeChat?._id === user._id ? "active" : ""}`}
              onClick={() => setActiveChat(user)}
            >
              <div className="chat-item-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="chat-item-info">
                <span className="chat-item-name">{user.username}</span>
                <span className="chat-item-last-msg">Click to start chatting</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-window">
        {activeChat ? (
          <>
            <div className="chat-window-header">
              <h3>{activeChat.username}</h3>
              {onlineUsers.includes(activeChat._id) && (
                <span className="online-dot"></span>
              )}
            </div>
            <div className="messages-list" ref={messagesContainerRef}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message-wrapper ${msg.senderId === currentUser?._id ? "sent" : "received"}`}
                >
                  <div className="message-bubble">
                    {msg.text}
                    <span className="message-time">
                      {msg.createdAt && !isNaN(new Date(msg.createdAt)) 
                        ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Just now'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="message-input-container">
              <form className="message-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  className="message-input"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value)
                  }}
                />
                <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="no-chat-icon">💬</div>
            <p>Select a contact to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;