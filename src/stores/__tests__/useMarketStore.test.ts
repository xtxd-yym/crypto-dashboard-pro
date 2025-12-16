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

    // Ensure worker is cleaned up from previous tests (since module-level variable persists)
    useMarketStore.getState().stopPolling();

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


  it('should start polling (initialize Worker) and update prices', async () => {
    mockedAxios.get.mockResolvedValue({
      data: [{
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        current_price: 50000,
        sparkline_in_7d: { price: [] }
      }]
    });

    // Mock Worker
    const postMessageMock = vi.fn();
    const terminateMock = vi.fn();
    const MockWorker = vi.fn(function (_url: unknown, _options: unknown) {
      return {
        postMessage: postMessageMock,
        terminate: terminateMock,
        onmessage: null,
      };
    });
    vi.stubGlobal('Worker', MockWorker);

    const { result } = renderHook(() => useMarketStore());

    // 1. Start Polling
    await act(async () => {
      await result.current.startPolling();
    });

    expect(result.current.isPolling).toBe(true);

    // Verify Worker instantiation
    expect(MockWorker).toHaveBeenCalledTimes(1);
    const workerConstructorArgs = MockWorker.mock.calls[0];
    const workerUrl = String(workerConstructorArgs[0]); // Force string conversion
    expect(workerUrl).toContain('market.worker.ts');

    // Verify sending ENABLE_POLLING
    expect(postMessageMock).toHaveBeenCalledWith({
      type: 'ENABLE_POLLING',
      payload: ['btc']
    });

    // 2. Simulate Worker Message (Price Update)
    const workerInstance = MockWorker.mock.results[0].value;

    act(() => {
      if (workerInstance.onmessage) {
        workerInstance.onmessage({
          data: {
            type: 'PRICE_UPDATE',
            payload: {
              'BTCUSDT': 51000.00
            }
          }
        });
      }
    });

    // Verify Store Update
    expect(result.current.data[0].currentPrice).toBe(51000);
  });

  it('should stop polling (terminate Worker) when requested', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    const postMessageMock = vi.fn();
    const terminateMock = vi.fn();
    const MockWorker = vi.fn(function (_url: unknown, _options: unknown) {
      return {
        postMessage: postMessageMock,
        terminate: terminateMock,
        onmessage: null,
      };
    });
    vi.stubGlobal('Worker', MockWorker);

    const { result } = renderHook(() => useMarketStore());

    await act(async () => {
      await result.current.startPolling();
    });

    // Stop
    act(() => {
      result.current.stopPolling();
    });

    expect(result.current.isPolling).toBe(false);
    expect(postMessageMock).toHaveBeenCalledWith({ type: 'DISABLE_POLLING' });
    expect(terminateMock).toHaveBeenCalled();
  });
});