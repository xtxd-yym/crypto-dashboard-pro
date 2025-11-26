import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { DashboardPage } from '../features/dashboard/DashboardPage';

// We define our route structure here
export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true, // This is the default child for "/"
        element: <DashboardPage />,
      },
      {
        path: 'market',
        element: <div className="p-4 text-slate-400">Market Page (Coming Soon)</div>,
      },
      {
        path: 'portfolio',
        element: <div className="p-4 text-slate-400">Portfolio Page (Coming Soon)</div>,
      },
    ],
  },
]);