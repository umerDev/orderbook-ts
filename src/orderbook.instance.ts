import { OrderBook } from "./orderbook";

export const orderBook = new OrderBook();

export const ResetOrderBook = () => {
  orderBook.clear();
};
