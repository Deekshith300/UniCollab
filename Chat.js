import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import "./Chat.css";

function Chat() {
  const { chatId } = useParams();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Initialize socket connection
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);
    
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (chatId && user) {
      fetchChat();
    }
  }, [chatId, user]);

  useEffect(() => {
    if (socket && user) {
      // Join user's personal room
      socket.emit('join_user', user.id);
      
      // Listen for new messages
      socket.on('new_message', handleNewMessage);
      
      // Listen for typing indicators
      socket.on('user_typing', handleUserTyping);
      socket.on('user_stop_typing', handleUserStopTyping);
      
      return () => {
        socket.off('new_message');
        socket.off('user_typing');
        socket.off('user_stop_typing');
      };
    }
  }, [socket, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChat = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChat(response.data);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error("Error fetching chat:", error);
      setMessage(error.response?.data?.message || "Failed to fetch chats. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (data) => {
    if (data.chatId === chatId) {
      setMessages(prev => [...prev, data.message]);
    }
  };

  const handleUserTyping = (data) => {
    if (data.userId !== user.id) {
      setTypingUsers(prev => {
        if (!prev.find(u => u.userId === data.userId)) {
          return [...prev, { userId: data.userId, userName: data.userName }];
        }
        return prev;
      });
    }
  };

  const handleUserStopTyping = (data) => {
    setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/chats/${chatId}/messages`,
        { content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessages(response.data.messages);
      setNewMessage("");
      
      // Stop typing indicator
      if (socket && chat?.type === 'group') {
        socket.emit('stop_typing', { 
          groupId: chat.group._id,
          userId: user.id 
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessage(error.response?.data?.message || "Failed to send message. Please try again later.");
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      if (socket && chat?.type === 'group') {
        socket.emit('typing', {
          groupId: chat.group._id,
          userId: user.id,
          userName: user.name
        });
      }
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (socket && chat?.type === 'group') {
        socket.emit('stop_typing', {
          groupId: chat.group._id,
          userId: user.id
        });
      }
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatDate = (timestamp) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      });
    }
  };

  const getChatTitle = () => {
    if (!chat) return "";
    
    if (chat.type === 'private') {
      const otherParticipant = chat.participants.find(p => p._id !== user.id);
      return otherParticipant ? otherParticipant.name : "Private Chat";
    } else {
      return chat.group ? chat.group.name : "Group Chat";
    }
  };

  const getChatAvatar = () => {
    if (!chat) return "";
    
    if (chat.type === 'private') {
      const otherParticipant = chat.participants.find(p => p._id !== user.id);
      return otherParticipant ? otherParticipant.name.charAt(0).toUpperCase() : "?";
    } else {
      return chat.group ? chat.group.name.charAt(0).toUpperCase() : "G";
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading chat...</p>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="error-container">
        <h2>Chat not found</h2>
        <Link to="/chats" className="back-btn">Back to Chats</Link>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="section-divider"></div>
      <h2 className="section-heading animate-fade-in">Chat</h2>
      <div className="glass-section animate-fade-in" style={{marginBottom: '2.5rem', padding: '2rem'}}>
        {message && <div className="message">{message}</div>}
        <div className="chat-messages">
          {loading ? (
            <div className="loading">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="empty-state">No messages yet.</div>
          ) : (
            messages.map(msg => (
              <div key={msg._id} className="message-card animate-fade-in">
                <span className="message-author">{msg.author}</span>
                <span className="message-content">{msg.content}</span>
              </div>
            ))
          )}
        </div>
        <form onSubmit={handleSendMessage} className="send-message-form">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="message-input"
          />
          <button type="submit" className="send-btn glass-button">Send</button>
        </form>
      </div>
      <div className="section-divider"></div>
    </div>
  );
}

export default Chat; 