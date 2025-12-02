import { create } from 'zustand';
import axios from 'axios';
import { type MarketState, type Coin } from '../types/market';

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/coins/markets';

// 1. Define the Raw shape (What the API actually gives us)
// We keep this internal to this file so it doesn't leak elsewhere
interface RawCoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  sparkline_in_7d: { price: number[] };
}

export const useMarketStore = create<MarketState>((set) => ({
  data: [],
  loading: false,
  error: null,

  fetchMarketData: async () => {
    set({ loading: true, error: null });
    try {
      // 2. Fetch 'any' or 'RawCoinData[]'
      const response = await axios.get<RawCoinData[]>(COINGECKO_URL, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 50,
          page: 1,
          sparkline: true,
        },
      });

      // 3. Transform: Snake_case (API) -> camelCase (App)
      const cleanData: Coin[] = response.data.map((raw) => ({
        id: raw.id,
        symbol: raw.symbol,
        name: raw.name,
        image: raw.image,
        currentPrice: raw.current_price,
        marketCap: raw.market_cap,
        marketCapRank: raw.market_cap_rank,
        priceChangePercentage24h: raw.price_change_percentage_24h,
        totalVolume: raw.total_volume,
        high24h: raw.high_24h,
        low24h: raw.low_24h,
        sparklineIn7d: {
          price: raw.sparkline_in_7d?.price || [] 
        },
      }));

      set({ data: cleanData, loading: false });
    } catch (error) {
      console.warn(error, "API Error, using fallback.");
      // Even our mock data must now be camelCase
      const mockData: Coin[] = [
        { 
          id: 'bitcoin', 
          name: 'Bitcoin', 
          symbol: 'btc', 
          image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
          currentPrice: 64230, 
          priceChangePercentage24h: 2.4,
          marketCap: 1200000000,
          marketCapRank: 1,
          totalVolume: 50000000,
          high24h: 65000,
          low24h: 63000,
          sparklineIn7d: { price: [] }
        },
        // ... add more if needed
      ];
      
      set({ data: mockData, loading: false });
    }
  },
}));