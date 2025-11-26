import { useEffect } from 'react';
import { useMarketStore } from '../../stores/useMarketStore';

export const DashboardPage = () => {
  const { data, loading, fetchMarketData } = useMarketStore();

  // Fetch data when component mounts
  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Market Overview</h1>
          <p className="text-slate-400 mt-1">
            Live tracking of top cryptocurrencies
          </p>
        </div>
        <button
          onClick={() => fetchMarketData()}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-brand-500 animate-pulse">Loading market data...</div>
      )}

      {/* Data Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((coin) => (
            <div
              key={coin.id}
              className="bg-dark-card border border-dark-border p-4 rounded-xl hover:border-brand-500/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                <div>
                  <h3 className="font-bold text-slate-200">{coin.name}</h3>
                  <span className="text-xs text-slate-500 uppercase">{coin.symbol}</span>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-mono text-slate-200">
                    ${coin.currentPrice?.toLocaleString()}
                  </p>
                  <p className={`text-xs font-medium ${coin.priceChangePercentage24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {coin.priceChangePercentage24h > 0 ? '+' : ''}
                    {coin.priceChangePercentage24h?.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};