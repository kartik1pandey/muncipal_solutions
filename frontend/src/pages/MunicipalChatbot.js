import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './MunicipalChatbot.css'; // Create this file for styles

const MunicipalChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const userMessage = input.trim();
    if (!userMessage || loading) return;

    // Add user message
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5001/municipal-chat',
        { message: userMessage }
      );
      
      setMessages(prev => [...prev, {
        text: response.data.response,
        sender: 'bot',
        data: {
          isMunicipal: response.data.is_municipal,
          nextSteps: response.data.next_steps || [],
          contact: response.data.contact || ''
        }
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        text: "Failed to connect to municipal services. Please try again later.",
        sender: 'bot',
        data: { isMunicipal: false }
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <h2 className="chatbot-header">Municipal Helpdesk</h2>
      
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <p>{msg.text}</p>
            
            {msg.sender === 'bot' && msg.data.isMunicipal && (
              <div className="solution-box">
                {msg.data.nextSteps.length > 0 && (
                  <>
                    <h4>Next Steps:</h4>
                    <ul>
                      {msg.data.nextSteps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </>
                )}
                {msg.data.contact && (
                  <p className="contact-info">
                    <strong>Contact:</strong> {msg.data.contact}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
        {loading && <div className="loading-indicator">Municipal bot is responding...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your municipal issue..."
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={loading}
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim() || loading}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default MunicipalChatbot;