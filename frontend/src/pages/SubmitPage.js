import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitComment } from '../api';

export default function SubmitPage() {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please enter a comment');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await submitComment(text);
      setText('');
      navigate('/summary');
    } catch (err) {
      setError('Failed to submit comment. Please try again.');
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Add a Comment</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ width: '100%', height: 150, marginBottom: 10 }}
          required
          disabled={isSubmitting}
        />
        <button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      <button 
        onClick={() => navigate('/summary')} 
        style={{ marginTop: 10 }}
      >
        View Summaries
      </button>
        <button 
            onClick={() => navigate('/muncipal-chat')} 
            style={{ marginTop: 10, marginLeft: 10 }}
            >Chatbot</button>
    </div>
  );
}