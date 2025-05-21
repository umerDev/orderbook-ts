import { Order } from "./orderbook.types";

export class OrderBook {
  private buyOrders: Order[] = [];
  private sellOrders: Order[] = [];

  constructor() {
    // Initialize the order book with empty buy and sell orders
  }

  get() {
    return {
      buyOrders: this.buyOrders,
      sellOrders: this.sellOrders,
    };
  }

  getBestBid() {
    if (this.buyOrders.length === 0) return null;
    this.buyOrders.sort((a, b) => b.price - a.price);
    return this.buyOrders[0];
  }

  addOrder(order: Order): void {
    switch (order.type) {
      case "buy":
        this.buyOrders.push(order);
        break;
      case "sell":
        this.sellOrders.push(order);
        break;
    }
  }
}
