/**
 * @hook useAppHydration
 * @description
 * Manages the global data lifecycle for the application.
 * * @role
 * 1. Hydration: Ensures market data exists immediately upon app entry (deep links).
 * 2. Synchronization: Keeps market data fresh globally (Polling).
 * * @usage
 * Call this hook ONCE in our <MainLayout /> or <App /> component.
 */

import { useEffect } from 'react';
import { useMarketStore } from '../stores/useMarketStore';

export const useAppHydration = () => {
  // We utilize the store's "Smart Actions" which already handle
  // concurrency (AbortController) and duplication checks.
  const startPolling = useMarketStore((state) => state.startPolling);
  const stopPolling = useMarketStore((state) => state.stopPolling);

  useEffect(() => {
    // Start the global heartbeat (30s interval)
    // The store automatically triggers the immediate first fetch.
    startPolling(30000);

    // Cleanup: Stop polling when the app/layout unmounts
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling]);
};