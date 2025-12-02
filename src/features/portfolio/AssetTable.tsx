import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { usePortfolioStore } from '../../stores/usePortfolioStore';
import { useMarketStore } from '../../stores/useMarketStore';
import clsx from 'clsx';

export const AssetTable = () => {
  const { items, removeItem } = usePortfolioStore();
  const { data: marketData } = useMarketStore();

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="bg-dark-bg/50 border-b border-dark-border text-xs uppercase text-slate-400">
              <th className="p-4 font-medium">Asset</th>
              <th className="p-4 font-medium text-right">Price</th>
              <th className="p-4 font-medium text-right">Holdings</th>
              <th className="p-4 font-medium text-right">Total Value</th>
              <th className="p-4 font-medium text-right">Profit / Loss</th>
              <th className="p-4 font-medium text-center">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-dark-border">
            {items.map((item) => {
              // 1. Find live market data for this item
              const coin = marketData.find((c) => c.id === item.coinId);
              
              // Safety check: If market data isn't loaded yet, use 0 to prevent crash
              const currentPrice = coin?.currentPrice || 0;
              const totalValue = currentPrice * item.quantity;
              
              // 2. Calculate P/L
              const totalCost = item.purchasePrice * item.quantity;
              const profitLoss = totalValue - totalCost;
              const isProfit = profitLoss >= 0;
              const plPercentage = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

              return (
                <tr key={item.id} className="hover:bg-dark-border/30 transition-colors group">
                  {/* Asset Column */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {coin && <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />}
                      <div>
                        <div className="font-bold text-slate-200">{coin?.name || item.coinId}</div>
                        <div className="text-xs text-slate-500 uppercase">{coin?.symbol}</div>
                      </div>
                    </div>
                  </td>

                  {/* Price Column */}
                  <td className="p-4 text-right font-mono text-slate-300">
                    ${currentPrice.toLocaleString()}
                  </td>

                  {/* Holdings Column */}
                  <td className="p-4 text-right">
                    <div className="font-bold text-slate-200">{item.quantity}</div>
                    <div className="text-xs text-slate-500 uppercase">{coin?.symbol}</div>
                  </td>

                  {/* Total Value Column */}
                  <td className="p-4 text-right font-bold text-slate-200">
                    ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {/* Profit/Loss Column (The complicated math part) */}
                  <td className="p-4 text-right">
                    <div className={clsx("flex items-center justify-end gap-1 font-medium", isProfit ? "text-green-400" : "text-red-400")}>
                      {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{profitLoss > 0 ? '+' : ''}{profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className={clsx("text-xs", isProfit ? "text-green-400/70" : "text-red-400/70")}>
                      {plPercentage.toFixed(2)}%
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-slate-500 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Remove Asset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};