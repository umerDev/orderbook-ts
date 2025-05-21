export type OrderType = "buy" | "sell" | "market_buy" | "market_sell";

export interface Order {
  id: string;
  type: OrderType;
  price: number;
  quantity: number;
  timestamp: number;
}

export interface Trade {
  buyOrderId: string;
  sellOrderId: string;
  price: number;
  quantity: number;
  timestamp: number;
}

export interface OrderBookInterface {
  /**
   * Get current state of the order book
   */
  get(): {
    buyOrders: Order[];
    sellOrders: Order[];
    tradeHistory: Trade[];
  };

  /**
   * Get the best ask (lowest sell order)
   */
  getBestAsk(): Order | null;

  /**
   * Get the best bid (highest buy order)
   */
  getBestBid(): Order | null;

  /**
   * Cancel an order by ID
   */
  cancelOrder(orderId: string): boolean;

  /**
   * Add an order to the book and attempt matching
   */
  addOrder(order: Order): Trade[];
}
