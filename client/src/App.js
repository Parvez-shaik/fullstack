import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// import Register from "./components/Register";
import "./App.css";

const API_URL = "http://localhost:5000/api";

function App() {
  const [user, setUser] = useState(null);
  const [topics, setTopics] = useState([]);
  const [topicName, setTopicName] = useState("");
  const [votes, setVotes] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch topics on mount
  useEffect(() => {
    fetchTopics();
    fetchUserSession();
  }, []);

  const fetchUserSession = async () => {
    try {
      const response = await axios.get(`${API_URL}/session`, {
        withCredentials: true,
      });
      if (response.data.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.log("No user logged in");
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await axios.get(`${API_URL}/topics`);
      setTopics(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching topics:", error);
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

  const handleRegister = async (username, email, password) => {
    try {
      await axios.post(`${API_URL}/register`, { username, email, password });
      alert("Registration successful! Please log in.");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post(
        `${API_URL}/login`,
        { email, password },
        { withCredentials: true }
      );
      setUser(response.data.user);
    } catch (error) {
      alert("Login failed");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
      setUser(null);
    } catch (error) {
      console.error("Logout failed");
    }
  };

  const handleCreateTopic = async () => {
    if (!user || user.role !== "admin") {
      alert("Only admins can create topics");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/topics`,
        { name: topicName },
        { withCredentials: true }
      );
      setTopicName("");
      fetchTopics();
    } catch (error) {
      alert("Failed to create topic");
    }
  };

  const handleVote = async (topicId, vote) => {
    if (!user) {
      alert("Please log in to vote");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/vote`,
        { topicId, vote },
        { withCredentials: true }
      );
      fetchVotes(topicId);
    } catch (error) {
      alert(error.response?.data?.message || "Voting failed");
    }
  };

  return (
    
      <div className="app-container">
        <h1>My Voting App</h1>

        {/* User Authentication */}
        {!user ? (
          <div className="auth-container">
            <div className="auth-form">
              <h2>Login</h2>
              <input type="email" placeholder="Email" id="email" />
              <input type="password" placeholder="Password" id="password" />
              <button onClick={() => handleLogin(document.getElementById('email').value, document.getElementById('password').value)}>Login</button>
            </div>
            <div className="auth-form">
              <h2>Register</h2>
              <input type="text" placeholder="Username" id="reg-username" />
              <input type="email" placeholder="Email" id="reg-email" />
              <input type="password" placeholder="Password" id="reg-password" />
              <button onClick={() => handleRegister(document.getElementById('reg-username').value, document.getElementById('reg-email').value, document.getElementById('reg-password').value)}>Register</button>
            </div>
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
                <div className="vote-buttons">
                  <button onClick={() => handleVote(topic.id, 'yes')}>Yes</button>
                  <button onClick={() => handleVote(topic.id, 'no')}>No</button>
                  <button onClick={() => fetchVotes(topic.id)}>Show Votes</button>
                </div>

                {/* Display Votes */}
                {votes[topic.id] && (
                  <p>Yes: {votes[topic.id].yes_votes} | No: {votes[topic.id].no_votes}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

  );
}

export default App;
