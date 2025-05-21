export type OrderType = "buy" | "sell" | "market_sell" | "market_buy";

export interface Order {
  id: string;
  type: OrderType;
  price: number;
  quantity: number;
  timestamp: number;
}

export interface OrderBook {
  buyOrders: Order[];
  sellOrders: Order[];
  addOrder(order: Order): void;
  cancelOrder(orderId: string): boolean;
  getBestBid(): Order | null;
  getBestAsk(): Order | null;
}
