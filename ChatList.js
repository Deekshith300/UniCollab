import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./ChatList.css";

function ChatList() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchChats();
    fetchUsers();
  }, []);

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/chats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(response.data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableUsers(response.data.filter(u => u._id !== user?.id));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleStartPrivateChat = async () => {
    if (!selectedUser) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/chats/private',
        { participantId: selectedUser },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage("Chat created successfully!");
      setShowNewChat(false);
      setSelectedUser("");
      fetchChats();
    } catch (error) {
      setMessage(error.response?.data?.message || "Error creating chat");
    }
  };

  const formatTime = (timestamp) => {
    const messageTime = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - messageTime) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return messageTime.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      });
    }
  };

  const getChatTitle = (chat) => {
    if (chat.type === 'private') {
      const otherParticipant = chat.participants.find(p => p._id !== user?.id);
      return otherParticipant ? otherParticipant.name : "Private Chat";
    } else {
      return chat.group ? chat.group.name : "Group Chat";
    }
  };

  const getChatAvatar = (chat) => {
    if (chat.type === 'private') {
      const otherParticipant = chat.participants.find(p => p._id !== user?.id);
      return otherParticipant ? otherParticipant.name.charAt(0).toUpperCase() : "?";
    } else {
      return chat.group ? chat.group.name.charAt(0).toUpperCase() : "G";
    }
  };

  const getLastMessage = (chat) => {
    if (!chat.lastMessage) return "No messages yet";
    
    const sender = chat.lastMessage.sender;
    const isOwnMessage = sender._id === user?.id;
    const prefix = isOwnMessage ? "You: " : `${sender.name}: `;
    
    return prefix + (chat.lastMessage.content || "No messages yet");
  };

  const filteredChats = chats.filter(chat => {
    const title = getChatTitle(chat).toLowerCase();
    const lastMessage = getLastMessage(chat).toLowerCase();
    const search = searchTerm.toLowerCase();
    return title.includes(search) || lastMessage.includes(search);
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading chats...</p>
      </div>
    );
  }

  return (
    <div className="chat-list-container">
      <header className="chat-list-header">
        <div className="header-content">
          <h1>Messages</h1>
          <div className="header-actions">
            <Link to="/" className="back-btn">← Back to Home</Link>
            <button 
              onClick={() => setShowNewChat(!showNewChat)}
              className="new-chat-btn"
            >
              {showNewChat ? 'Cancel' : 'New Chat'}
            </button>
          </div>
        </div>
      </header>

      {message && (
        <div className="message-banner">
          {message}
          <button onClick={() => setMessage("")} className="close-message">×</button>
        </div>
      )}

      {showNewChat && (
        <div className="new-chat-form">
          <h3>Start a New Private Chat</h3>
          <div className="form-group">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Select a user...</option>
              {availableUsers.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <button 
            onClick={handleStartPrivateChat}
            disabled={!selectedUser}
            className="start-chat-btn"
          >
            Start Chat
          </button>
        </div>
      )}

      <div className="search-container">
        <input
          type="text"
          placeholder="Search chats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <main className="chat-list-content">
        {filteredChats.length === 0 ? (
          <div className="empty-state">
            <h3>No chats yet</h3>
            <p>Start a conversation with someone or join a group to begin chatting!</p>
            <button 
              onClick={() => setShowNewChat(true)}
              className="start-first-chat-btn"
            >
              Start Your First Chat
            </button>
          </div>
        ) : (
          <div className="chats-list">
            {filteredChats.map(chat => (
              <Link key={chat._id} to={`/chats/${chat._id}`} className="chat-item">
                <div className="chat-avatar">
                  {getChatAvatar(chat)}
                </div>
                <div className="chat-info">
                  <div className="chat-header">
                    <h3>{getChatTitle(chat)}</h3>
                    {chat.lastMessage && (
                      <span className="chat-time">
                        {formatTime(chat.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>
                  <p className="chat-preview">
                    {getLastMessage(chat)}
                  </p>
                  <span className="chat-type">
                    {chat.type === 'private' ? 'Private Chat' : 'Group Chat'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default ChatList; 