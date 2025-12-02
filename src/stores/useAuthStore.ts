import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
}

// Mock user data to simulate a DB response
const MOCK_USER: User = {
  id: '1',
  name: 'Alex Trader',
  email: 'alex@crypto.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password?: string) => {
        set({ isLoading: true });

        console.log(`Authenticating ${email} with password length: ${password?.length}`);

        // Simulate API network delay (1 second)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // In a real app, we would validate the password here.
        // For this demo, we accept any login.
        set({
          user: { ...MOCK_USER, email }, // Use the email they typed
          isAuthenticated: true,
          isLoading: false
        });
      },

      /**
       * @action logout
       * @description
       * Clears the user session but INTENTIONALLY preserves the Portfolio Store in localStorage.
       * * @architectural_decision
       * In a standard production app, we would clear all local data on logout and re-fetch 
       * from the backend database upon the next login.
       * * However, since this is a serverless portfolio demo, localStorage is our 
       * Single Source of Truth. Clearing it would cause "Data Destruction," 
       * forcing the user to rebuild their portfolio every session.
       * Overrode the initial AI suggestion to `removeItem`, ensuring data durability 
       * across sessions for a better reviewer experience.
      */
      logout: () => {
        set({ user: null, isAuthenticated: false });
        console.log("User logged out, but portfolio data preserved on device.");
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);