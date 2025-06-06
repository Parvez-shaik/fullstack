import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useVoting } from '../../hooks/useVoting';

const VotingInterface = () => {
  const { user } = useAuth();
  const { topics, votes, loading, error: votingError, createTopic, vote, fetchVotes } = useVoting();
  const [topicName, setTopicName] = useState('');
  const [error, setError] = useState('');

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!user) {
      setError('Please log in to create topics');
      return;
    }

    if (user.role !== 'admin') {
      setError('Only admins can create topics');
      return;
    }

    const result = await createTopic(topicName);
    if (!result.success) {
      setError(result.error);
    } else {
      setTopicName('');
    }
  };

  const handleVote = async (topicId, voteType) => {
    if (!user) {
      setError('Please log in to vote');
      return;
    }

    try {
      const result = await vote(topicId, voteType);
      if (!result.success) {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return <p>Loading topics...</p>;
  }

  if (votingError) {
    return <p className="error-message">Error loading topics: {votingError}</p>;
  }

  // Ensure topics is an array before mapping
  const topicsList = Array.isArray(topics) ? topics : [];

  return (
    <div className="voting-interface">
      {error && <div className="error-message">{error}</div>}
      
      {user?.role === 'admin' && (
        <div className="create-topic">
          <h2>Create Topic</h2>
          <form onSubmit={handleCreateTopic}>
            <input
              type="text"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              placeholder="Topic Name"
              required
            />
            <button type="submit">Create</button>
          </form>
        </div>
      )}

      <h2>Topics</h2>
      {topicsList.length === 0 ? (
        <p>No topics available</p>
      ) : (
        <ul className="topics-list">
          {topicsList.map((topic) => (
            <li key={topic.id} className="topic-item">
              <strong>{topic.name}</strong>
              {user && (
                <div className="vote-buttons">
                  <button onClick={() => handleVote(topic.id, 'yes')}>Yes</button>
                  <button onClick={() => handleVote(topic.id, 'no')}>No</button>
                  <button onClick={() => fetchVotes(topic.id)}>Show Votes</button>
                </div>
              )}
              {votes[topic.id] && (
                <div className="vote-counts">
                  <span>Yes: {votes[topic.id].yes_votes}</span>
                  <span>No: {votes[topic.id].no_votes}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VotingInterface; 