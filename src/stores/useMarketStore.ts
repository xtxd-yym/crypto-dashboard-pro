import { create } from 'zustand';
import axios from 'axios';
import { type MarketState, type Coin } from '../types/market';

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/coins/markets';

// Internal type for API response
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

export const useMarketStore = create<MarketState>((set, get) => {
  let abortController: AbortController | null = null;
  let ws: WebSocket | null = null;

  return {
    data: [],
    loading: false,
    error: null,
    isPolling: false,
    pollIntervalId: null,

    fetchMarketData: async (isBackground = false) => {
      if (abortController) {
        abortController.abort();
      }
      abortController = new AbortController();

      if (!isBackground) {
        set({ loading: true, error: null });
      }

      try {
        const response = await axios.get<RawCoinData[]>(COINGECKO_URL, {
          signal: abortController.signal,
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 50,
            page: 1,
            sparkline: true,
          },
        });

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
            price: raw.sparkline_in_7d?.price || [],
          },
        }));

        set({ data: cleanData, loading: false });
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }

        console.warn(error, "API Error, using fallback.");

        // Use fallback logic only if we have empty data
        if (get().data.length === 0) {
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
              sparklineIn7d: { price: [] },
            },
          ];
          set({ data: mockData, loading: false, error: 'Failed to fetch, showing cached/mock data' });
        } else {
          set({ loading: false });
        }
      }
    },

    startPolling: async () => {
      const { isPolling, fetchMarketData } = get();
      if (isPolling) return;

      // 1. Initial Fetch to get metadata + initial prices
      await fetchMarketData(false);

      // 2. Connect to Binance WebSocket for real-time updates
      if (ws) {
        ws.close();
      }

      ws = new WebSocket('wss://stream.binance.com:9443/ws/!miniTicker@arr');

      ws.onmessage = (event) => {
        try {
          const tickers = JSON.parse(event.data);

          // Optimization: Create a Map for O(1) lookup

          interface BinanceTicker {
            s: string;
            c: string;
          }
          const tickerMap = new Map<string, string>(tickers.map((t: BinanceTicker) => [t.s, t.c]));

          set((state) => {
            const updatedData = state.data.map((coin) => {
              const symbolUC = coin.symbol.toUpperCase();
              const pair = `${symbolUC}USDT`;
              const newPrice = tickerMap.get(pair);

              if (newPrice) {
                return {
                  ...coin,
                  currentPrice: parseFloat(newPrice),
                };
              }
              return coin;
            });
            return { data: updatedData };
          });
        } catch (e) {
          console.error("WS Parse Error", e);
        }
      };

      ws.onclose = () => {
        console.log("WS Disconnected");
      };

      set({ isPolling: true });
    },

    stopPolling: () => {
      if (ws) {
        ws.close();
        ws = null;
      }
      set({ isPolling: false });
    },
  };
});