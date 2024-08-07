import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const [items, setItems] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Fetching auction items...");
    axios.get('/auction_items')
      .then(response => {
        console.log("Auction items fetched:", response.data);
        const sortedItems = response.data.sort((a, b) => new Date(b.end_date) - new Date(a.end_date));
        setItems(sortedItems);
      })
      .catch(error => {
        console.error("Error fetching auction items:", error);
      });
  
    console.log("Checking login status...");
    axios.get('/user/status')
      .then(response => {
        console.log("Login status:", response.data);
        setIsLoggedIn(response.data.isLoggedIn);
        if (response.data.isLoggedIn) {
          axios.get('/user/profile')
            .then(userResponse => {
              console.log("User profile fetched:", userResponse.data);
              setCurrentUserId(userResponse.data.id);
            })
            .catch(error => {
              console.error("Error fetching user profile:", error);
            });
        }
      })
      .catch(error => {
        console.error("Error checking login status:", error);
      });
  }, []);
  

  const handleItemClick = (itemId) => {
    if (!isLoggedIn) {
      alert("Please log in to view item details.");
      navigate('/login'); // Redirect to login page
    } else {
      navigate(`/auction/${itemId}`); // Navigate to item details page
    }
  };

  const isAuctionLive = (endDate) => {
    // Get the current time in UTC
    const currentUTC = new Date();
    
    // Convert to IST by adding the UTC offset for IST (5 hours and 30 minutes)
    const currentIST = new Date(currentUTC.getTime() + (5.5 * 60 * 60 * 1000));
    
    // Compare the adjusted IST time with the auction end date
    return new Date(endDate) > currentIST;
  };

  return (
    <div className="home-container">
      <h1>Available Auction Items</h1>
      <div className="auction-grid">
        {items.map(item => (
          <div key={item.id} className="auction-item">
            <div className="card" onClick={() => handleItemClick(item.id)}>
              <div className="card-front">
                <h2>{item.title}</h2>
                <p>Starting Bid: ₹{item.starting_bid?.toFixed(2)}</p>
                <p>Current Bid: ₹{item.current_bid?.toFixed(2)}</p>
                <p>Ends on: {new Date(item.end_date).toLocaleString()}</p>
                {item.user_id === currentUserId && (
                  <span className="user-label">Your Item</span>
                )}
                <span className={`status-label ${isAuctionLive(item.end_date) ? 'live' : 'ended'}`}>
                  {isAuctionLive(item.end_date) ? 'Live' : 'Ended'}
                </span>
              </div>
              <div className="card-back">
                <p>{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
