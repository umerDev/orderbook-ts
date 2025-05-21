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

  getBestAsk(): Order | null {
    if (this.sellOrders.length === 0) return null;

    return this.sellOrders.reduce((best, curr) => {
      if (
        curr.price < best.price ||
        (curr.price === best.price && curr.timestamp < best.timestamp)
      ) {
        return curr;
      }
      return best;
    });
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

  matchMarketBuy(order: Order): void {
    // Sort by best price (lowest) and earliest timestamp
    this.sellOrders.sort(
      (a, b) => a.price - b.price || a.timestamp - b.timestamp
    );

    for (let i = 0; i < this.sellOrders.length && order.quantity > 0; ) {
      const sellOrder = this.sellOrders[i];
      const tradedQty = Math.min(order.quantity, sellOrder.quantity);

      console.log(`Market BUY: ${tradedQty} @ ${sellOrder.price}`);

      order.quantity -= tradedQty;
      sellOrder.quantity -= tradedQty;

      if (sellOrder.quantity === 0) {
        this.sellOrders.splice(i, 1); // Don't increment i
      } else {
        i++; // Only move to next order if current isn't fully filled
      }
    }
  }

  matchMarketSell(order: Order): void {
    this.buyOrders.sort(
      (a, b) => b.price - a.price || a.timestamp - b.timestamp
    );

    for (let i = 0; i < this.buyOrders.length && order.quantity > 0; ) {
      const buyOrder = this.buyOrders[i];
      const tradedQty = Math.min(order.quantity, buyOrder.quantity);

      console.log(`Market SELL: ${tradedQty} @ ${buyOrder.price}`);

      order.quantity -= tradedQty;
      buyOrder.quantity -= tradedQty;

      if (buyOrder.quantity === 0) {
        this.buyOrders.splice(i, 1);
      } else {
        i++;
      }
    }
  }

  addOrder(order: Order): void {
    switch (order.type) {
      case "buy":
        this.buyOrders.push(order);
        break;
      case "sell":
        this.sellOrders.push(order);
        break;
      case "market_buy":
        this.matchMarketBuy(order);
        break;
      case "market_sell":
        this.matchMarketSell(order);
        break;
    }
  }
}
