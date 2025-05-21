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

  cancelOrder(orderId: string): boolean {
    for (const orders of [this.buyOrders, this.sellOrders]) {
      const index = orders.findIndex((order) => order.id === orderId);
      if (index !== -1) {
        orders.splice(index, 1);
        return true;
      }
    }
    return false;
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
