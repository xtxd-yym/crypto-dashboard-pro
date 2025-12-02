import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMarketStore } from '../../stores/useMarketStore';
import { SparklineChart } from '../../components/ui/SparklineChart';

export const MarketPage = () => {
  const { data } = useMarketStore();
  const [search, setSearch] = useState('');
  
  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 1. Filter the Full Dataset first
  const filteredCoins = data.filter(coin => 
    coin.name.toLowerCase().includes(search.toLowerCase()) || 
    coin.symbol.toLowerCase().includes(search.toLowerCase())
  );

  // 2. Calculate Pagination Logic based on filtered results
  const totalPages = Math.ceil(filteredCoins.length / itemsPerPage);
  
  // 3. Slice the data for the CURRENT page only
  // This is the performance fix: We only render these 10 items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCoins = filteredCoins.slice(indexOfFirstItem, indexOfLastItem);

  // Handler: Reset to page 1 if user types in search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Market Analysis</h1>
          <p className="text-slate-400 mt-1">
            Deep dive into the top 50 cryptocurrencies.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input 
          type="text"
          placeholder="Search coins (e.g. Solana)..."
          value={search}
          onChange={handleSearch}
          className="w-full bg-dark-card border border-dark-border rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-600"
        />
      </div>

      {/* Market Table */}
      <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-bg/50 border-b border-dark-border text-xs uppercase text-slate-400">
                <th className="p-4 font-medium text-center w-16">Rank</th>
                <th className="p-4 font-medium">Coin</th>
                <th className="p-4 font-medium text-right">Price</th>
                <th className="p-4 font-medium text-right">24h Change</th>
                <th className="p-4 font-medium text-right">7d Trend</th>
                <th className="p-4 font-medium text-right">Market Cap</th>
                <th className="p-4 font-medium text-right">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {/* Map over the SLICED currentCoins array */}
              {currentCoins.map((coin) => (
                <tr key={coin.id} className="hover:bg-dark-border/30 transition-colors group">
                  <td className="p-4 text-center text-slate-500 font-mono text-sm">
                    {coin.marketCapRank}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                      <div>
                        <div className="font-bold text-slate-200">{coin.name}</div>
                        <div className="text-xs text-slate-500 uppercase">{coin.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right font-mono text-slate-300">
                    ${coin.currentPrice.toLocaleString()}
                  </td>
                  <td className={`p-4 text-right font-medium ${coin.priceChangePercentage24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {coin.priceChangePercentage24h > 0 ? '+' : ''}
                    {coin.priceChangePercentage24h.toFixed(2)}%
                  </td>
                  <td className="p-4 w-32">
                    <div className="h-10 w-24 ml-auto">
                      {/* Sparkline Chart */}
                      <SparklineChart 
                        data={coin.sparklineIn7d.price} 
                        color={coin.priceChangePercentage24h >= 0 ? 'rgb(74, 222, 128)' : 'rgb(248, 113, 113)'} 
                      />
                    </div>
                  </td>
                  <td className="p-4 text-right text-slate-400">
                    ${(coin.marketCap / 1e9).toFixed(2)}B
                  </td>
                  <td className="p-4 text-right text-slate-400">
                    ${(coin.totalVolume / 1e6).toFixed(2)}M
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Empty State */}
          {filteredCoins.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <p>No coins found matching "{search}"</p>
            </div>
          )}
        </div>

        {/* PAGINATION FOOTER */}
        {filteredCoins.length > itemsPerPage && (
          <div className="flex items-center justify-between p-4 border-t border-dark-border bg-dark-bg/30">
            <div className="text-sm text-slate-400">
              Showing <span className="text-white font-medium">{indexOfFirstItem + 1}</span> to <span className="text-white font-medium">{Math.min(indexOfLastItem, filteredCoins.length)}</span> of <span className="text-white font-medium">{filteredCoins.length}</span> results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-dark-border text-slate-400 hover:text-white hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-dark-border text-slate-400 hover:text-white hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};