import React, { useState, useEffect, useRef } from "react";
import "./Chat.css";
import socket from "../../socket";
import { api } from "../../services/api";

const Chat = ({onlineUsers, typingData, messageSeenData}) => {
  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const formatDateLabel = (dateString) => {
    if (!dateString || isNaN(new Date(dateString))) {
      return "Today";
    }

    const date = new Date(dateString);
    const now = new Date();
    
    // Normalize dates to midnight for comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (messageDate.getTime() === today.getTime()) {
      return "Today";
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
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

  const handleReceiveMessage = (message) => {

    if (!activeChat || !currentUser) return;

    const isFromActiveChat =
      String(message.senderId) === String(activeChat._id);

    if (isFromActiveChat) {

      // Add message to UI
      setMessages(prev => [...prev, message]);

      // Mark message as seen immediately
      socket.emit("messageSeen", {
        receiverId: currentUser._id,
        senderId: message.senderId
      });

      // Update UI immediately
      setMessages(prev =>
        prev.map(msg =>
          msg._id === message._id
            ? { ...msg, seen: true }
            : msg
        )
      );

    } else {

      // message from another chat
      setMessages(prev => [...prev, message]);

    }

  };

  socket.on("receiveMessage", handleReceiveMessage);

  return () => {
    socket.off("receiveMessage", handleReceiveMessage);
  };

}, [activeChat, currentUser]);

  // Handle real-time "Seen" updates from other users
  useEffect(() => {

    if (!messageSeenData || !activeChat || !currentUser) return;

    if (String(messageSeenData.receiverId) !== String(activeChat._id)) return;

    setMessages(prev =>
      prev.map(msg => {
        if (
          String(msg.senderId) === String(currentUser._id) &&
          String(msg.receiverId) === String(activeChat._id) &&
          !msg.seen
        ) {
          return { ...msg, seen: true };
        }
        return msg;
      })
    );

  }, [messageSeenData, activeChat, currentUser]);

  // Handle marking received messages as "Seen" when chat is active
  useEffect(() => {
    if (activeChat && currentUser && messages.length > 0) {
      const hasUnseenMessages = messages.some(msg => msg.senderId === activeChat._id && !msg.seen);
      
      if (hasUnseenMessages) {
        socket.emit("messageSeen", { receiverId: currentUser._id, senderId: activeChat._id });
        
        setMessages(prev => prev.map(msg => {
          if (msg.senderId === activeChat._id && msg.receiverId === currentUser?._id && !msg.seen) {
            return { ...msg, seen: true };
          }
          return msg;
        }));
      }
    }
  }, [activeChat, messages, currentUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !currentUser) return;

    const messageData = {
      receiverId: activeChat._id,
      text: newMessage,
    };


    // Optimistic UI update
    setMessages((prev) => [...prev, {...messageData, senderId: currentUser._id}]);
    
    await api.sendMessage(messageData);
    
    setNewMessage("");
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value)
    socket.emit("typing", { receiverId: activeChat._id, senderId: currentUser._id});
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { receiverId: activeChat._id, senderId: currentUser._id});
    }, 1000);
  }

  const handleSetActiveChat = (user) => {
    setActiveChat(user);
  }

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
              onClick={() => handleSetActiveChat(user)}
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
                {messages.map((msg, index) => {
                  const prevMsg = messages[index - 1];
                  
                  // Helper to get normalized date string for comparison
                  const getCompareDate = (m) => m && m.createdAt ? new Date(m.createdAt).toDateString() : new Date().toDateString();
                  
                  const showDateSeparator = !prevMsg || getCompareDate(msg) !== getCompareDate(prevMsg);

                  return (
                    <React.Fragment key={index}>
                      {showDateSeparator && (
                        <div className="date-separator">
                          <span className="date-label">{formatDateLabel(msg.createdAt)}</span>
                        </div>
                      )}
                      <div
                        className={`message-wrapper ${msg.senderId === currentUser?._id ? "sent" : "received"}`}
                      >
                        <div className="message-bubble">
                          {msg.text}
                          <div className="message-info">
                            <span className="message-time">
                              {msg.createdAt && !isNaN(new Date(msg.createdAt)) 
                                ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : 'Just now'}
                            </span>
                            {msg.senderId === currentUser?._id && (
                              <span className={`message-tick ${msg.seen ? 'seen' : ''}`}>
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                  <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
                                </svg>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
                {typingData.senderId === activeChat._id && typingData.isTyping && (
                        <div className="message-wrapper received">
                          <div className="message-bubble">
                            Typing ...
                          </div>
                        </div>
                      )}
              </div>
            <div className="message-input-container">
              <form className="message-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  className="message-input"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={handleTyping}
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