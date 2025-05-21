import { OrderBook } from "../src/orderbook";
import { Order } from "../src/orderbook.types";

// Requirements:
// Buy orders (bids) sorted by descending price (highest first)
// Sell orders (asks) sorted by ascending price (lowest first)

// Match when bid price ≥ ask price

// Orders can be:
// Limit orders: specify price
// Market orders: execute immediately at best available price

// Orders: each has id, type (buy or sell), price, quantity, and timestamp.
// addOrder(Order order) — main method to insert and try to match
// cancelOrder(Order order) — remove order from order book
// getBestBid() — return the highest buy order
// getBestAsk() — return the lowest sell order
// get() — return the order book (buy and sell orders)

describe("orderbook", () => {
  it("should create an orderbook", () => {
    const orderbook = new OrderBook();

    expect(orderbook).toBeDefined();
  });

  it("should add a buy order to the orderbook", () => {
    // arrange - Create an orderbook
    const orderbook = new OrderBook();

    const order: Order = {
      id: "1",
      type: "buy",
      price: 100,
      quantity: 10,
      timestamp: Date.now(),
    };

    // act - Create a buy order
    orderbook.addOrder(order);

    // assert - Add the order to the orderbook
    expect(orderbook.get().buyOrders).toEqual([order]);
  });

  it("should get the best bid", () => {
    // arrange - Create an orderbook
    const orderbook = new OrderBook();

    const order: Order = {
      id: "1",
      type: "buy",
      price: 100,
      quantity: 10,
      timestamp: Date.now(),
    };

    // act - Create a buy order
    orderbook.addOrder(order);
    const bestBid = orderbook.getBestBid();

    // assert - Add the order to the orderbook
    expect(bestBid).toEqual(order);
  });

  it("should return the highest price buy order as best bid", () => {
    // arrange - Create an orderbook
    const orderBook = new OrderBook();
    const order1: Order = {
      id: "1",
      type: "buy",
      price: 101,
      quantity: 5,
      timestamp: Date.now(),
    };
    const order2: Order = {
      id: "2",
      type: "buy",
      price: 105,
      quantity: 3,
      timestamp: Date.now(),
    };

    // act - Add orders to the orderbook
    orderBook.addOrder(order1);
    orderBook.addOrder(order2);

    // assert - Check the best bid
    const bestBid = orderBook.getBestBid();
    expect(bestBid).toEqual(order2);
  });

  it("should cancel an order", () => {
    // arrange - Create an orderbook
    const orderbook = new OrderBook();

    const order: Order = {
      id: "1",
      type: "buy",
      price: 100,
      quantity: 10,
      timestamp: Date.now(),
    };

    // act - Cancel the order
    orderbook.addOrder(order);
    const cancelOrder = orderbook.cancelOrder(order.id);

    // assert - Check the orderbook
    expect(cancelOrder).toBe(true);
    expect(orderbook.get().buyOrders).toEqual([]);
  });
});
