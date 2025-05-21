import cors from "cors";
import express from "express";
import { OrderBook } from "./orderbook";
import { Order } from "./orderbook.types";

const app = express();

app.use(cors());
app.use(express.json());

const orderBook = new OrderBook();

/**
 * POST /orders
 * Add a new order to the order book.
 */
app.post("/orders", (req, res) => {
  const order: Order = req.body;

  try {
    orderBook.addOrder(order);
    res.status(201).json({ message: "Order added" });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

/**
 * DELETE /orders/:id
 * Cancel an existing order by ID.
 */
app.delete("/orders/:id", (req, res) => {
  const id = req.params.id;
  const canceled = orderBook.cancelOrder(id);

  if (canceled) {
    res.status(200).json({ message: "Order canceled" });
  } else {
    res.status(404).json({ error: "Order not found" });
  }
});

/**
 * GET /orderbook
 * Get the current best bid and best ask from the order book.
 */
app.get("/orderbook", (_req, res) => {
  res.json({
    bestBid: orderBook.getBestBid(),
    bestAsk: orderBook.getBestAsk(),
  });
});

/**
 * GET /trades
 * Retrieve the trade history log.
 */
app.get("/trades", (_req, res) => {
  res.json(orderBook.getTradeHistory());
});

export default app;
