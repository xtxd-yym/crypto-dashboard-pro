import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { usePortfolioStore } from '../usePortfolioStore';

describe('usePortfolioStore Logic', () => {
  // 1. Reset Store State before every test
  // This ensures a clean slate and prevents "leaky tests" from the persist middleware
  beforeEach(() => {
    act(() => {
      usePortfolioStore.setState({ items: [] });
    });
  });

  it('should add an item and auto-generate a UUID', () => {
    const { result } = renderHook(() => usePortfolioStore());

    const newItem = {
      coinId: 'bitcoin',
      quantity: 0.5,
      purchasePrice: 40000,
    };

    act(() => {
      result.current.addItem(newItem);
    });

    // Assertions
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual(expect.objectContaining({
      coinId: 'bitcoin',
      quantity: 0.5,
      purchasePrice: 40000
    }));
    
    // Crucial: Verify UUID was generated (we don't care what it is, just that it exists)
    expect(result.current.items[0].id).toEqual(expect.any(String));
  });

  it('should remove an item by its ID', () => {
    const { result } = renderHook(() => usePortfolioStore());

    // 1. Add an item first
    act(() => {
      result.current.addItem({
        coinId: 'ethereum',
        quantity: 2,
        purchasePrice: 2000
      });
    });

    // 2. Retrieve the generated ID
    const addedItemId = result.current.items[0].id;

    // 3. Remove it
    act(() => {
      result.current.removeItem(addedItemId);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('should correctly calculate total portfolio value based on live prices', () => {
    const { result } = renderHook(() => usePortfolioStore());

    // Scenario:
    // 1. Own 0.5 BTC (Bought at 40k)
    // 2. Own 10 ETH (Bought at 1.5k)
    act(() => {
      result.current.addItem({ coinId: 'bitcoin', quantity: 0.5, purchasePrice: 40000 });
      result.current.addItem({ coinId: 'ethereum', quantity: 10, purchasePrice: 1500 });
    });

    // Mock Live Market Data (The prices right now)
    const mockCurrentPrices = {
      bitcoin: 60000,  // BTC price
      ethereum: 3000,  // ETH price
      solana: 100      // Irrelevant coin
    };

    // Calculation:
    // BTC: 0.5 * 60000 = 30000
    // ETH: 10 * 3000   = 30000
    // Total: 60000
    const totalValue = result.current.getTotalValue(mockCurrentPrices);

    expect(totalValue).toBe(60000);
  });

  it('should handle missing price data gracefully (treat as 0)', () => {
    const { result } = renderHook(() => usePortfolioStore());

    act(() => {
      result.current.addItem({ coinId: 'unknown-coin', quantity: 100, purchasePrice: 5 });
    });

    // Price map missing 'unknown-coin'
    const totalValue = result.current.getTotalValue({});

    expect(totalValue).toBe(0);
  });
});