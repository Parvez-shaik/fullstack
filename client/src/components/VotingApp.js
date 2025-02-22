import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const VotingApp = ({ user }) => {
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState('');

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await axios.get(`${API_URL}/topics`);
      setTopics(response.data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const handleVote = async (topicId, vote) => {
    if (!user) {
      alert('Please log in to vote.');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/vote`,
        { topicId, vote },
        { withCredentials: true }
      );
      fetchTopics(); // Fetch updated votes
    } catch (error) {
      alert(error.response?.data?.message || 'Error while voting');
    }
  };

  const handleNewTopic = async () => {
    if (!user || user.role !== 'admin') {
      alert('Only admins can create topics.');
      return;
    }

    if (!newTopic.trim()) {
      alert('Topic name cannot be empty.');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/topics`,
        { name: newTopic },
        { withCredentials: true }
      );
      setNewTopic('');
      fetchTopics();
    } catch (error) {
      console.error('Error adding topic:', error);
    }
  };

  return (
    <div>
      <h1>Voting App</h1>

      {/* Admin - Create Topic */}
      {user && user.role === 'admin' && (
        <div>
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="New Topic"
          />
          <button onClick={handleNewTopic}>Add Topic</button>
        </div>
      )}

      {/* Display Topics */}
      {topics.map((topic) => (
        <div key={topic.id}>
          <h2>{topic.name}</h2>
          <button onClick={() => handleVote(topic.id, 'yes')}>
            Yes ({topic.yes_votes || 0})
          </button>
          <button onClick={() => handleVote(topic.id, 'no')}>
            No ({topic.no_votes || 0})
          </button>
        </div>
      ))}
    </div>
  );
};

export default VotingApp;
