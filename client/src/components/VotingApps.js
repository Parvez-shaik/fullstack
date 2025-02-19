import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VotingApp = () => {
    const [topics, setTopics] = useState([]);
    const [newTopic, setNewTopic] = useState('');
  
    useEffect(() => {
      axios.get('http://localhost:5000/api/topics')
        .then(response => setTopics(response.data))
        .catch(err => console.error(err));
    }, []);
  
    const handleVote = (topicId, vote) => {
      axios.post('http://localhost:5000/api/vote', { topicId, vote })
        .then(() => {
          // Update the local state after voting
          setTopics(topics.map(topic =>
            topic.id === topicId
              ? { 
                  ...topic, 
                  [vote === 'yes' ? 'yes_votes' : 'no_votes']: topic[vote === 'yes' ? 'yes_votes' : 'no_votes'] + 1 
                }
              : topic
          ));
        })
        .catch(err => console.error(err));
    };
  
    const handleNewTopic = () => {
      axios.post('http://localhost:5000/api/topics', { name: newTopic })
        .then(response => {
          setTopics([...topics, response.data]);
          setNewTopic('');
        })
        .catch(err => console.error(err));
    };
  
    return (
      <div>
        <h1>Voting App</h1>
        <div>
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="New Topic"
          />
          <button onClick={handleNewTopic}>Add Topic</button>
        </div>
  
        {topics.map(topic => (
          <div key={topic.id}>
            <h2>{topic.name}</h2>
            <button onClick={() => handleVote(topic.id, 'yes')}>Yes ({topic.yes_votes})</button>
            <button onClick={() => handleVote(topic.id, 'no')}>No ({topic.no_votes})</button>
          </div>
        ))}
      </div>
    );
  };
  

export default VotingApp;
