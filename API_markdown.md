# Auction API

## Overview

API documentation for the Auction Platform

- Version: 1.0.0
- Host: localhost:8000
- Schemes: http

## Paths

### POST /register

Register a new user

#### Parameters

- **body** (required)
  - **username** (string)
  - **email** (string)
  - **password** (string)

#### Responses

- 200 (Registration successful)
- 400 (Validation errors)

### POST /login

Log in user

#### Parameters

- **body** (required)
  - **email** (string)
  - **password** (string)

#### Responses

- 200 (Login successful)
- 401 (Invalid credentials)

### GET /auction_items

Get all auction items

#### Responses

- 200 (List of auction items)
  - Schema: array of [AuctionItem](#definition-AuctionItem)

### POST /auction_items

Add a new auction item

#### Parameters

- **body** (required)
  - [AuctionItem](#definition-AuctionItem)

#### Responses

- 201 (Item added successfully)
- 400 (Validation errors)

### GET /auction_items/{item_id}

Get a single auction item

#### Parameters

- **item_id** (required, integer) - ID of the auction item

#### Responses

- 200 (Auction item details)
  - Schema: [AuctionItem](#definition-AuctionItem)
- 404 (Item not found)

### DELETE /auction_items/{item_id}

Delete an auction item

#### Parameters

- **item_id** (required, integer) - ID of the auction item to be deleted

#### Responses

- 200 (Item deleted successfully)
- 404 (Item not found or not authorized)

### POST /auction_items/{item_id}/bid

Place a bid

#### Parameters

- **item_id** (required, integer) - ID of the auction item
- **body** (required)
  - **amount** (number)

#### Responses

- 200 (Bid placed successfully)
- 400 (Invalid bid amount)
- 404 (Auction item not found)

## Definitions

### AuctionItem

- **id** (integer)
- **title** (string)
- **description** (string)
- **starting_bid** (number)
- **current_bid** (number)
- **end_date** (string, date-time)
- **user_id** (integer)