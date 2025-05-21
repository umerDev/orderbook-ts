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

  getBestBid(): Order | null {
    if (this.buyOrders.length === 0) return null;
    return this.buyOrders.reduce((best, curr) => {
      if (
        curr.price > best.price ||
        (curr.price === best.price && curr.timestamp < best.timestamp)
      ) {
        return curr;
      }
      return best;
    });
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
