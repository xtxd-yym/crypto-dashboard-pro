import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type PortfolioState } from '../types/portfolio';
import { v4 as uuidv4 } from 'uuid';

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => ({
          items: [
            ...state.items,
            { ...newItem, id: uuidv4() } // Generate unique ID
          ],
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      // Helper to calculate total portfolio balance based on LIVE market prices
      getTotalValue: (currentPrices) => {
        const { items } = get();
        return items.reduce((total, item) => {
          const currentPrice = currentPrices[item.coinId] || 0;
          return total + (item.quantity * currentPrice);
        }, 0);
      },
    }),
    {
      name: 'crypto-portfolio-storage', // key in localStorage
    }
  )
);