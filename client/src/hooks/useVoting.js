import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config';

// Configure axios defaults
// axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

export const useVoting = () => {
  const [topics, setTopics] = useState([]);
  const [votes, setVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching topics from:', API_ENDPOINTS.topics);
      const response = await axios.get(API_ENDPOINTS.topics, {
        withCredentials: true
      });
      console.log('Topics response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setTopics(response.data);
      } else {
        console.error('Invalid topics data format:', response.data);
        setError('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error fetching topics:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
      }
      setError(err.response?.data?.error || err.message || 'Failed to fetch topics');
    } finally {
      setLoading(false);
    }
  };

  const createTopic = async (topicName) => {
    if (!user) {
      return { success: false, error: "Please log in to create topics" };
    }
  
    if (user.role !== "admin") {
      return { success: false, error: "Only admins can create topics" };
    }
  
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        API_ENDPOINTS.topics,
        { name: topicName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      await fetchTopics();
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message ||
        (error.response?.status === 403
          ? "You don't have permission to create topics"
          : error.response?.status === 401
            ? "Please log in again"
            : "Failed to create topic");
  
      return { success: false, error: errorMessage };
    }
  };
  

  const vote = async (topicId, voteType) => {
    if (!user) {
      throw new Error("Please log in to vote");
    }
  
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        API_ENDPOINTS.vote,
        { topicId, vote: voteType === 'yes' ? 1 : 0 },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      await fetchVotes(topicId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Voting failed"
      };
    }
  };
  

  const fetchVotes = async (topicId) => {
    try {
      const response = await axios.get(API_ENDPOINTS.votes(topicId));
      setVotes((prev) => ({
        ...prev,
        [topicId]: response.data,
      }));
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch votes');
    }
  };
  

  return {
    topics,
    votes,
    loading,
    error,
    fetchVotes,
    createTopic,
    vote,
    refreshTopics: fetchTopics
  };
}; 