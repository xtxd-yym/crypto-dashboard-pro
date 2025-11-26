import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LineChart, Wallet, Settings, LogOut } from 'lucide-react';
import clsx from 'clsx';

export const Sidebar = () => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: LineChart, label: 'Market', path: '/market' },
    { icon: Wallet, label: 'Portfolio', path: '/portfolio' },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-dark-card border-r border-dark-border hidden md:flex flex-col transition-transform">
      {/* Logo Section */}
      <div className="flex h-16 items-center border-b border-dark-border px-6">
        <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center mr-3">
          <span className="text-white font-bold text-lg">C</span>
        </div>
        <span className="text-xl font-bold text-white tracking-tight">
          CryptoDash
        </span>
      </div>

      {/* Navigation Links */}
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

      {/* Bottom Actions */}
      <div className="border-t border-dark-border p-4 space-y-2">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-dark-border/50 hover:text-slate-200 transition-colors">
          <Settings className="h-5 w-5" />
          Settings
        </button>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors">
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};