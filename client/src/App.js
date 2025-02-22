// import React, { useState } from 'react';
// import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
// import Login from './components/Login';
// import Register from './components/Register';
// import VotingApp from './components/VotingApp';

// const App = () => {
//   const [user, setUser] = useState(null); // Store user info here

//   // Handle user login and set the user state
//   const handleLogin = (userData) => {
//     setUser(userData);
//   };

//   return (
//     <Router>
//       <nav>
//         {/* Show links to pages */}
//         <Link to="/login">Login</Link>
//         <Link to="/register">Register</Link>
//         <Link to="/">Voting</Link>
//       </nav>
      
//       {/* Routes */}
//       <Routes>
//         <Route path="/login" element={<Login onLogin={handleLogin} />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/" element={<VotingApp user={user} />} />
//       </Routes>
//     </Router>
//   );
// };

// export default App;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; // Import router components
import Register from './components/Register';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [user, setUser] = useState(null);
  const [topics, setTopics] = useState([]);
  const [topicName, setTopicName] = useState('');
  const [votes, setVotes] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch topics on mount
  useEffect(() => {
    fetchTopics();
    fetchUserSession();
  }, []);

  const fetchUserSession = async () => {
    try {
      const response = await axios.get(`${API_URL}/session`, { withCredentials: true });
      if (response.data.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.log('No user logged in');
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await axios.get(`${API_URL}/topics`);
      setTopics(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching topics:', error);
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
      console.error('Error fetching votes:', error);
    }
  };

  const handleRegister = async (username, email, password) => {
    try {
      await axios.post(`${API_URL}/register`, { username, email, password });
      alert('Registration successful! Please log in.');
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password }, { withCredentials: true });
      setUser(response.data.user);
    } catch (error) {
      alert('Login failed');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
      setUser(null);
    } catch (error) {
      console.error('Logout failed');
    }
  };

  const handleCreateTopic = async () => {
    if (!user || user.role !== 'admin') {
      alert('Only admins can create topics');
      return;
    }

    try {
      await axios.post(`${API_URL}/topics`, { name: topicName }, { withCredentials: true });
      setTopicName('');
      fetchTopics();
    } catch (error) {
      alert('Failed to create topic');
    }
  };

  const handleVote = async (topicId, vote) => {
    if (!user) {
      alert('Please log in to vote');
      return;
    }

    try {
      await axios.post(`${API_URL}/vote`, { topicId, vote }, { withCredentials: true });
      fetchVotes(topicId);
    } catch (error) {
      alert(error.response?.data?.message || 'Voting failed');
    }
  };

  return (
    <Router> {/* Wrap everything in Router */}
    <div>
      <h1>Voting App</h1>

      <nav>
        <Link to="/register">Register</Link>
      </nav>

      <Routes>
        <Route path="/register" element={<Register />} />
      </Routes>

    
      {/* User Authentication */}
      {!user ? (
        <div>
          <h2>Login</h2>
          <input type="email" placeholder="Email" id="email" />
          <input type="password" placeholder="Password" id="password" />
          <button onClick={() => handleLogin(document.getElementById('email').value, document.getElementById('password').value)}>Login</button>
        </div>
      ) : (
        <div>
          <p>Welcome, {user.username} ({user.role})</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}

      {/* Admin - Create Topic */}
      {user && user.role === 'admin' && (
        <div>
          <h2>Create Topic</h2>
          <input type="text" value={topicName} onChange={(e) => setTopicName(e.target.value)} placeholder="Topic Name" />
          <button onClick={handleCreateTopic}>Create</button>
        </div>
      )}

      {/* Display Topics */}
      <h2>Topics</h2>
      {loading ? <p>Loading topics...</p> : topics.length === 0 ? <p>No topics available</p> : (
        <ul>
          {topics.map((topic) => (
            <li key={topic.id}>
              <strong>{topic.name}</strong>
              <button onClick={() => handleVote(topic.id, 'yes')}>Yes</button>
              <button onClick={() => handleVote(topic.id, 'no')}>No</button>
              <button onClick={() => fetchVotes(topic.id)}>Show Votes</button>

              {/* Display Votes */}
              {votes[topic.id] && (
                <p>Yes: {votes[topic.id].yes_votes} | No: {votes[topic.id].no_votes}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
    </Router>
  );
}

export default App;
