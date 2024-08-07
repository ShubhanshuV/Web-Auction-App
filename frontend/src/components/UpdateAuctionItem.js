import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './UpdateAuctionItem.css';

function UpdateAuctionItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingBid, setStartingBid] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    axios.get(`/auction_items/${id}`)
      .then(response => {
        const { title, description, starting_bid, end_date } = response.data;
        setTitle(title);
        setDescription(description);
        setStartingBid(starting_bid);
        setEndDate(new Date(end_date).toISOString().slice(0, 16));
      })
      .catch(error => {
        console.error("There was an error fetching the auction item!", error);
      });
  }, [id]);

  const getNextDay = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Add 1 day
    today.setHours(today.getHours() + 5, today.getMinutes() + 30, 0, 0); // Add 5 hours and 30 minutes for IST
    return today.toISOString().slice(0, 16); // Format as 'YYYY-MM-DDTHH:MM'
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`/auction_items/${id}`, { title, description, starting_bid: startingBid, end_date: endDate })
      .then(response => {
        console.log(response.data);
        navigate(`/auction/${id}`);
      })
      .catch(error => {
        console.error("There was an error updating the auction item!", error);
      });
  };

  return (
    <div className="update-auction-item-container">
      <h1>Update Auction Item</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title:</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Starting Bid:</label>
          <input type="number" value={startingBid} onChange={e => setStartingBid(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>End Date:</label>
          <input type="datetime-local"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            min={getNextDay()} // Set minimum date to next day
            required/>
        </div>
        <button type="submit">Update Item</button>
      </form>
    </div>
  );
}

export default UpdateAuctionItem;
