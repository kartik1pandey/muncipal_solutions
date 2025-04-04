import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  }
});

export const submitComment = async (text) => {
  try {
    const response = await API.post('/comment', { text });
    return response.data;
  } catch (error) {
    console.error('Error submitting comment:', error);
    throw error.response?.data || { error: "Network error" };
  }
};

export const getSummaries = async () => {
    try {
      const response = await API.get('/summaries');
      return {
        groups: Array.isArray(response.data?.groups) ? response.data.groups : [],
        total_comments: response.data?.total_comments || 0
      };
    } catch (error) {
      console.error('Error fetching summaries:', error);
      return { groups: [], total_comments: 0 }; // Return safe defaults
    }
  };