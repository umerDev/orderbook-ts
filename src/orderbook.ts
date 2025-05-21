import { Order, Trade } from "./orderbook.types";

export class OrderBook implements OrderBook {
  private buyOrders: Order[] = [];
  private sellOrders: Order[] = [];
  private tradeHistory: Trade[] = [];

  constructor() {
    // Initialize the order book with empty buy and sell orders
  }

  get() {
    return {
      buyOrders: this.buyOrders,
      sellOrders: this.sellOrders,
      tradeHistory: this.tradeHistory,
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

  matchBuy(order: Order): void {
    this.sellOrders.sort(
      (a, b) => a.price - b.price || a.timestamp - b.timestamp
    );

    for (let i = 0; i < this.sellOrders.length && order.quantity > 0; ) {
      const sell = this.sellOrders[i];

      if (sell.price > order.price) break;

      const tradedQty = Math.min(order.quantity, sell.quantity);
      console.log(`Limit BUY matched: ${tradedQty} @ ${sell.price}`);

      this.tradeHistory.push({
        buyOrderId: order.id,
        sellOrderId: sell.id,
        price: sell.price,
        quantity: tradedQty,
        timestamp: Date.now(),
      });

      order.quantity -= tradedQty;
      sell.quantity -= tradedQty;

      if (sell.quantity === 0) {
        this.sellOrders.splice(i, 1);
      } else {
        i++;
      }
    }

    if (order.quantity > 0) {
      this.buyOrders.push(order);
    }
  }

  matchSell(order: Order): void {
    this.buyOrders.sort(
      (a, b) => b.price - a.price || a.timestamp - b.timestamp
    );

    for (let i = 0; i < this.buyOrders.length && order.quantity > 0; ) {
      const buy = this.buyOrders[i];

      if (buy.price < order.price) break;

      const tradedQty = Math.min(order.quantity, buy.quantity);
      console.log(`Limit SELL matched: ${tradedQty} @ ${buy.price}`);

      this.tradeHistory.push({
        buyOrderId: buy.id,
        sellOrderId: order.id,
        price: buy.price,
        quantity: tradedQty,
        timestamp: Date.now(),
      });

      order.quantity -= tradedQty;
      buy.quantity -= tradedQty;

      if (buy.quantity === 0) {
        this.buyOrders.splice(i, 1);
      } else {
        i++;
      }
    }

    if (order.quantity > 0) {
      this.sellOrders.push(order);
    }
  }

  addOrder(order: Order): void {
    switch (order.type) {
      case "buy":
        this.matchBuy(order);
        break;
      case "sell":
        this.matchSell(order);
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
