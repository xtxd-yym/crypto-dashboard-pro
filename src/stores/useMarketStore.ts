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
  // Closure variable to manage request cancellation outside of state
  let abortController: AbortController | null = null;

  return {
    data: [],
    loading: false,
    error: null,
    isPolling: false,
    pollIntervalId: null,

    fetchMarketData: async (isBackground = false) => {
      // 1. Concurrency Control: Cancel any pending request
      if (abortController) {
        abortController.abort();
      }
      abortController = new AbortController();

      // 2. Silent Update: Only trigger global loading state if NOT a background poll
      if (!isBackground) {
        set({ loading: true, error: null });
      }

      try {
        const response = await axios.get<RawCoinData[]>(COINGECKO_URL, {
          signal: abortController.signal, // Connect abort signal
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
        // 3. Error Handling: Ignore abort errors (user navigation/race conditions)
        if (axios.isCancel(error)) {
          return;
        }

        console.warn(error, "API Error, using fallback.");
        
        // Only use fallback if we don't have data yet (optional strategy)
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
      }
    },

    startPolling: (intervalMs = 30000) => {
      const { pollIntervalId, data, fetchMarketData } = get();

      // Prevent duplicate timers
      if (pollIntervalId) return;

      // FIX: Determine if this is the "First Load" or a "Background Re-connection"
      // If data is empty, we MUST show the loading spinner.
      const hasExistingData = data.length > 0;

      // If we have data, isBackground = true (Silent).
      // If we have NO data, isBackground = false (Show Loading).
      fetchMarketData(hasExistingData);

      const id = setInterval(() => {
        // 4. Visibility Check: Save API calls when tab is hidden
        if (!document.hidden) {
          // Timer ticks are always background updates
          get().fetchMarketData(true);
        }
      }, intervalMs);

      set({ pollIntervalId: id, isPolling: true });
    },

    stopPolling: () => {
      const { pollIntervalId } = get();
      if (pollIntervalId) {
        clearInterval(pollIntervalId);
        set({ pollIntervalId: null, isPolling: false });
      }
    },
  };
});