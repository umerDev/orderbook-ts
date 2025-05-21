import { OrderBook } from "../src/orderbook";
import { Order } from "../src/orderbook.types";

describe("OrderBook", () => {
  let orderBook: OrderBook;

  beforeEach(() => {
    orderBook = new OrderBook();
  });

  const createOrder = (
    id: string,
    type: Order["type"],
    price: number,
    quantity: number,
    timestamp = Date.now()
  ): Order => {
    return { id, type, price, quantity, timestamp };
  };

  describe("basic operations", () => {
    it("should create an orderbook instance", () => {
      // Arrange & Act done in beforeEach

      // Assert
      expect(orderBook).toBeDefined();
    });

    it("should add a buy order", () => {
      // Arrange
      const order = createOrder("1", "buy", 100, 10);

      // Act
      orderBook.addOrder(order);

      // Assert
      expect(orderBook.get().buyOrders).toEqual([order]);
    });

    it("should cancel an order", () => {
      // Arrange
      const order = createOrder("1", "buy", 100, 10);
      orderBook.addOrder(order);

      // Act
      const cancelled = orderBook.cancelOrder(order.id);

      // Assert
      expect(cancelled).toBe(true);
      expect(orderBook.get().buyOrders).toEqual([]);
    });
  });

  describe("best bid and best ask", () => {
    it("should get the best bid", () => {
      // Arrange
      const order = createOrder("1", "buy", 100, 10);
      orderBook.addOrder(order);

      // Act
      const bestBid = orderBook.getBestBid();

      // Assert
      expect(bestBid).toEqual(order);
    });

    it("should return highest price buy order as best bid", () => {
      // Arrange
      const order1 = createOrder("1", "buy", 101, 5);
      const order2 = createOrder("2", "buy", 105, 3);
      orderBook.addOrder(order1);
      orderBook.addOrder(order2);

      // Act
      const bestBid = orderBook.getBestBid();

      // Assert
      expect(bestBid).toEqual(order2);
    });

    it("should get the best ask", () => {
      // Arrange
      const order = createOrder("1", "sell", 100, 10);
      orderBook.addOrder(order);

      // Act
      const bestAsk = orderBook.getBestAsk();

      // Assert
      expect(bestAsk).toEqual(order);
    });

    it("should return lowest price sell order as best ask", () => {
      // Arrange
      const order1 = createOrder("1", "sell", 101, 5);
      const order2 = createOrder("2", "sell", 105, 3);
      orderBook.addOrder(order1);
      orderBook.addOrder(order2);

      // Act
      const bestAsk = orderBook.getBestAsk();

      // Assert
      expect(bestAsk).toEqual(order1);
    });
  });

  describe("market orders", () => {
    it("should execute market buy against best sell", () => {
      // Arrange
      const sellOrder = createOrder("s1", "sell", 100, 5);
      orderBook.addOrder(sellOrder);

      const marketBuy = createOrder("mb1", "market_buy", 0, 3);

      // Act
      orderBook.addOrder(marketBuy);
      const bestAsk = orderBook.getBestAsk();

      // Assert
      expect(bestAsk?.quantity).toBe(2);
    });

    it("should execute market sell against best buy", () => {
      // Arrange
      const buyOrder = createOrder("b1", "buy", 120, 4);
      orderBook.addOrder(buyOrder);

      const marketSell = createOrder("ms1", "market_sell", 0, 2);

      // Act
      orderBook.addOrder(marketSell);
      const bestBid = orderBook.getBestBid();

      // Assert
      expect(bestBid?.quantity).toBe(2);
    });
  });

  describe("limit order matching", () => {
    it("should fully match buy limit order with existing sell", () => {
      // Arrange
      const sellOrder = createOrder("s1", "sell", 100, 5);
      const buyOrder = createOrder("b1", "buy", 100, 5);

      // Act
      orderBook.addOrder(sellOrder);
      orderBook.addOrder(buyOrder);

      // Assert
      expect(orderBook.getBestAsk()).toBeNull();
      expect(orderBook.getBestBid()).toBeNull();
    });

    it("should partially match buy limit order and keep remainder", () => {
      // Arrange
      const sellOrder = createOrder("s1", "sell", 100, 3);
      const buyOrder = createOrder("b1", "buy", 100, 5);

      // Act
      orderBook.addOrder(sellOrder);
      orderBook.addOrder(buyOrder);

      const bestBid = orderBook.getBestBid();

      // Assert
      expect(bestBid?.quantity).toBe(2);
      expect(orderBook.getBestAsk()).toBeNull();
    });

    it("should fully match sell limit order with existing buy", () => {
      // Arrange
      const buyOrder = createOrder("b1", "buy", 105, 5);
      const sellOrder = createOrder("s1", "sell", 100, 5);

      // Act
      orderBook.addOrder(buyOrder);
      orderBook.addOrder(sellOrder);

      // Assert
      expect(orderBook.getBestBid()).toBeNull();
      expect(orderBook.getBestAsk()).toBeNull();
    });

    it("should partially match sell limit order and retain remainder", () => {
      // Arrange
      const buyOrder = createOrder("b1", "buy", 105, 2);
      const sellOrder = createOrder("s1", "sell", 100, 5);

      // Act
      orderBook.addOrder(buyOrder);
      orderBook.addOrder(sellOrder);

      const bestAsk = orderBook.getBestAsk();

      // Assert
      expect(bestAsk?.quantity).toBe(3);
    });
  });

  describe("trade history", () => {
    it("should record trades in trade history log", () => {
      // Arrange
      const sellOrder = createOrder("s1", "sell", 95, 3);
      const buyOrder = createOrder("b1", "buy", 100, 5);

      // Act
      orderBook.addOrder(sellOrder);
      orderBook.addOrder(buyOrder);

      const trades = orderBook.get().tradeHistory;

      // Assert
      expect(trades.length).toBe(1);
      expect(trades[0]).toMatchObject({
        buyOrderId: "b1",
        sellOrderId: "s1",
        price: 95,
        quantity: 3,
      });
    });
  });
});
