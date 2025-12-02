import { useMarketStore } from '../../stores/useMarketStore';
import { SparklineChart } from '../../components/ui/SparklineChart';

export const DashboardPage = () => {
  const { data, loading, fetchMarketData } = useMarketStore();

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
          {data.slice(0, 8).map((coin) => (
            <div
              key={coin.id}
              className="bg-dark-card border border-dark-border p-4 rounded-xl hover:border-brand-500/50 transition-colors"
            >
              {/* Left Side: Icon & Name */}
              <div className="flex items-center gap-3 min-w-[140px]">
                <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                <div>
                  <h3 className="font-bold text-slate-200 truncate">{coin.name}</h3>
                  <span className="text-xs text-slate-500 uppercase">{coin.symbol}</span>
                </div>
              </div>

              {/* Middle: Sparkline Chart */}
              {/* We pass the price array and determine color based on 24h change */}
              <div className="flex-1 flex justify-center px-4">
                <SparklineChart
                  data={coin.sparklineIn7d.price}
                  color={coin.priceChangePercentage24h >= 0 ? 'rgb(74, 222, 128)' : 'rgb(248, 113, 113)'} // Tailwind green-400 / red-400 rgb values
                />
              </div>

              {/* Right Side: Price & Change */}
              <div className="text-right min-w-[100px]">
                <p className="font-mono text-slate-200">${coin.currentPrice?.toLocaleString()}</p>
                <p className={`text-xs font-medium ${coin.priceChangePercentage24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {coin.priceChangePercentage24h > 0 ? '+' : ''}
                  {coin.priceChangePercentage24h?.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};