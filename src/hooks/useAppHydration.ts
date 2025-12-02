/**
 * @hook useAppHydration
 * @description
 * Solves a critical data availability issue found during the "Portfolio Deep Link" edge case.
 *
 * @problem
 * Previously, market data fetching was coupled to the `DashboardPage` component.
 * If a user accessed the app directly via `/portfolio`, the Dashboard never mounted,
 * causing the Store to remain empty and the "Add Asset" modal to fail (empty dropdown).
 *
 * @solution
 * "Lifted" the fetching logic up to the `MainLayout` level. This hook ensures
 * global domain data is initialized (hydrated) immediately upon app entry,
 * regardless of the specific route the user lands on.
 *
 * @author [Your Name]
 */

import { useEffect, useRef } from 'react';
import { useMarketStore } from '../stores/useMarketStore';

/**
 * This hook is responsible for fetching essential global data
 * when the application first loads.
 */
export const useAppHydration = () => {
  const { data, fetchMarketData } = useMarketStore();
  // We use a ref to ensure this run once per mount in strict mode
  const initialized = useRef(false);

  useEffect(() => {
    // Only fetch if we haven't initialized and don't have data yet
    if (!initialized.current && data.length === 0) {
      console.log('💧 App Hydration: Fetching initial market data...');
      fetchMarketData();
      initialized.current = true;
    }
  }, [data.length, fetchMarketData]);
};