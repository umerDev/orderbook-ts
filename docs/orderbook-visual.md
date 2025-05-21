```mermaid
flowchart TB
    subgraph "Order Book Components"
        OrderBook["OrderBook Class"]
        BuyOrders["Buy Orders Array"]
        SellOrders["Sell Orders Array"]
        TradeHistory["Trade History Array"]
        
        OrderBook --> BuyOrders
        OrderBook --> SellOrders
        OrderBook --> TradeHistory
    end
    
    subgraph "Order Processing Flow"
        NewOrder["New Order Arrives"]
        Validation["Order Validation"]
        OrderType{"Order Type?"}
        
        NewOrder --> Validation
        Validation --> OrderType
        
        OrderType -->|"Limit Buy"| MatchLimitBuy["Match against Sell Orders"]
        OrderType -->|"Limit Sell"| MatchLimitSell["Match against Buy Orders"]
        OrderType -->|"Market Buy"| MatchMarketBuy["Match against any Sell Orders"]
        OrderType -->|"Market Sell"| MatchMarketSell["Match against any Buy Orders"]
        
        subgraph "Matching Process"
            MatchLimitBuy --> CheckPrice["Check Price Compatibility"]
            MatchLimitSell --> CheckPrice
            MatchMarketBuy --> CalculateQty["Calculate Trade Quantity"]
            MatchMarketSell --> CalculateQty
            
            CheckPrice -->|"Compatible"| CalculateQty
            CheckPrice -->|"Incompatible"| StopMatching["Stop Matching"]
            
            CalculateQty --> RecordTrade["Record Trade in History"]
            RecordTrade --> UpdateQuantities["Update Order Quantities"]
            
            UpdateQuantities --> CheckComplete{"Order Complete?"}
            CheckComplete -->|"Yes"| RemoveOrder["Remove Order from Book"]
            CheckComplete -->|"No"| NextOrder["Move to Next Order"]
        end
        
        MatchLimitBuy --> CheckRemaining["Check for Remaining Quantity"]
        MatchLimitSell --> CheckRemaining
        MatchMarketBuy --> FinishMarket["Market Order Complete"]
        MatchMarketSell --> FinishMarket
        
        CheckRemaining -->|"Remaining > 0"| AddToBook["Add to Order Book"]
        CheckRemaining -->|"Remaining = 0"| OrderComplete["Order Complete"]
    end
    
    subgraph "API Methods"
        GetBook["get() - Return current state"]
        GetBestAsk["getBestAsk() - Get lowest sell"]
        GetBestBid["getBestBid() - Get highest buy"]
        AddOrder["addOrder() - Add and match order"]
        CancelOrder["cancelOrder() - Remove an order"]
        
        GetBook --> OrderBook
        GetBestAsk --> SellOrders
        GetBestBid --> BuyOrders
        AddOrder --> NewOrder
        CancelOrder --> OrderBook
    end
    ```