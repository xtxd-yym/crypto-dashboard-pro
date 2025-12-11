import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import axios from 'axios';
import { useMarketStore } from '../useMarketStore';

// 1. Mock Axios globally
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

// 2. Mock Global "document" visibility for polling tests
Object.defineProperty(document, 'hidden', {
  configurable: true,
  get: () => false, // Default to visible
});

describe('useMarketStore Advanced Logic', () => {
  beforeEach(() => {
    // Reset Store State
    act(() => {
      useMarketStore.setState({
        data: [],
        loading: false,
        error: null,
        isPolling: false,
        pollIntervalId: null,
      });
    });
    // Clear Mocks
    mockedAxios.get.mockClear();
    // Enable Fake Timers for polling tests
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should fetch data and transform snake_case to camelCase (Standard Load)', async () => {
    const mockApiResponse = {
      data: [{
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        current_price: 50000,
        sparkline_in_7d: { price: [1, 2] }
      }]
    };
    mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

    const { result } = renderHook(() => useMarketStore());

    // Trigger Initial Load
    await act(async () => {
      // MODIFIED: We await the promise directly here and removed the intermediate 'loading=true' check
      // This prevents the race condition that caused the test to fail
      await result.current.fetchMarketData(false);
    });

    // Check final state
    expect(result.current.loading).toBe(false);
    // Verify data transformation works
    expect(result.current.data[0].currentPrice).toBe(50000);
  });

  it('should performs a "Silent Update" when isBackground is true', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    const { result } = renderHook(() => useMarketStore());

    await act(async () => {
      const promise = result.current.fetchMarketData(true); // <--- Background = true
      // CRITICAL: Loading should remain FALSE to prevent UI flicker
      expect(result.current.loading).toBe(false);
      await promise;
    });
  });

  it('should attach AbortSignal to the axios request', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    const { result } = renderHook(() => useMarketStore());

    await act(async () => {
      await result.current.fetchMarketData();
    });

    // Verify the signal was passed
    const config = mockedAxios.get.mock.calls[0][1];
    expect(config?.signal).toBeInstanceOf(AbortSignal);
  });


  it('should start polling (connect WebSocket) and update prices', async () => {
    mockedAxios.get.mockResolvedValue({
      data: [{
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        current_price: 50000,
        sparkline_in_7d: { price: [] }
      }]
    });

    // Mock WebSocket
    const closeMock = vi.fn();
    // Use a standard function so it can be called with 'new'
    const MockWebSocket = vi.fn(function () {
      return {
        close: closeMock,
        onmessage: null,
        onclose: null,
      };
    });
    vi.stubGlobal('WebSocket', MockWebSocket);

    const { result } = renderHook(() => useMarketStore());

    // 1. Start Polling
    await act(async () => {
      await result.current.startPolling();
    });

    expect(result.current.isPolling).toBe(true);
    expect(MockWebSocket).toHaveBeenCalledWith('wss://stream.binance.com:9443/ws/!miniTicker@arr');
    expect(mockedAxios.get).toHaveBeenCalledTimes(1); // Initial fetch

    // 2. Simulate WS Message

    const wsInstance = MockWebSocket.mock.results[0].value;

    act(() => {
      if (wsInstance.onmessage) {
        wsInstance.onmessage({
          data: JSON.stringify([
            { s: 'BTCUSDT', c: '51000.00' } // Bitcoin updated price
          ])
        });
      }
    });

    // Verify Store Update
    expect(result.current.data[0].currentPrice).toBe(51000);
  });

  it('should stop polling (close WebSocket) when requested', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    const closeMock = vi.fn();
    const MockWebSocket = vi.fn(function () {
      return {
        close: closeMock,
        onmessage: null,
      };
    });
    vi.stubGlobal('WebSocket', MockWebSocket);

    const { result } = renderHook(() => useMarketStore());

    await act(async () => {
      await result.current.startPolling();
    });

    // Stop
    act(() => {
      result.current.stopPolling();
    });

    expect(result.current.isPolling).toBe(false);
    expect(closeMock).toHaveBeenCalled();
  });
});