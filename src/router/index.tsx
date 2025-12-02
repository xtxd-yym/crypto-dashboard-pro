import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { PortfolioPage } from '../features/portfolio/PortfolioPage';
import { LoginPage } from '../pages/LoginPage';
import { ProtectedRoute } from './ProtectedRoute'; // Import the guard
import { SettingsPage } from '../features/settings/SettingsPage';
import { MarketPage } from '../features/market/MarketPage';

export const router = createBrowserRouter([
  // Public Routes
  {
    path: '/login',
    element: <LoginPage />,
  },
  
  // Protected Routes (Wrapped in Guard)
  {
    element: <ProtectedRoute />, // 1. Check Auth
    children: [
      {
        path: '/',
        element: <MainLayout />, // 2. If Auth OK, render Layout
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'market',
            element: <MarketPage />,
          },
          {
            path: 'portfolio',
            element: <PortfolioPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },

  // Catch-all: Redirect unknown routes to Dashboard
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);