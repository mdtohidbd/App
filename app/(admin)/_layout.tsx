import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Home, Package, ShoppingCart, Settings } from 'lucide-react-native';

export default function AdminTabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: isDark ? '#ffffff' : '#000000',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 1,
          borderTopColor: isDark ? '#222' : '#f3f4f6',
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -5 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          backgroundColor: isDark ? '#1a1a1a' : '#fafafa', // Slightly different bg to distinguish admin
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Home size={24} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <ShoppingCart size={24} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color }) => <Package size={24} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} strokeWidth={2.5} />,
        }}
      />
    </Tabs>
  );
}
