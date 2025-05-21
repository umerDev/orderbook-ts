# OrderBook Implementation Documentation

## Table of Contents

- [Introduction](#introduction)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
- [Order Matching Algorithm](#order-matching-algorithm)
- [Example Usage](#example-usage)
- [Advanced Topics](#advanced-topics)

## Introduction

The OrderBook is a TypeScript implementation of a trading order book that matches buy and sell orders using price-time priority. It supports both limit and market orders, provides methods for viewing the current state of the order book, and maintains a history of executed trades.

### What is an Order Book?

An order book is a central component in financial trading systems that:

- Maintains a record of all outstanding buy and sell orders
- Matches compatible orders according to a specific algorithm
- Records executed trades between counterparties
- Provides price discovery for the market

### Features of This Implementation

- Support for limit and market orders
- Price-time priority matching algorithm
- Trade history recording
- Order cancellation capabilities
- Type-safe implementation with TypeScript

## Core Concepts

### Order Types

The OrderBook supports four types of orders:

1. **Limit Buy**: A buy order with a maximum price the buyer is willing to pay
2. **Limit Sell**: A sell order with a minimum price the seller is willing to accept
3. **Market Buy**: A buy order that executes immediately at the best available prices
4. **Market Sell**: A sell order that executes immediately at the best available prices

### Data Structures

```typescript
export type OrderType = "buy" | "sell" | "market_buy" | "market_sell";

export interface Order {
  id: string;
  type: OrderType;
  price: number;
  quantity: number;
  timestamp: number;
}

export interface Trade {
  buyOrderId: string;
  sellOrderId: string;
  price: number;
  quantity: number;
  timestamp: number;
}
```

### Order Lifecycle

1. An order is submitted to the order book via `addOrder()`
2. The order is validated for correctness
3. The matching algorithm attempts to match it with existing orders
4. Any matched portions result in trades recorded in the trade history
5. Any unmatched portion of a limit order is added to the order book
6. Orders can be canceled at any time via `cancelOrder()`

## API Reference

### Constructor

```typescript
constructor();
```

Creates a new empty order book.

### Public Methods

#### get()

```typescript
get(): {
  buyOrders: Order[];
  sellOrders: Order[];
  tradeHistory: Trade[];
}
```

Returns the current state of the order book, including all active orders and trade history.

#### getBestAsk()

```typescript
getBestAsk(): Order | null
```

Returns the best (lowest price) sell order in the book, or null if there are no sell orders.

#### getBestBid()

```typescript
getBestBid(): Order | null
```

Returns the best (highest price) buy order in the book, or null if there are no buy orders.

#### cancelOrder()

```typescript
cancelOrder(orderId: string): boolean
```

Cancels an order by its ID. Returns `true` if the order was found and canceled, `false` otherwise.

#### addOrder()

```typescript
addOrder(order: Order): Trade[]
```

Adds an order to the book and attempts to match it with existing orders. Returns an array of trades that were executed as a result.

## Order Matching Algorithm

The OrderBook uses a price-time priority matching algorithm, which is standard in many financial markets.

### Price-Time Priority

Orders are matched based on:

1. Best price (highest for buys, lowest for sells)
2. Earliest timestamp (first come, first served)

### Limit Order Matching

When a limit order arrives:

1. The order book sorts the opposite side by price-time priority
2. The algorithm walks through potential matches
3. For each potential match, it checks price compatibility:
   - For buy orders: `sellOrder.price <= buyOrder.price`
   - For sell orders: `buyOrder.price >= sellOrder.price`
4. If prices are compatible, a trade executes at the resting order's price
5. The algorithm continues until the incoming order is fully filled or no more matches are available
6. Any unfilled quantity of the limit order is added to the order book

### Market Order Matching

Market orders follow a similar process but with key differences:

1. Price checks are skipped - a market order accepts any price
2. Market orders are never added to the book - they either fill completely or the unfilled portion is rejected
3. Market orders execute immediately against the best available prices

### Code Example: Limit Buy Matching

```typescript
private matchLimitBuy(order: Order): Trade[] {
  const executedTrades: Trade[] = [];

  // Sort by best price (lowest) and earliest timestamp
  this.sellOrders.sort(
    (a, b) => a.price - b.price || a.timestamp - b.timestamp
  );

  for (let i = 0; i < this.sellOrders.length && order.quantity > 0; ) {
    const sellOrder = this.sellOrders[i];

    // Stop matching if sell price is higher than buy limit
    if (sellOrder.price > order.price) break;

    const tradedQty = Math.min(order.quantity, sellOrder.quantity);

    executedTrades.push(
      this.recordTrade(order, sellOrder, tradedQty, sellOrder.price)
    );

    order.quantity -= tradedQty;
    sellOrder.quantity -= tradedQty;

    if (sellOrder.quantity === 0) {
      this.sellOrders.splice(i, 1); // Remove completed order
    } else {
      i++; // Move to next order
    }
  }

  // Add remaining order to book if not fully filled
  if (order.quantity > 0) {
    this.buyOrders.push(order);
  }

  return executedTrades;
}
```

## Example Usage

Here's how you might use the OrderBook in practice:

```typescript
import { OrderBook } from "./orderbook";
import { Order } from "./orderbook.types";

// Create a new order book
const orderBook = new OrderBook();

// Add a limit sell order
const sellOrder: Order = {
  id: "sell-123",
  type: "sell",
  price: 100,
  quantity: 10,
  timestamp: Date.now(),
};
orderBook.addOrder(sellOrder);

// Add a limit buy order
const buyOrder: Order = {
  id: "buy-456",
  type: "buy",
  price: 100,
  quantity: 5,
  timestamp: Date.now(),
};
const trades = orderBook.addOrder(buyOrder);

// See the resulting trades
console.log(trades);
// [{
//   buyOrderId: 'buy-456',
//   sellOrderId: 'sell-123',
//   price: 100,
//   quantity: 5,
//   timestamp: 1621234567890
// }]

// Check the order book state
const state = orderBook.get();
console.log(state.sellOrders);
// [{
//   id: 'sell-123',
//   type: 'sell',
//   price: 100,
//   quantity: 5,
//   timestamp: 1621234567890
// }]
```

## Advanced Topics

### Performance Considerations

For high-volume trading systems, several optimizations could be considered:

1. **Data Structure Optimization**: Replace arrays with more efficient data structures like binary heaps or order-statistic trees for faster insertion and retrieval
2. **Sorting Optimization**: Instead of sorting on each match, maintain a sorted state
3. **Batch Processing**: Process orders in batches during high-volume periods
4. **Memory Management**: Implement pooling for order objects to reduce garbage collection

### Adding New Features

The OrderBook could be extended with features such as:

#### Stop Orders

Stop orders become active only when the market price reaches a certain level.

```typescript
// Example implementation sketch
export type ExtendedOrderType = OrderType | "stop_buy" | "stop_sell";

interface StopOrder extends Order {
  type: "stop_buy" | "stop_sell";
  stopPrice: number;
}

// Would require additional processing in addOrder()
```

#### Iceberg Orders

Iceberg orders display only a portion of their total quantity to the market.

```typescript
interface IcebergOrder extends Order {
  visibleQuantity: number;
  totalQuantity: number;
}
```

#### Time-in-Force Options

Add expiration criteria for orders:

```typescript
interface OrderWithTIF extends Order {
  timeInForce: "GTC" | "IOC" | "FOK"; // Good-till-canceled, Immediate-or-cancel, Fill-or-kill
  expirationTime?: number;
}
```

### Real-World Considerations

In a production environment, additional features would be necessary:

1. **Persistence**: Save the order book state to a database
2. **Fault Tolerance**: Handle system failures gracefully
3. **Distributed Systems**: Scale across multiple nodes
4. **Reporting**: Generate reports for compliance and analysis
5. **Security**: Implement authentication and authorization
6. **Monitoring**: Track system health and performance

---

This documentation provides a comprehensive guide to the OrderBook implementation, covering its core functionality, API, and advanced topics for extension and optimization.
