import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = "http://localhost:5000/api";

export const useVoting = () => {
  const [topics, setTopics] = useState([]);
  const [votes, setVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await axios.get(`${API_URL}/topics`);
      setTopics(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching topics:", error);
      setLoading(false);
    }
  };

  const fetchVotes = async (topicId) => {
    try {
      const response = await axios.get(`${API_URL}/votes/${topicId}`);
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
        `${API_URL}/topics`,
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
        `${API_URL}/vote`,
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
    fetchVotes,
    createTopic,
    vote,
    refreshTopics: fetchTopics
  };
}; 