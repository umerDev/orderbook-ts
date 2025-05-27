import { Order, OrderBookInterface, Trade } from "./orderbook.types";
/**
 * OrderBook implementation that manages buy and sell orders
 * and matches them using price-time priority
 */
export class OrderBook implements OrderBookInterface {
  private buyOrders: Order[] = [];
  private sellOrders: Order[] = [];
  private tradeHistory: Trade[] = [];

  public clear(): void {
    this.buyOrders = [];
    this.sellOrders = [];
    this.tradeHistory = [];
  }

  /**
   * Returns the current state of the order book
   */
  public get() {
    return {
      buyOrders: [...this.buyOrders],
      sellOrders: [...this.sellOrders],
      tradeHistory: [...this.tradeHistory],
    };
  }

  sortSellOrders() {
    this.sellOrders.sort(
      (a, b) => a.price - b.price || a.timestamp - b.timestamp
    );
  }

  sortBuyOrders() {
    this.buyOrders.sort(
      (a, b) => b.price - a.price || a.timestamp - b.timestamp
    );
  }

  /**
   * Returns the best ask (lowest sell) order
   */
  public getBestAsk(): Order | null {
    if (this.sellOrders.length === 0) return null;

    return this.sellOrders.reduce((best, current) => {
      if (
        current.price < best.price ||
        (current.price === best.price && current.timestamp < best.timestamp)
      ) {
        return current;
      }
      return best;
    }, this.sellOrders[0]);
  }

  /**
   * Returns the best bid (highest buy) order
   */
  public getBestBid(): Order | null {
    if (this.buyOrders.length === 0) return null;

    return this.buyOrders.reduce((best, current) => {
      if (
        current.price > best.price ||
        (current.price === best.price && current.timestamp < best.timestamp)
      ) {
        return current;
      }
      return best;
    }, this.buyOrders[0]);
  }

  /**
   * Cancels an order by ID
   * @param orderId The ID of the order to cancel
   * @returns True if order was found and canceled, false otherwise
   */
  public cancelOrder(orderId: string): boolean {
    for (const orders of [this.buyOrders, this.sellOrders]) {
      const index = orders.findIndex((order) => order.id === orderId);
      if (index !== -1) {
        orders.splice(index, 1);
        return true;
      }
    }
    console.warn("Order not found:", orderId);
    return false;
  }

  /**
   * Adds an order to the order book and attempts to match it
   * @param order The order to add
   * @returns Array of trades that were executed
   */
  public addOrder(order: Order): Trade[] {
    this.validateOrder(order);

    const executedTrades: Trade[] = [];

    switch (order.type) {
      case "buy":
        executedTrades.push(...this.matchLimitBuy(order));
        break;
      case "sell":
        executedTrades.push(...this.matchLimitSell(order));
        break;
      case "market_buy":
        executedTrades.push(...this.matchMarketBuy(order));
        break;
      case "market_sell":
        executedTrades.push(...this.matchMarketSell(order));
        break;
      default:
        throw new Error(`Invalid order type: ${order.type}`);
    }

    return executedTrades;
  }

  /**
   * Validates an order to ensure it's properly formed
   * @param order Order to validate
   */
  private validateOrder(order: Order): void {
    if (!order.id) {
      throw new Error("Order must have an ID");
    }

    if (order.quantity <= 0) {
      throw new Error("Order quantity must be positive");
    }

    if (order.type === "buy" || order.type === "sell") {
      if (order.price <= 0) {
        throw new Error("Limit order price must be positive");
      }
    }
  }

  /**
   * Creates a trade record and adds it to history
   */
  private recordTrade(
    buyOrder: Order,
    sellOrder: Order,
    quantity: number,
    price: number
  ): Trade {
    const trade: Trade = {
      buyOrderId: buyOrder.id,
      sellOrderId: sellOrder.id,
      price,
      quantity,
      timestamp: Date.now(),
    };

    this.tradeHistory.push(trade);
    return trade;
  }

  /**
   * Matches a limit buy order against the sell order book
   */
  private matchLimitBuy(order: Order): Trade[] {
    const executedTrades: Trade[] = [];

    // Sort by best price (lowest) and earliest timestamp
    this.sortSellOrders();

    for (let i = 0; i < this.sellOrders.length && order.quantity > 0; ) {
      const sellOrder = this.sellOrders[i];

      // Stop matching if sell price is higher than buy limit
      if (sellOrder.price > order.price) break;

      const tradedQty = Math.min(order.quantity, sellOrder.quantity);

      executedTrades.push(
        this.recordTrade(order, sellOrder, tradedQty, sellOrder.price)
      );

      order.quantity -= tradedQty;
      sellOrder.quantity -= tradedQty;

      if (sellOrder.quantity === 0) {
        this.sellOrders.splice(i, 1); // Remove completed order
      } else {
        i++; // Move to next order
      }
    }

    // Add remaining order to book if not fully filled
    if (order.quantity > 0) {
      this.buyOrders.push(order);
    }

    return executedTrades;
  }

  /**
   * Matches a limit sell order against the buy order book
   */
  private matchLimitSell(order: Order): Trade[] {
    const executedTrades: Trade[] = [];

    // Sort by best price (highest) and earliest timestamp
    this.sortBuyOrders();

    for (let i = 0; i < this.buyOrders.length && order.quantity > 0; ) {
      const buyOrder = this.buyOrders[i];

      // Stop matching if buy price is lower than sell limit
      if (buyOrder.price < order.price) break;

      const tradedQty = Math.min(order.quantity, buyOrder.quantity);

      executedTrades.push(
        this.recordTrade(buyOrder, order, tradedQty, buyOrder.price)
      );

      order.quantity -= tradedQty;
      buyOrder.quantity -= tradedQty;

      if (buyOrder.quantity === 0) {
        this.buyOrders.splice(i, 1); // Remove completed order
      } else {
        i++; // Move to next order
      }
    }

    // Add remaining order to book if not fully filled
    if (order.quantity > 0) {
      this.sellOrders.push(order);
    }

    return executedTrades;
  }

  /**
   * Matches a market buy order against the sell order book
   */
  private matchMarketBuy(order: Order): Trade[] {
    const executedTrades: Trade[] = [];

    // Sort by best price (lowest) and earliest timestamp
    this.sortSellOrders();

    for (let i = 0; i < this.sellOrders.length && order.quantity > 0; ) {
      const sellOrder = this.sellOrders[i];
      const tradedQty = Math.min(order.quantity, sellOrder.quantity);

      executedTrades.push(
        this.recordTrade(order, sellOrder, tradedQty, sellOrder.price)
      );

      order.quantity -= tradedQty;
      sellOrder.quantity -= tradedQty;

      if (sellOrder.quantity === 0) {
        this.sellOrders.splice(i, 1); // Remove completed order
      } else {
        i++; // Move to next order
      }
    }

    return executedTrades;
  }

  /**
   * Matches a market sell order against the buy order book
   */
  private matchMarketSell(order: Order): Trade[] {
    const executedTrades: Trade[] = [];

    // Sort by best price (highest) and earliest timestamp
    this.sortBuyOrders();

    for (let i = 0; i < this.buyOrders.length && order.quantity > 0; ) {
      const buyOrder = this.buyOrders[i];
      const tradedQty = Math.min(order.quantity, buyOrder.quantity);

      executedTrades.push(
        this.recordTrade(buyOrder, order, tradedQty, buyOrder.price)
      );

      order.quantity -= tradedQty;
      buyOrder.quantity -= tradedQty;

      if (buyOrder.quantity === 0) {
        this.buyOrders.splice(i, 1); // Remove completed order
      } else {
        i++; // Move to next order
      }
    }

    return executedTrades;
  }
}
