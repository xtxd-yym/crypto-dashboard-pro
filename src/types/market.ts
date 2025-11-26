// The AI initially used spark_line_in_7d (snake_case), which is typical for raw API responses. 
// To align with modern React standards, I enforced strict camelCase to ensure a more professional and consistent codebase.
export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;           // Was current_price
  marketCap: number;              // Was market_cap
  marketCapRank: number;          // Was market_cap_rank
  priceChangePercentage24h: number; // Was price_change_percentage_24h
  totalVolume: number;            // Was total_volume
  high24h: number;                // Was high_24h
  low24h: number;                 // Was low_24h
  sparklineIn7d: {                // Was sparkline_in_7d
    price: number[];
  };
}

export interface MarketState {
  data: Coin[];
  loading: boolean;
  error: string | null;
  fetchMarketData: () => Promise<void>;
}