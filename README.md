# 💾 Order Book

A TypeScript implementation of a financial order book using **Test-Driven Development (TDD)**.

## 📋 Features

- **Buy Orders (Bids)**: Sorted by **descending** price (highest first).
- **Sell Orders (Asks)**: Sorted by **ascending** price (lowest first).
- **Order Matching**: Automatically matches when a bid price is **greater than or equal to** an ask price.

### Supported Order Types

- **Limit Orders**: Specify price and wait for a match.
- **Market Orders**: Execute immediately at the best available price.

### Order Structure

Each order contains:

- `id`: Unique identifier
- `type`: `"buy"` or `"sell"`
- `price`: Price per unit (optional for market orders)
- `quantity`: Number of units
- `timestamp`: Time the order was created

## 🛠️ API Methods

- `addOrder(order: Order)`: Inserts an order and attempts to match it.
- `cancelOrder(order: Order)`: Removes the specified order from the order book.
- `getBestBid()`: Returns the highest buy order.
- `getBestAsk()`: Returns the lowest sell order.
- `get()`: Returns the current state of the order book (both buy and sell sides).

## 🚀 Getting Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Run the tests

   ```bash
   npm run test
   ```
