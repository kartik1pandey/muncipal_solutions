import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSummaries } from '../api';

export default function SummaryPage() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getSummaries();
        // Ensure we're working with an array
        const groups = response.groups || [];
        setSummaries(Array.isArray(groups) ? groups : []);
      } catch (err) {
        setError('Failed to load summaries');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Comment Summaries</h1>
      <button onClick={() => navigate('/')} style={{ marginBottom: 20 }}>
        Add New Comment
      </button>
      
      {summaries.length === 0 ? (
        <p>No comments yet. Add one to get started!</p>
      ) : (
        <div>
          {summaries.map((summary, index) => (
            <div key={index} style={{ 
              border: '1px solid #ccc', 
              padding: 10, 
              marginBottom: 10 
            }}>
              <h3>Summary: {summary.summary || 'No summary available'}</h3>
              <p>Number of comments: {summary.comments?.length || 0}</p>
              <div>
                <h4>All Comments:</h4>
                <ul>
                  {(summary.comments || []).map((comment, i) => (
                    <li key={i}>{comment}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}