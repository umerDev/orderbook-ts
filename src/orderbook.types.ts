export type OrderType = "buy" | "sell" | "market_sell" | "market_buy";

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

export interface OrderBook {
  buyOrders: Order[];
  sellOrders: Order[];
  tradeHistory: Trade[];
  get(): { buyOrders: Order[]; sellOrders: Order[]; tradeHistory: Trade[] };
  matchBuy(order: Order): void;
  matchSell(order: Order): void;
  addOrder(order: Order): void;
  cancelOrder(orderId: string): boolean;
  getBestBid(): Order | null;
  getBestAsk(): Order | null;
}
