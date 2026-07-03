import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import tw from '@/lib/tailwind';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useShop } from '@/store/useShop';
import { DollarSign, ShoppingBag, Users, Activity, Package } from 'lucide-react-native';

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const orders = useShop((s) => s.orders);

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  
  // Pending orders
  const pendingOrders = orders.filter(o => o.status === 'placed' || o.status === 'confirmed').length;

  const totalProducts = useShop((s) => s.products.length);

  const themeBg = isDark ? 'bg-[#191514]' : 'bg-[#FAF7F2]';
  const themeCard = isDark ? 'bg-[#261E1D]' : 'bg-white';
  const themeText = isDark ? 'text-[#EFEBE9]' : 'text-[#3E2723]';
  const themeTextMuted = isDark ? 'text-[#A1887F]' : 'text-[#8D6E63]';

  const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) => (
    <View style={[tw`p-5 rounded-2xl shadow-sm mb-4 w-[48%]`, tw`${themeCard}`]}>
      <View style={[tw`w-10 h-10 rounded-full items-center justify-center mb-3`, { backgroundColor: `${color}20` }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={[tw`text-sm mb-1`, tw`${themeTextMuted}`]}>{title}</Text>
      <Text style={[tw`text-xl font-bold`, tw`${themeText}`]}>{value}</Text>
    </View>
  );

  return (
    <View style={[tw`flex-1`, tw`${themeBg}`]}>
      <ScrollView
        contentContainerStyle={[tw`px-6 pb-24`, { paddingTop: Math.max(insets.top, 20) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={tw`mb-8 mt-2`}>
          <Text style={[tw`text-3xl font-extrabold mb-2`, tw`${themeText}`]}>Dashboard</Text>
          <Text style={[tw`text-base`, tw`${themeTextMuted}`]}>Overview of your store</Text>
        </View>

        <View style={tw`flex-row flex-wrap justify-between`}>
          <StatCard 
            title="Total Revenue" 
            value={`$${totalRevenue.toFixed(2)}`} 
            icon={DollarSign} 
            color="#8E3200" 
          />
          <StatCard 
            title="Total Orders" 
            value={totalOrders.toString()} 
            icon={ShoppingBag} 
            color="#283593" 
          />
          <StatCard 
            title="Pending Orders" 
            value={pendingOrders.toString()} 
            icon={Activity} 
            color="#F9A825" 
          />
          <StatCard 
            title="Total Products" 
            value={totalProducts.toString()} 
            icon={Package} 
            color="#2E7D32" 
          />
        </View>

        <View style={[tw`mt-6 p-6 rounded-3xl shadow-sm`, tw`${themeCard}`]}>
          <Text style={[tw`text-lg font-bold mb-4`, tw`${themeText}`]}>Recent Activity</Text>
          {orders.slice(0, 3).map((order, index) => (
            <View key={order.id} style={[tw`flex-row items-center py-3`, index !== orders.slice(0, 3).length - 1 && tw`border-b border-gray-100 dark:border-[#222E28]`]}>
              <View style={[tw`w-10 h-10 rounded-full items-center justify-center mr-4 bg-[#8E3200] bg-opacity-20`]}>
                <ShoppingBag size={18} color="#8E3200" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={[tw`font-semibold text-base`, tw`${themeText}`]}>Order {order.id}</Text>
                <Text style={[tw`text-xs`, tw`${themeTextMuted}`]}>{new Date(order.date).toLocaleDateString()}</Text>
              </View>
              <Text style={[tw`font-bold`, tw`${themeText}`]}>${order.total.toFixed(2)}</Text>
            </View>
          ))}
          {orders.length === 0 && (
            <Text style={[tw`text-center py-4`, tw`${themeTextMuted}`]}>No recent activity</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
