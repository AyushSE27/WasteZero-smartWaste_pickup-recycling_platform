import React, { useState, useEffect, useRef } from 'react';
import './messages.css';
import messageService from '../services/messageService';
import socket from '../services/socket';

const Messages = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef();

    // 1. Fetch conversation list on mount
    useEffect(() => {
        const fetchConversations = async () => {
            const data = await messageService.getConversations();
            setConversations(data);
        };
        fetchConversations();
    }, []);

    // 2. Load messages when a user is selected
    useEffect(() => {
        if (selectedUser) {
            const fetchMessages = async () => {
                const data = await messageService.getChatHistory(selectedUser._id);
                setMessages(data);
            };
            fetchMessages();
            socket.emit("join_chat", selectedUser._id);
        }
    }, [selectedUser]);

    // 3. Listen for real-time messages
    useEffect(() => {
        socket.on("receive_message", (message) => {
            setMessages((prev) => [...prev, message]);
        });
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const msgData = {
            receiverId: selectedUser._id,
            text: newMessage
        };

        const sentMsg = await messageService.sendMessage(msgData);
        setMessages([...messages, sentMsg]);
        setNewMessage("");
    };

    return (
        <div className="messaging-container">
            {/* Sidebar: User List */}
            <div className="chat-sidebar">
                <div className="search-bar">
                    <input type="text" placeholder="Search messages..." />
                </div>
                <div className="user-list">
                    {conversations.map(user => (
                        <div 
                            key={user._id} 
                            className={`user-item ${selectedUser?._id === user._id ? 'active' : ''}`}
                            onClick={() => setSelectedUser(user)}
                        >
                            <div className="avatar">U</div>
                            <div className="user-info">
                                <h4>{user.name}</h4>
                                <p className="last-msg">{user.lastMessage?.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            <div className="chat-window">
                {selectedUser ? (
                    <>
                        <div className="chat-header">
                            <div className="avatar">U</div>
                            <h3>{selectedUser.name}</h3>
                        </div>
                        <div className="message-list">
                            {messages.map((msg, index) => (
                                <div key={index} className={`message-wrapper ${msg.senderId === 'MY_ID' ? 'own' : ''}`}>
                                    <div className="message-bubble">
                                        <p>{msg.text}</p>
                                        <span className="timestamp">05:41 PM</span>
                                    </div>
                                </div>
                            ))}
                            <div ref={scrollRef} />
                        </div>
                        <form className="input-area" onSubmit={handleSend}>
                            <input 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..." 
                            />
                            <button type="submit" className="send-btn">➤</button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat">Select a conversation to start chatting</div>
                )}
            </div>
        </div>
    );
};

export default Messages;