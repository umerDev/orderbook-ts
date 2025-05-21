export type OrderType = "buy" | "sell";

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
  cancelOrder(orderId: string): void;
  getBestBid(): Order | null;
  getBestAsk(): Order | null;
}
