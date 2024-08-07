import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Navbar.css'

function Navbar({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    axios.get('/logout')
      .then(response => {
        console.log(response.data);
        onLogout(); // Update the state in the parent component to reflect logout
        navigate('/login');
      })
      .catch(error => {
        console.error("There was an error logging out!", error);
      });
  };

  return (
    <nav className="navbar">
      <Link to="/">Home</Link>
      {isLoggedIn ? (
        <>
          <Link to="/add-auction-item">Add Auction Item</Link>
          <Link to="/profile">Profile</Link>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/register">Register</Link>
          <Link to="/login">Login</Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;
