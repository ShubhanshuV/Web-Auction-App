import React, { useState } from 'react';
import axios from 'axios';
import './AddAuctionItem.css';

function AddAuctionItem() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingBid, setStartingBid] = useState('');
  const [endDate, setEndDate] = useState('');

  // Calculate the next day's date and time for the min attribute
  const getNextDay = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Add 1 day
    today.setHours(today.getHours() + 5, today.getMinutes() + 30, 0, 0); // Add 5 hours and 30 minutes for IST
    return today.toISOString().slice(0, 16); // Format as 'YYYY-MM-DDTHH:MM'
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('/auction_items', {
      title,
      description,
      starting_bid: parseFloat(startingBid),
      end_date: endDate,
    })
      .then(response => {
        console.log('Auction item added successfully:', response.data);
        // Redirect to home or another page after successful submission
        window.location.href = '/';
      })
      .catch(error => {
        console.error("There was an error adding the auction item!", error);
      });
  };

  return (
    <div className="add-auction-item-container">
      <h1>Add Auction Item</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Starting Bid (₹):</label>
          <input
            type="number"
            value={startingBid}
            onChange={e => setStartingBid(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>End Date:</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            min={getNextDay()} // Set minimum date to next day
            required
          />
        </div>
        <button type="submit">Add Item</button>
      </form>
    </div>
  );
}

export default AddAuctionItem;
