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
      const response = await axios.get(API_ENDPOINTS.topics);
      setTopics(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchVotes = async (topicId) => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.votes}/${topicId}`);
      setVotes((prev) => ({
        ...prev,
        [topicId]: response.data,
      }));
    } catch (error) {
      console.error("Error fetching votes:", error);
    }
  };

  const createTopic = async (topicName) => {
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can create topics");
    }

    try {
      await axios.post(
        `${API_ENDPOINTS.topics}`,
        { name: topicName },
        { withCredentials: true }
      );
      await fetchTopics();
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to create topic" };
    }
  };

  const vote = async (topicId, vote) => {
    if (!user) {
      throw new Error("Please log in to vote");
    }

    try {
      await axios.post(
        `${API_ENDPOINTS.vote}`,
        { topicId, vote },
        { withCredentials: true }
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