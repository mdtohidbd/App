import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import tw from '@/lib/tailwind';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useShop, OrderStatus, Order } from '@/store/useShop';
import { ChevronDown, X, Package, Clock, CheckCircle, Truck } from 'lucide-react-native';

const STATUS_OPTIONS: { label: string; value: OrderStatus; icon: any; color: string }[] = [
  { label: 'Placed', value: 'placed', icon: Clock, color: '#3b82f6' },
  { label: 'Confirmed', value: 'confirmed', icon: CheckCircle, color: '#8b5cf6' },
  { label: 'Shipped', value: 'shipped', icon: Truck, color: '#f59e0b' },
  { label: 'Out for Delivery', value: 'out_for_delivery', icon: Truck, color: '#eab308' },
  { label: 'Delivered', value: 'delivered', icon: Package, color: '#10b981' },
  { label: 'Cancelled', value: 'cancelled', icon: X, color: '#ef4444' },
];

export default function AdminOrders() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const orders = useShop((s) => s.orders);
  const updateOrderStatus = useShop((s) => s.updateOrderStatus);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const themeBg = isDark ? 'bg-[#0A0D0B]' : 'bg-[#F4F7F5]';
  const themeCard = isDark ? 'bg-[#131815]' : 'bg-white';
  const themeText = isDark ? 'text-white' : 'text-gray-900';
  const themeTextMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const themeBorder = isDark ? 'border-[#222E28]' : 'border-[#D9E2DE]';

  const handleStatusChange = (status: OrderStatus) => {
    if (selectedOrder) {
      updateOrderStatus(selectedOrder.id, status);
      setModalVisible(false);
    }
  };

  const openStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const getStatusColor = (status: OrderStatus) => {
    const option = STATUS_OPTIONS.find(o => o.value === status);
    return option ? option.color : '#9ca3af';
  };

  return (
    <View style={[tw`flex-1`, tw`${themeBg}`]}>
      <View style={[tw`px-6 pb-4 border-b`, tw`${themeBorder}`, { paddingTop: Math.max(insets.top, 20) }]}>
        <Text style={[tw`text-3xl font-extrabold mt-2`, tw`${themeText}`]}>Orders</Text>
        <Text style={[tw`text-base mt-1`, tw`${themeTextMuted}`]}>Manage customer orders</Text>
      </View>

      <ScrollView contentContainerStyle={tw`p-6 pb-24`} showsVerticalScrollIndicator={false}>
        {orders.map((order) => (
          <View key={order.id} style={[tw`p-5 rounded-2xl mb-4 shadow-sm`, tw`${themeCard}`]}>
            <View style={tw`flex-row justify-between items-start mb-3`}>
              <View>
                <Text style={[tw`font-bold text-lg`, tw`${themeText}`]}>Order {order.id}</Text>
                <Text style={[tw`text-sm`, tw`${themeTextMuted}`]}>{new Date(order.date).toLocaleString()}</Text>
              </View>
              <Text style={[tw`font-bold text-lg`, tw`${themeText}`]}>${order.total.toFixed(2)}</Text>
            </View>

            <View style={[tw`py-3 border-y mb-3`, tw`${themeBorder}`]}>
              <Text style={[tw`text-sm mb-1`, tw`${themeTextMuted}`]}>Customer: {order.shippingDetails.name}</Text>
              <Text style={[tw`text-sm`, tw`${themeTextMuted}`]}>Items: {order.items.reduce((acc, i) => acc + i.qty, 0)}</Text>
            </View>

            <View style={tw`flex-row justify-between items-center`}>
              <View style={tw`flex-row items-center`}>
                <View style={[tw`w-3 h-3 rounded-full mr-2`, { backgroundColor: getStatusColor(order.status) }]} />
                <Text style={[tw`text-sm font-medium`, tw`${themeText}`]}>
                  {STATUS_OPTIONS.find(o => o.value === order.status)?.label || order.status}
                </Text>
              </View>
              
              <TouchableOpacity 
                onPress={() => openStatusModal(order)}
                style={tw`flex-row items-center bg-[#4E7661] px-3 py-1.5 rounded-lg`}
              >
                <Text style={tw`text-white text-xs font-semibold mr-1`}>Update</Text>
                <ChevronDown size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {orders.length === 0 && (
          <Text style={[tw`text-center py-10`, tw`${themeTextMuted}`]}>No orders found.</Text>
        )}
      </ScrollView>

      {/* Status Update Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <Pressable 
          style={tw`flex-1 justify-end bg-black/50`} 
          onPress={() => setModalVisible(false)}
        >
          <View style={[tw`p-6 rounded-t-3xl min-h-[50%]`, tw`${themeCard}`]}>
            <View style={tw`flex-row justify-between items-center mb-6`}>
              <Text style={[tw`text-xl font-bold`, tw`${themeText}`]}>
                Update Order {selectedOrder?.id}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>

            {STATUS_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = selectedOrder?.status === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    tw`flex-row items-center p-4 rounded-xl mb-3 border`,
                    isActive ? tw`border-[#4E7661] bg-[#4E7661]/10` : tw`${themeBorder}`
                  ]}
                  onPress={() => handleStatusChange(option.value)}
                >
                  <View style={[tw`w-10 h-10 rounded-full items-center justify-center mr-4`, { backgroundColor: `${option.color}20` }]}>
                    <Icon size={20} color={option.color} />
                  </View>
                  <Text style={[tw`text-base font-medium flex-1`, tw`${themeText}`]}>{option.label}</Text>
                  {isActive && <CheckCircle size={20} color="#4E7661" />}
                </TouchableOpacity>
              )
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
