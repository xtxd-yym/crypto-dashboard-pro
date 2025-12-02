import { useState } from 'react';
import { useMarketStore } from '../../stores/useMarketStore';
import { usePortfolioStore } from '../../stores/usePortfolioStore';

interface AddAssetFormProps {
  onSuccess: () => void;
}

export const AddAssetForm = ({ onSuccess }: AddAssetFormProps) => {
  const { data: coins } = useMarketStore();
  const { addItem } = usePortfolioStore();
  
  const [selectedCoinId, setSelectedCoinId] = useState<string>('bitcoin');
  const [quantity, setQuantity] = useState<string>('');
  const [error, setError] = useState('');

  // Find the selected coin object to get current price
  const selectedCoin = coins.find(c => c.id === selectedCoinId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!quantity || isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (selectedCoin) {
      addItem({
        coinId: selectedCoin.id,
        quantity: parseFloat(quantity),
        purchasePrice: selectedCoin.currentPrice, // We record the price at moment of purchase
      });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Coin Selection */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-300">Select Asset</label>
        <select
          value={selectedCoinId}
          onChange={(e) => setSelectedCoinId(e.target.value)}
          className="w-full bg-dark-bg border border-dark-border rounded-lg p-2.5 text-white focus:ring-2 focus:ring-brand-500 outline-none"
        >
          {coins.map((coin) => (
            <option key={coin.id} value={coin.id}>
              {coin.name} ({coin.symbol.toUpperCase()})
            </option>
          ))}
        </select>
      </div>

      {/* Quantity Input */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-300">Quantity</label>
        <div className="relative">
          <input
            type="number"
            step="any"
            placeholder="0.00"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-lg p-2.5 text-white focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>
      </div>

      {/* Live Preview Calculation */}
      {selectedCoin && quantity && !isNaN(parseFloat(quantity)) && (
        <div className="bg-brand-500/10 border border-brand-500/20 rounded-lg p-3">
          <p className="text-sm text-brand-200">Estimated Value</p>
          <p className="text-xl font-bold text-brand-500">
            ${(parseFloat(quantity) * selectedCoin.currentPrice).toLocaleString()}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-lg transition-colors"
      >
        Add to Portfolio
      </button>
    </form>
  );
};