import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config';

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
      const response = await axios.get(API_ENDPOINTS.topics);
      
      // Ensure response.data is an array
      const topicsData = Array.isArray(response.data) ? response.data : [];
      setTopics(topicsData);
    } catch (err) {
      console.error('Error fetching topics:', err);
      setError(err.response?.data?.message || 'Failed to fetch topics');
    } finally {
      setLoading(false);
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
      console.error("Error fetching votes:", error);
      setError(error.response?.data?.message || 'Failed to fetch votes');
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
      const response = await axios.post(
        API_ENDPOINTS.topics,
        { name: topicName },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      await fetchTopics();
      return { success: true };
    } catch (error) {
      console.error('Error creating topic:', error);
      const errorMessage = error.response?.data?.message || 
                         (error.response?.status === 403 ? "You don't have permission to create topics" : "Failed to create topic");
      return { success: false, error: errorMessage };
    }
  };

  const vote = async (topicId, vote) => {
    if (!user) {
      throw new Error("Please log in to vote");
    }

    try {
      await axios.post(
        API_ENDPOINTS.vote,
        { topicId, vote },
        { withCredentials: true }
      );
      await fetchVotes(topicId);
      return { success: true };
    } catch (error) {
      console.error('Error voting:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || "Voting failed" 
      };
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