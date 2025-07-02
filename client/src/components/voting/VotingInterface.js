import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useVoting } from '../../hooks/useVoting';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Stack,
  Divider,
  Alert
} from '@mui/material';

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
    return <Typography align="center" color="text.secondary">Loading topics...</Typography>;
  }
  if (votingError) {
    return <Alert severity="error" sx={{ my: 4, maxWidth: 500, mx: 'auto' }}>Error loading topics: {votingError}</Alert>;
  }

  const topicsList = Array.isArray(topics) ? topics : [];

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}
      {user?.role === 'admin' && (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>Create Topic</Typography>
          <Box component="form" onSubmit={handleCreateTopic} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Topic Name"
              value={topicName}
              onChange={e => setTopicName(e.target.value)}
              required
              fullWidth
              size="medium"
            />
            <Button type="submit" variant="contained" color="success" size="large">
              Create
            </Button>
          </Box>
        </Paper>
      )}
      <Typography variant="h5" sx={{ mb: 2 }}>Topics</Typography>
      {topicsList.length === 0 ? (
        <Typography color="text.secondary">No topics available</Typography>
      ) : (
        <Stack spacing={3}>
          {topicsList.map((topic) => (
            <Paper key={topic.id} elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>{topic.name}</Typography>
              {user && (
                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                  <Button variant="contained" color="success" onClick={() => handleVote(topic.id, 1)}>Yes</Button>
                  <Button variant="contained" color="error" onClick={() => handleVote(topic.id, 0)}>No</Button>
                  <Button variant="outlined" onClick={() => fetchVotes(topic.id)}>Show Votes</Button>
                </Stack>
              )}
              {votes[topic.id] && (
                <Typography sx={{ mt: 1 }} color="text.secondary">
                  Yes: {votes[topic.id].yes_votes} &nbsp; No: {votes[topic.id].no_votes}
                </Typography>
              )}
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default VotingInterface; 