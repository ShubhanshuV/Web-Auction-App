import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('/login', { email, password })
      .then(response => {
        console.log(response.data);
        onLogin(); // Notify parent component about successful login
      })
      .catch(error => {
        if (error.response && error.response.status === 401) {
          setError(error.response.data.message); // Set the error message
        } else {
          setError('An unexpected error occurred. Please try again later.');
        }
        setTimeout(() => {
          window.location.reload(); // Reload the page after 2 seconds
        }, 2000);
      });
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <div className="show-password">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label>Show Password</label>
          </div>
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
