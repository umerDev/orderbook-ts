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

  it("should return the lowest price sell order as best ask", () => {
    // arrange - Create an orderbook
    const orderBook = new OrderBook();

    const order1: Order = {
      id: "1",
      type: "sell",
      price: 101,
      quantity: 5,
      timestamp: Date.now(),
    };
    const order2: Order = {
      id: "2",
      type: "sell",
      price: 105,
      quantity: 3,
      timestamp: Date.now(),
    };

    // act - Add orders to the orderbook
    orderBook.addOrder(order1);
    orderBook.addOrder(order2);

    // assert - Check the best ask
    const bestAsk = orderBook.getBestAsk();
    expect(bestAsk).toEqual(order1);
  });

  it("should execute a market buy against the best available sell order", () => {
    // arrange - Create an orderbook
    const orderBook = new OrderBook();

    const sellOrder: Order = {
      id: "s1",
      type: "sell",
      price: 100,
      quantity: 5,
      timestamp: Date.now(),
    };

    // act - Add a sell order to the orderbook
    orderBook.addOrder(sellOrder);

    const marketBuy: Order = {
      id: "mb1",
      type: "market_buy",
      price: 0, // price is ignored
      quantity: 3,
      timestamp: Date.now(),
    };

    orderBook.addOrder(marketBuy);

    const bestAsk = orderBook.getBestAsk();

    // assert - Check the orderbook
    expect(bestAsk?.quantity).toBe(2); // 5 - 3
  });

  it("should execute a market sell against the best available buy order", () => {
    // arrange - Create an orderbook
    const orderBook = new OrderBook();

    const buyOrder: Order = {
      id: "b1",
      type: "buy",
      price: 120,
      quantity: 4,
      timestamp: Date.now(),
    };
    orderBook.addOrder(buyOrder);

    const marketSell: Order = {
      id: "ms1",
      type: "market_sell",
      price: 0,
      quantity: 2,
      timestamp: Date.now(),
    };

    // act - Add a market sell order to the orderbook
    orderBook.addOrder(marketSell);

    const bestBid = orderBook.getBestBid();

    // assert - Check the orderbook
    expect(bestBid?.quantity).toBe(2); // 4 - 2
  });

  it("should fully match a buy limit order with existing sell order", () => {
    // arrange - Create an orderbook
    const orderBook = new OrderBook();

    const sellOrder: Order = {
      id: "s1",
      type: "sell",
      price: 100,
      quantity: 5,
      timestamp: Date.now(),
    };

    const buyOrder: Order = {
      id: "b1",
      type: "buy",
      price: 100,
      quantity: 5,
      timestamp: Date.now(),
    };
    // act - Add orders to the orderbook
    orderBook.addOrder(sellOrder);
    orderBook.addOrder(buyOrder);

    // assert - Check the orderbook
    expect(orderBook.getBestAsk()).toBeNull();
    expect(orderBook.getBestBid()).toBeNull(); // fully matched
  });

  it("should partially match a buy limit order and keep remaining in the book", () => {
    // arrange - Create an orderbook
    const orderBook = new OrderBook();

    const sellOrder: Order = {
      id: "s1",
      type: "sell",
      price: 100,
      quantity: 3,
      timestamp: Date.now(),
    };

    const buyOrder: Order = {
      id: "b1",
      type: "buy",
      price: 100,
      quantity: 5,
      timestamp: Date.now(),
    };

    // act - Add orders to the orderbook
    orderBook.addOrder(sellOrder);
    orderBook.addOrder(buyOrder);

    const bestBid = orderBook.getBestBid();

    // assert - Check the orderbook
    expect(bestBid?.quantity).toBe(2); // 5 - 3
    expect(orderBook.getBestAsk()).toBeNull(); // fully consumed sell order
  });

  it("should match a sell limit order against buy orders", () => {
    // arrange - Create an orderbook
    const orderBook = new OrderBook();

    const buyOrder: Order = {
      id: "b1",
      type: "buy",
      price: 105,
      quantity: 5,
      timestamp: Date.now(),
    };

    const sellOrder: Order = {
      id: "s1",
      type: "sell",
      price: 100,
      quantity: 5,
      timestamp: Date.now(),
    };

    // act - Create an orderbook and add orders
    orderBook.addOrder(buyOrder);
    orderBook.addOrder(sellOrder);

    // assert - Check the orderbook
    expect(orderBook.getBestBid()).toBeNull();
    expect(orderBook.getBestAsk()).toBeNull();
  });

  it("should partially match a sell limit order and retain remainder", () => {
    // arrange - Create an orderbook
    const orderBook = new OrderBook();

    const buyOrder: Order = {
      id: "b1",
      type: "buy",
      price: 105,
      quantity: 2,
      timestamp: Date.now(),
    };

    const sellOrder: Order = {
      id: "s1",
      type: "sell",
      price: 100,
      quantity: 5,
      timestamp: Date.now(),
    };

    // act - Add orders to the orderbook
    orderBook.addOrder(buyOrder);
    orderBook.addOrder(sellOrder);
    const bestAsk = orderBook.getBestAsk();

    // assert - Check the orderbook
    expect(bestAsk?.quantity).toBe(3); // 5 - 2
  });

  it("should record trades in trade history log", () => {
    // arrange - Create an orderbook
    const orderBook = new OrderBook();

    const buyOrder: Order = {
      id: "b1",
      type: "buy",
      price: 100,
      quantity: 5,
      timestamp: Date.now(),
    };

    const sellOrder: Order = {
      id: "s1",
      type: "sell",
      price: 95,
      quantity: 3,
      timestamp: Date.now(),
    };

    // Add resting order first
    orderBook.addOrder(sellOrder);
    orderBook.addOrder(buyOrder);
    const trades = orderBook.getTradeHistory();

    // assert - Check the orderbook
    expect(trades.length).toBe(1);
    expect(trades[0]).toMatchObject({
      buyOrderId: "b1",
      sellOrderId: "s1",
      price: 95, // now matches sell resting order price
      quantity: 3,
    });
  });
});
