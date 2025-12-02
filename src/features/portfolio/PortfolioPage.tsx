import { useState } from 'react';
import { Plus } from 'lucide-react';
import { usePortfolioStore } from '../../stores/usePortfolioStore';
import { Modal } from '../../components/ui/Modal'; // Import Modal
import { AddAssetForm } from './AddAssetForm';     // Import Form
import { AssetTable } from './AssetTable';

export const PortfolioPage = () => {
  const { items } = usePortfolioStore();
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">My Portfolio</h1>
          <p className="text-slate-400 mt-1">
            Manage your holdings and track performance.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} // Open modal on click
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Asset
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-brand-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No assets yet</h3>
          <p className="text-slate-400 max-w-sm mx-auto mb-6">
            Start building your portfolio by adding your first cryptocurrency.
          </p>
          {/* Added button here for better UX */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-brand-500 font-medium hover:text-brand-400"
          >
            Add an asset now &rarr;
          </button>
        </div>
      ) : (
        <AssetTable />
      )}

      {/* The Modal Component */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Add New Asset"
      >
        <AddAssetForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};