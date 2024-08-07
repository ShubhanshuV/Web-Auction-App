import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Profile.css';

function Profile() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/user/profile')
      .then(response => {
        setUserData(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the user profile!", error);
        setError("Failed to load profile data");
      });
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <h1>Profile</h1>
      <p>Username: {userData.username}</p>
      <p>Email: {userData.email}</p>

      <h2>Your Auction Items</h2>
      <div className="grid-container">
        {userData.auctions && userData.auctions.map(auction => (
          <div key={auction.id} className="grid-item">
            <h3>{auction.title}</h3>
            <p>{auction.description}</p>
          </div>
        ))}
      </div>

      <h2>Your Bids</h2>
      <div className="grid-container">
        {userData.bids && userData.bids.map(bid => (
          <div key={bid.id} className="grid-item">
            <h3>{bid.item_name}</h3>
            <p>Bid Amount: ₹{bid.amount.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Profile;
