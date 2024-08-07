import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import AuctionItem from './components/AuctionItem';
import AddAuctionItem from './components/AddAuctionItem';
import UpdateAuctionItem from './components/UpdateAuctionItem';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/user/status')
      .then(response => {
        setIsLoggedIn(response.data.isLoggedIn);
      })
      .catch(error => {
        console.error("There was an error checking the login status!", error);
      });
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate('/profile');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <div className="App">
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/auction/:id" element={<AuctionItem />} />
        <Route path="/add-auction-item" element={<AddAuctionItem />} />
        <Route path="/update-auction-item/:id" element={<UpdateAuctionItem />} />
      </Routes>
    </div>
  );
}

export default App;
