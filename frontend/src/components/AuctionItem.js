import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './AuctionItem.css';

function AuctionItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    axios.get(`/auction_items/${id}`)
      .then(response => {
        setItem(response.data);
        setIsOwner(response.data.user_id === response.data.current_user_id);
      })
      .catch(error => {
        console.error("There was an error fetching the auction item!", error);
      });

    axios.get(`/auction_items/${id}/bids`)
      .then(response => {
        setBids(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the bids!", error);
      });
  }, [id]);

  const handleBid = (e) => {
    e.preventDefault();

    if (parseFloat(bidAmount) <= (item?.current_bid || 0)) {
      alert("Please enter a higher bid than the current bid.");
      setBidAmount(''); // Clear the input field
      return;
    }

    axios.post(`/auction_items/${id}/bid`, { amount: parseFloat(bidAmount) })
      .then(response => {
        console.log(response.data);
        setBidAmount('');
        axios.get(`/auction_items/${id}/bids`)
          .then(res => {
            setBids(res.data);
            // Refresh the item details to update the current bid
            axios.get(`/auction_items/${id}`)
              .then(itemResponse => {
                setItem(itemResponse.data);
              });
          });
      })
      .catch(error => {
        if (error.response && error.response.status === 400) {
          alert(error.response.data.message); // Show the server's message
          setBidAmount(''); // Clear the input field
        } else {
          console.error("There was an error placing the bid!", error.response?.data || error.message);
        }
      });
  };

  const handleUpdate = () => {
    navigate(`/update-auction-item/${id}`);
  };

  const handleDelete = () => {
    axios.delete(`/auction_items/${id}`)
      .then(response => {
        console.log(response.data);
        navigate('/');
      })
      .catch(error => {
        console.error("There was an error deleting the auction item!", error);
      });
  };

  const isAuctionLive = (endDate) => {
    // Get the current time in UTC
    const currentUTC = new Date();
    
    // Convert to IST by adding the UTC offset for IST (5 hours and 30 minutes)
    const currentIST = new Date(currentUTC.getTime() + (5.5 * 60 * 60 * 1000));
    
    // Compare the adjusted IST time with the auction end date
    return new Date(endDate) > currentIST;
  };
  

  if (!item) {
    return <div>Loading...</div>;
  }

  return (
    <div className="auction-item-container">
      <h1>{item.title}</h1>
      <p>{item.description}</p>
      <p>Starting Bid: ₹{item.starting_bid?.toFixed(2)}</p>
      <p>Current Bid: ₹{item.current_bid ? item.current_bid.toFixed(2) : item.starting_bid.toFixed(2)}</p>
      <p>Ends on: {new Date(item.end_date).toLocaleString()}</p>

      <h2>Bids</h2>
      <ul>
        {bids.map(bid => (
          <li key={bid.id}>Bid Amount: ₹{bid.amount?.toFixed(2)}</li>
        ))}
      </ul>

      {!isOwner && isAuctionLive(item.end_date) && (
        <form onSubmit={handleBid}>
          <div className="form-group">
            <label>Bid Amount (₹):</label>
            <input
              type="number"
              value={bidAmount}
              onChange={e => setBidAmount(e.target.value)}
              required
            />
          </div>
          <button type="submit">Place Bid</button>
        </form>
      )}

      {!isAuctionLive(item.end_date) && (
        <p style={{ color: 'red', fontWeight: 'bold' }}>This auction has ended. No more bids are allowed.</p>
      )}

      {isOwner && (
        <div className="owner-actions">
          <button onClick={handleUpdate}>Update Item</button>
          <button onClick={handleDelete}>Delete Item</button>
        </div>
      )}
    </div>
  );
}

export default AuctionItem;
