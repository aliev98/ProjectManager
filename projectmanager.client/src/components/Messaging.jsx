import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Messaging = ({ userId, projectId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`https://localhost:7166/api/Project/${projectId}/messages`, { withCredentials: true });
                setMessages(response.data);
            } catch (error) {
                console.error('Error fetching messages', error);
                setError('Failed to load messages.');
            }
        };

        fetchMessages();
    }, [projectId]);

    const handleSendMessage = async () => {
        if (newMessage.trim() === '') return; // Prevent sending empty messages
            //console.log('trying')
        var data = {
            UserId: userId,
            ProjectId: projectId,
            Content: newMessage
        }
        try {
            await axios.post(`https://localhost:7166/api/Project/send-message`,
                data,
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
            );

            // Refresh the messages
            const response = await axios.get(`https://localhost:7166/api/Project/${projectId}/messages`, { withCredentials: true });
            setMessages(response.data);
            setNewMessage('');
            setError(null);
        } catch (error) {
            console.error('Error sending message', error);
            setError('Failed to send message.');
        }
    };

    return (
        <div>
            <h2>Discussion</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div style={{display:'flex', marginBottom:'20px'}}>
                <textarea rows="3" cols="50" onChange={(e) => setNewMessage(e.target.value)} placeholder="Enter your message here..." maxLength="65"></textarea>

                <button onClick={handleSendMessage}>Send</button>
            </div>

            <div>
                {messages.map(message => (
                    <div key={message.id} className="message-container">
                        <p className="message-text">
                            <span className="message-username">{message.sender.userName}:</span>
                            <span className="message-content">{message.content}</span>
                            <span className="message-date">{new Date(message.sentAt).toISOString().split('T')[0]}</span>
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Messaging;