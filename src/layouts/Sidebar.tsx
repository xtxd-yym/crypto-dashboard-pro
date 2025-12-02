import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LineChart, Wallet, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import clsx from 'clsx';

export const Sidebar = () => {
  const { user, logout } = useAuthStore();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: LineChart, label: 'Market', path: '/market' },
    { icon: Wallet, label: 'Portfolio', path: '/portfolio' },
    { icon: Settings, label: 'Settings', path: '/settings' }, // Now points to real page
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-dark-card border-r border-dark-border hidden md:flex flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-dark-border px-6">
        <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center mr-3">
          <span className="text-white font-bold text-lg">C</span>
        </div>
        <span className="text-xl font-bold text-white tracking-tight">
          CryptoDash
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-brand-500/10 text-brand-500"
                  : "text-slate-400 hover:bg-dark-border/50 hover:text-slate-200"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div className="border-t border-dark-border p-4">
        <div className="flex items-center gap-3 mb-4 px-2">
          <img 
            src={user?.avatar || "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"} 
            alt="User" 
            className="h-10 w-10 rounded-full border border-dark-border"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name || "Demo User"}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.email || "demo@user.com"}
            </p>
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-dark-bg border border-dark-border px-3 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:border-red-400/30 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};