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
- `type`: `"buy"`, `"sell"`, `"market_buy"`, or `"market_sell"`
- `price`: Price per unit (optional for market orders)
- `quantity`: Number of units
- `timestamp`: Time the order was created

## 🛠️ API Methods

- `addOrder(order: Order)`: Inserts an order and attempts to match it.
- `cancelOrder(orderId: string)`: Removes the specified order from the order book.
- `getBestBid()`: Returns the highest buy order.
- `getBestAsk()`: Returns the lowest sell order.
- `getTradeHistory()`: Returns an array of executed trades.

## 🚀 API Routes

| Method | Endpoint      | Description                      | Request Body      | Response                                                          |
| ------ | ------------- | -------------------------------- | ----------------- | ----------------------------------------------------------------- |
| POST   | `/orders`     | Add a new order                  | JSON Order object | `{ message: "Order added" }`                                      |
| DELETE | `/orders/:id` | Cancel an existing order         | —                 | `{ message: "Order canceled" }` or `{ error: "Order not found" }` |
| GET    | `/orderbook`  | Get the current best bid and ask | —                 | `{ bestBid: Order, bestAsk: Order }`                              |
| GET    | `/trades`     | Get the list of executed trades  | —                 | Array of trade objects                                            |

## 💻 Getting Started

1. Install dependencies

```bash
npm install
```

2. Start the server

```bash
npm run start
```

3. Run tests

```bash
npm run test
```

## 🔧 Example cURL Requests

Add a buy order:

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "id": "b1",
    "type": "buy",
    "price": 100,
    "quantity": 10,
    "timestamp": 1684200000000
  }'
```

Cancel an order:

```bash
curl -X DELETE http://localhost:3000/orders/b1
```

Get best bid and ask:

```bash
curl http://localhost:3000/orderbook
```

Get trade history:

```bash
curl http://localhost:3000/trades
```
