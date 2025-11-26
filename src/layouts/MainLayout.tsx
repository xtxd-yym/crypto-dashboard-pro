import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 font-sans">
      {/* Sidebar - Fixed Left */}
      <Sidebar />

      {/* Main Content - Offset by Sidebar width */}
      <main className="md:ml-64 min-h-screen">
        <div className="container mx-auto p-4 md:p-8 max-w-7xl">
          {/* This is where pages will render */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};