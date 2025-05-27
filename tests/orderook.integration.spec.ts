import supertest from "supertest";
import { ResetOrderBook } from "../src/orderbook.instance";
import { Order } from "../src/orderbook.types";
import app from "../src/server";

const request = supertest(app);
Date.now = jest.fn(() => 1748339715477);

beforeEach(() => {
  ResetOrderBook();
});

describe("OrderBook Integration Tests", () => {
  it("should add a buy order", async () => {
    const order: Order = {
      id: "1",
      type: "buy",
      price: 100,
      quantity: 10,
      timestamp: Date.now(),
    };

    // Add the order
    const addResponse = await request.post("/orders").send(order);

    expect(addResponse.status).toBe(201);
    expect(addResponse.body).toEqual({ message: "Order added" });
  });

  it("should get best bid and ask", async () => {
    const buyOrder: Order = {
      id: "1",
      type: "buy",
      price: 100,
      quantity: 10,
      timestamp: Date.now(),
    };
    const sellOrder: Order = {
      id: "2",
      type: "sell",
      price: 105,
      quantity: 5,
      timestamp: Date.now(),
    };

    // Add orders
    await request.post("/orders").send(buyOrder);
    await request.post("/orders").send(sellOrder);

    // Get the order book
    const response = await request.get("/orderbook");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      bestBid: {
        price: 100,
        quantity: 10,
        timestamp: 1748339715477,
        type: "buy",
        id: "1",
      },
      bestAsk: {
        id: "2",
        price: 105,
        quantity: 5,
        timestamp: 1748339715477,
        type: "sell",
      },
    });
  });

  it("should execute a trade when a buy order matches a sell order", async () => {
    const buyOrder: Order = {
      id: "1",
      type: "buy",
      price: 100,
      quantity: 10,
      timestamp: Date.now(),
    };
    const sellOrder: Order = {
      id: "2",
      type: "sell",
      price: 95,
      quantity: 5,
      timestamp: Date.now(),
    };

    // Add orders
    await request.post("/orders").send(buyOrder);
    await request.post("/orders").send(sellOrder);

    // Get the trades
    const tradesResponse = await request.get("/trades");
    expect(tradesResponse.status).toBe(200);
    expect(tradesResponse.body).toHaveLength(1);
    expect(tradesResponse.body[0]).toEqual({
      buyOrderId: "1",
      sellOrderId: "2",
      price: 100,
      quantity: 5,
      timestamp: 1748339715477,
    });

    // Verify the remaining quantity of the buy order
    const orderBookResponse = await request.get("/orderbook");
    expect(orderBookResponse.body.bestBid).toEqual({
      id: "1",
      price: 100,
      quantity: 5, // Remaining quantity after trade
      timestamp: 1748339715477,
      type: "buy",
    });
  });

  it("should cancel an order", async () => {
    const order: Order = {
      id: "1",
      type: "buy",
      price: 100,
      quantity: 10,
      timestamp: Date.now(),
    };

    // Add the order
    await request.post("/orders").send(order);

    // Cancel the order
    const cancelResponse = await request.delete(`/orders/${order.id}`);
    expect(cancelResponse.status).toBe(200);
    expect(cancelResponse.body).toEqual({ message: "Order canceled" });

    // Verify the order is canceled
    const orderBookResponse = await request.get("/orderbook");
    expect(orderBookResponse.body.bestBid).toBeNull();
  });
});
