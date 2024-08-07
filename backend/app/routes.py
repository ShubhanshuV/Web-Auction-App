from flask import request, jsonify
from flask_login import login_user, logout_user, current_user, login_required
from app import app, db, bcrypt
from app.models import User, AuctionItem, Bid

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(username=data['username'], email=data['email'], password=hashed_password)
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json

    # Log the incoming data for debugging purposes
    print("Received login data:", data)

    email = data.get('email')
    password = data.get('password')

    # Check if email and password are provided
    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({'message': 'User does not exist'}), 401

    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({'message': 'Incorrect password'}), 401

    login_user(user)
    return jsonify({'message': 'Logged in successfully'}), 200

@app.route('/logout')
@login_required
def logout():
    
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/user/status', methods=['GET'])
def user_status():
    return jsonify({'isLoggedIn': current_user.is_authenticated}), 200

@app.route('/user/profile', methods=['GET'])
@login_required
def user_profile():
    user = User.query.get(current_user.id)
    auctions = AuctionItem.query.filter_by(user_id=current_user.id).all()
    bids = db.session.query(Bid, AuctionItem.title).join(AuctionItem).filter(Bid.user_id == current_user.id).all()

    auctions_data = [{'id': auction.id, 'title': auction.title, 'description': auction.description} for auction in auctions]
    bids_data = [{'id': bid.id, 'amount': bid.amount, 'item_name': title} for bid, title in bids]

    user_data = {
        'id':current_user.id,
        'username': user.username,
        'email': user.email,
        'auctions': auctions_data,
        'bids': bids_data
    }

    return jsonify(user_data)




@app.route('/auction_items', methods=['POST'])
@login_required
def create_auction_item():
    data = request.json
    auction_item = AuctionItem(
        title=data['title'],
        description=data['description'],
        starting_bid=data['starting_bid'],
        end_date=data['end_date'],
        user_id=current_user.id  # Associate the item with the current user
    )
    db.session.add(auction_item)
    db.session.commit()
    return jsonify({'message': 'Auction item created successfully'}), 201

@app.route('/auction_items', methods=['GET'])
def get_auction_items():
    items = AuctionItem.query.all()
    result = []
    for item in items:
        highest_bid = db.session.query(db.func.max(Bid.amount)).filter(Bid.auction_item_id == item.id).scalar()
        result.append({
            'id': item.id,
            'title': item.title,
            'description': item.description,
            'starting_bid': item.starting_bid,
            'current_bid': highest_bid or item.starting_bid,  # Default to starting bid if no bids
            'end_date': item.end_date.strftime('%Y-%m-%d %H:%M:%S'),
            'user_id': item.user_id
        })
    return jsonify(result)


@app.route('/auction_items/<int:item_id>', methods=['GET'])
def get_auction_item(item_id):
    item = AuctionItem.query.get(item_id)
    if item:
        highest_bid = db.session.query(db.func.max(Bid.amount)).filter(Bid.auction_item_id == item_id).scalar()
        item_data = {
            'id': item.id,
            'title': item.title,
            'description': item.description,
            'starting_bid': item.starting_bid,
            'current_bid': highest_bid or item.starting_bid,  # Use starting_bid if no bids
            'end_date': item.end_date.strftime('%Y-%m-%d %H:%M:%S'),
            'user_id': item.user_id,
            'current_user_id': current_user.id  # Ensure current user ID is included
        }
        return jsonify(item_data)
    return jsonify({'message': 'Auction item not found'}), 404


@app.route('/auction_items/<int:item_id>', methods=['PUT'])
@login_required
def update_auction_item(item_id):
    item = AuctionItem.query.get(item_id)
    if item and item.user_id == current_user.id:
        data = request.json
        item.title = data.get('title', item.title)
        item.description = data.get('description', item.description)
        item.starting_bid = data.get('starting_bid', item.starting_bid)
        item.end_date = data.get('end_date', item.end_date)
        db.session.commit()
        return jsonify({'message': 'Auction item updated successfully'})
    return jsonify({'message': 'Auction item not found or not authorized'}), 404

@app.route('/auction_items/<int:item_id>', methods=['DELETE'])
@login_required
def delete_auction_item(item_id):
    item = AuctionItem.query.get(item_id)
    if item and item.user_id == current_user.id:
        # First, delete all bids associated with the auction item
        Bid.query.filter_by(auction_item_id=item_id).delete()
        # Then, delete the auction item itself
        db.session.delete(item)
        db.session.commit()
        return jsonify({'message': 'Auction item and its bids deleted successfully'})
    return jsonify({'message': 'Auction item not found or not authorized'}), 404

@app.route('/auction_items/<int:item_id>/bid', methods=['POST'])
@login_required
def place_bid(item_id):
    data = request.json
    try:
        bid_amount = float(data['amount'])  # Convert bid amount to float
    except ValueError:
        return jsonify({'message': 'Invalid bid amount'}), 400

    item = AuctionItem.query.get(item_id)
    if item:
        highest_bid = db.session.query(db.func.max(Bid.amount)).filter(Bid.auction_item_id == item_id).scalar() or item.starting_bid
        if bid_amount > highest_bid:
            bid = Bid(amount=bid_amount, user_id=current_user.id, auction_item_id=item_id)
            db.session.add(bid)
            db.session.commit()
            return jsonify({'message': 'Bid placed successfully'}), 201
        else:
            return jsonify({'message': 'Bid must be higher than the current highest bid'}), 400
    return jsonify({'message': 'Auction item not found'}), 404



@app.route('/auction_items/<int:item_id>/bids', methods=['GET'])
def get_bids(item_id):
    bids = Bid.query.filter_by(auction_item_id=item_id).order_by(Bid.amount.desc()).all()
    return jsonify([{
        'id': bid.id,
        'amount': bid.amount,
        'user_id': bid.user_id,
        'auction_item_id': bid.auction_item_id
    } for bid in bids])

@app.route('/', methods=['GET'])
def home():
    # Redirect to another endpoint or provide a welcome message
    return jsonify({'message': 'Welcome to the Auction API!'})

