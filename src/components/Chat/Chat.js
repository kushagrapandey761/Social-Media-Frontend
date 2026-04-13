import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import "./Chat.css";
import socket from "../../socket";
import { api } from "../../services/api";
import PostCard from "../PostCard/PostCard";

const getCompareDate = (m) => m && m.createdAt ? new Date(m.createdAt).toDateString() : new Date().toDateString();

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

const Chat = ({onlineUsers, typingData, messageSeenData}) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [unseenUsers, setUnseenUsers] = useState([]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (userId) {
      setActiveChat(users.find(u => u.user._id === userId));
    }
  }, [userId, users]);

  useEffect(() => {
    // Fetch logged in user and all users
    const fetchData = async () => {
      try {
        // const me = await api.getLoggedInUser();
        const me = localStorage.getItem("LoggedInuserDetails");

        if (me) {
          setCurrentUser(JSON.parse(me));
        }
        const allUsers = await api.getChatUsers();
        setUsers(allUsers.filter(u => u.user._id !== me._id));
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
          const history = await api.getMessages(activeChat.user._id);
          setMessages(history);
        } catch (err) {
          console.error("Failed to fetch messages", err);
        }
      };
      fetchMessages();

      // Join chat room or notify server of active chat
      socket.emit("join_chat", { targetId: activeChat.user._id });
    }
  }, [activeChat]);

  useEffect(() => {

    const handleReceiveMessage = (message) => {
      if (!currentUser) return;

      const isFromActiveChat = activeChat && String(message.senderId) === String(activeChat.user._id);

      if (isFromActiveChat) {
        // Add message to UI and mark as seen immediately
        setMessages(prev => [...prev, { ...message, seen: true }]);
        

        socket.emit("messageSeen", {
          senderId: message.senderId
        });
      } else {
        // Update last message for the sender's chat (and don't push to active chat's messages)

        setUnseenUsers(prev => {
          if (!prev.includes(String(message.senderId))) {
            return [...prev, String(message.senderId)];
          }
          return prev;
        });
      }

      setUsers(prev => {
        const senderId = String(message.senderId);
        const existingUser = prev.find(item => String(item.user._id) === senderId);
        
        if (existingUser) {
          return [
            { ...existingUser, lastMessage: message },
            ...prev.filter(item => String(item.user._id) !== senderId)
          ];
        }
        return prev;
      });
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };

  }, [activeChat, currentUser]);

  // Updating messages when the other user has seen them
  useEffect(() => {

    if (!messageSeenData || !activeChat || !currentUser) return;

    if (String(messageSeenData.receiverId) !== String(activeChat.user._id)) return;

    setMessages(prev => prev.map(msg => 
      (String(msg.senderId) === String(currentUser._id) && !msg.seen) 
        ? { ...msg, seen: true } 
        : msg
    ));

  }, [messageSeenData, activeChat, currentUser]);

  // Marking messages as seen when you open/read them
  useEffect(() => {
    if (activeChat && currentUser && messages.length > 0) {
      const hasUnseenMessages = messages.some(msg => msg.senderId === activeChat.user._id && !msg.seen);
      
      if (hasUnseenMessages) {
        socket.emit("messageSeen", { senderId: activeChat.user._id });
        
        setMessages(prev => prev.map(msg => 
          (msg.senderId === activeChat.user._id && !msg.seen) 
            ? { ...msg, seen: true } 
            : msg
        ));
      }
    }
  }, [activeChat, messages, currentUser]);

  useEffect(() => {
    async function getUnseenUsers(){
      const data = await api.getUnseenUsers();
      if (data && data.senderIds) {
        const uniqueSenderIds = [...new Set(data.senderIds.map(item => String(item.senderId)))];
        setUnseenUsers(uniqueSenderIds);
      } else {
        setUnseenUsers([]);
      }
    }
    getUnseenUsers();
  }, []);


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !currentUser) return;

    const messageData = {
      receiverId: activeChat.user._id,
      text: newMessage,
      type: "text",
      currentMediaIndex: null
    };

    // Optimistic UI update
    const optimisticMessage = {
      ...messageData, 
      senderId: currentUser._id,
      createdAt: new Date().toISOString()
    };
    
    setMessages((prev) => [...prev, optimisticMessage]);
    

    await api.sendMessage(messageData);

    // Set the user at first position in the users list
    setUsers(prev=> {
      const exists = prev.some(item => String(item.user._id) === String(activeChat.user._id));
      if (exists) {
        const existingUser = prev.find(item => String(item.user._id) === String(activeChat.user._id));
        return [
          { ...existingUser, lastMessage: optimisticMessage },
          ...prev.filter(item => String(item.user._id) !== String(activeChat.user._id))
        ];
      }
      return [{ user: activeChat.user, lastMessage: optimisticMessage }, ...prev];
    });
    
    
    setNewMessage("");
  };

  useEffect(() => {
    console.log("after users", users)
  }, [users]);

  const handleTyping = (e) => {
    setNewMessage(e.target.value)
    socket.emit("typing", { receiverId: activeChat.user._id });
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { receiverId: activeChat.user._id });
    }, 1000);
  }

  const handleSetActiveChat = (user) => {
    setActiveChat(user);
    setUnseenUsers(prev => prev.filter(id => id !== user.user._id));
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
              key={user.user._id}
              className={`chat-item ${activeChat?.user?._id === user.user._id ? "active" : ""}`}
              onClick={() => handleSetActiveChat(user)}
            >
              <div className="chat-item-avatar" style={user.user.userAvatar ? { backgroundImage: `url(${user.user.userAvatar})` } : {}}>
                {!user.user.userAvatar && user.user.username.charAt(0).toUpperCase()}
              </div>
              <div className="chat-item-info">
                <span className="chat-item-name">{user.user.username.length > 20 ? user.user.username.slice(0, 20) + "..." : user.user.username}</span>
                <span style={{color: unseenUsers.includes(user.user._id) ? "#00FF00" : "rgba(255, 255, 255, 0.6)"}} className="chat-item-last-msg">
                  {user.lastMessage?.type === "post" 
                    ? "Shared a post" 
                    : user.lastMessage?.text.length > 20 ? user.lastMessage?.text.slice(0, 20) + "..." : user.lastMessage?.text}
                </span>
              </div>
              {unseenUsers.includes(user.user._id) && (
                <span className="unseen-indicator"></span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="chat-window">
        {activeChat ? (
          <>
            <div className="chat-window-header">
              <h3>{activeChat.user.username}</h3>
              {onlineUsers.includes(activeChat.user._id) && (
                <span className="online-dot"></span>
              )}
            </div>
              <div className="messages-list" ref={messagesContainerRef}>
                {messages.map((msg, index) => {
                  const prevMsg = messages[index - 1];
                  
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
                        <div className="message-bubble" style={msg.type === "post" ? { padding: '0', background: 'transparent', boxShadow: 'none' } : {}}>
                          {msg.type === "post" && msg.postId ? (
                            <div className="shared-postcard-wrapper" onClick={(e) => {
                               // verify it's not a button or link being clicked inside
                               if(e.target.closest('button') || e.target.closest('a')) return;
                               navigate(`/post/${msg.postId._id}/${msg.currentMediaIndex}`);
                            }}>
                               <PostCard mediaIndex={msg.currentMediaIndex} post={msg.postId} isChat={true} />
                            </div>
                          ) : (
                            msg.text
                          )}
                          <div className="message-info" style={msg.type === "post" ? { background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '10px', display: 'inline-flex', marginTop: '4px' } : {}}>
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
                {typingData.senderId === activeChat.user._id && typingData.isTyping && (
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