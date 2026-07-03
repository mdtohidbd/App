import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: { email: string; name: string; avatar: string; role?: 'admin' | 'customer' } | null;
  login: (email: string, password?: string, name?: string) => void;
  logout: () => void;
  updateUser: (name: string, email: string, avatar: string) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null, // Start with no user to force auth flow
      login: (email, password, name) => {
        // Generate a unique avatar based on the email
        const avatar = `https://api.dicebear.com/7.x/avataaars/png?seed=${email}&backgroundColor=b6e3f4`;
        
        let role: 'admin' | 'customer' = 'customer';
        if (email === 'admin@stylofy.com' && password === 'admin') {
          role = 'admin';
        }
        
        set({ user: { email, name: name || (role === 'admin' ? 'Admin' : email.split('@')[0]), avatar, role } });
      },
      logout: () => set({ user: null }),
      updateUser: (name, email, avatar) => {
        set({ user: { name, email, avatar } });
      }
    }),
    {
      name: 'stylofy-auth',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);

