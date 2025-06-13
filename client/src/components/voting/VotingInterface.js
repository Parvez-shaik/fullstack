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
    return <p style={{ textAlign: 'center', color: '#6e6e73' }}>Loading topics...</p>;
  }
  if (votingError) {
    return <div style={{ background: '#ffe5e5', color: '#b00020', borderRadius: '12px', padding: '12px 16px', margin: '24px auto', fontSize: '1rem', border: '1px solid #ffb3b3', textAlign: 'center', maxWidth: 500 }}>Error loading topics: {votingError}</div>;
  }

  const topicsList = Array.isArray(topics) ? topics : [];

  return (
    <section style={{ background: 'var(--section-bg)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', padding: '48px 24px', border: '1px solid var(--divider)', margin: '0 auto', maxWidth: 700 }}>
      {error && (
        <div style={{ background: '#ffe5e5', color: '#b00020', borderRadius: '12px', padding: '12px 16px', marginBottom: 16, fontSize: '1rem', border: '1px solid #ffb3b3', textAlign: 'center' }}>{error}</div>
      )}
      {user?.role === 'admin' && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ marginBottom: 12 }}>Create Topic</h2>
          <form onSubmit={handleCreateTopic} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              type="text"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              placeholder="Topic Name"
              required
              style={{ flex: 1 }}
            />
            <button type="submit">Create</button>
          </form>
        </div>
      )}
      <h2 style={{ marginBottom: 12 }}>Topics</h2>
      {topicsList.length === 0 ? (
        <p style={{ color: '#6e6e73' }}>No topics available</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {topicsList.map((topic) => (
            <li key={topic.id} style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--divider)' }}>
              <div style={{ fontWeight: 600, fontSize: '1.15rem', marginBottom: 8 }}>{topic.name}</div>
              {user && (
                <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                  <button onClick={() => handleVote(topic.id, 'yes')}>Yes</button>
                  <button onClick={() => handleVote(topic.id, 'no')}>No</button>
                  <button onClick={() => fetchVotes(topic.id)} style={{ background: '#f5f5f7', color: 'var(--accent)', border: '1.5px solid var(--accent)', fontWeight: 500 }}>Show Votes</button>
                </div>
              )}
              {votes[topic.id] && (
                <div style={{ color: '#6e6e73', fontSize: '1rem', marginTop: 4 }}>
                  <span>Yes: {votes[topic.id].yes_votes}</span>{'  '}
                  <span style={{ marginLeft: 16 }}>No: {votes[topic.id].no_votes}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default VotingInterface; 