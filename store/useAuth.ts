import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: { email: string; name: string; avatar: string } | null;
  login: (email: string, name?: string) => void;
  logout: () => void;
  updateUser: (name: string, email: string, avatar: string) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null, // Start with no user to force auth flow
      login: (email, name) => {
        // Generate a unique avatar based on the email
        const avatar = `https://api.dicebear.com/7.x/avataaars/png?seed=${email}&backgroundColor=b6e3f4`;
        set({ user: { email, name: name || email.split('@')[0], avatar } });
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

