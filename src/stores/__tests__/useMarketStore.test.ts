import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import axios from 'axios';
import { useMarketStore } from '../useMarketStore';

// 1. Mock Axios globally for this test file
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('useMarketStore Integration (Axios)', () => {
  // Reset store state before each test
  beforeEach(() => {
    act(() => {
        useMarketStore.setState({ 
            data: [], 
            loading: false, 
            error: null 
        });
    });
    // Clear mock history (call counts, etc.)
    mockedAxios.get.mockClear();
  });

  it('should fetch data and transform snake_case to camelCase', async () => {
    // Arrange: Define what the "Server" returns
    const mockApiResponse = {
      data: [
        {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          current_price: 50000, // snake_case
          market_cap: 1000000,
          sparkline_in_7d: { price: [1, 2, 3] }
        }
      ]
    };

    // Tell the mock to return this specific data when called
    mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

    const { result } = renderHook(() => useMarketStore());

    // Act: Trigger the fetch
    await act(async () => {
      await result.current.fetchMarketData();
    });

    // Assert 1: Verify Axios was actually called with correct URL
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('api.coingecko.com'), 
        expect.anything()
    );

    // Assert 2: Verify Transformation Logic (Snake -> Camel)
    // The store should have mapped 'current_price' to 'currentPrice'
    const storedCoin = result.current.data[0];
    
    expect(storedCoin).toBeDefined();
    expect(storedCoin.currentPrice).toBe(50000); // Check camelCase property
    expect(storedCoin.id).toBe('bitcoin');
    expect(result.current.loading).toBe(false);
  });

  it('should handle API errors by using fallback data', async () => {
    // Arrange: Simulate a Network Error (e.g., 500 Internal Server Error)
    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => useMarketStore());

    // Act
    await act(async () => {
      await result.current.fetchMarketData();
    });

    // Assert
    // 1. It should NOT crash.
    // 2. It should have loaded the Mock/Fallback data defined in our catch block.
    expect(result.current.data.length).toBeGreaterThan(0);
    expect(result.current.data[0].id).toBe('bitcoin'); // Our hardcoded fallback
  });
});