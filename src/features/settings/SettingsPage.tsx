import { Trash2, Bell } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';

export const SettingsPage = () => {
  const { user } = useAuthStore();

  const handleResetData = () => {
    if (confirm('Are you sure? This will wipe your Portfolio and Auth data permanently.')) {
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account preferences.</p>
      </div>

      {/* Profile Section */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          Profile Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Display Name</label>
            <input 
              type="text" 
              value={user?.name || ''} 
              readOnly 
              className="w-full bg-dark-bg border border-dark-border rounded-lg p-2.5 text-slate-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
            <input 
              type="text" 
              value={user?.email || ''} 
              readOnly 
              className="w-full bg-dark-bg border border-dark-border rounded-lg p-2.5 text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Notifications (Mock) */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-brand-500" />
          Notifications
        </h2>
        <div className="flex items-center justify-between py-2">
          <span className="text-slate-300">Price Alerts</span>
          <div className="w-10 h-6 bg-brand-600 rounded-full relative cursor-pointer">
            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
          </div>
        </div>
        <div className="flex items-center justify-between py-2 border-t border-dark-border">
          <span className="text-slate-300">Marketing Emails</span>
          <div className="w-10 h-6 bg-dark-bg border border-dark-border rounded-full relative cursor-pointer">
            <div className="absolute left-1 top-1 w-4 h-4 bg-slate-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
        <h2 className="text-lg font-medium text-red-400 mb-2 flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Danger Zone
        </h2>
        <p className="text-sm text-red-400/70 mb-4">
          Resetting the application will clear your local portfolio and authentication data.
        </p>
        <button 
          onClick={handleResetData}
          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-500/20"
        >
          Reset Application Data
        </button>
      </div>
    </div>
  );
};