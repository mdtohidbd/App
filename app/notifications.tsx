import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, FlatList, BackHandler, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import tw from '@/lib/tailwind';
import { ArrowLeft, ShoppingBag, Zap, Bell, Trash2, CheckSquare, BellOff } from 'lucide-react-native';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  category: 'orders' | 'offers' | 'updates';
  read: boolean;
  actionRoute?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Order Dispatched 🚚',
    message: 'Your order #VV-9082 containing Premium Leather Jacket has been shipped and is on its way!',
    time: '2 hours ago',
    category: 'orders',
    read: false,
    actionRoute: '/orders',
  },
  {
    id: '2',
    title: 'Flash Sale Live! ⚡',
    message: 'Flash Sale is now live! Grab up to 50% discount on summer collections. Only for 24 hours.',
    time: '5 hours ago',
    category: 'offers',
    read: false,
    actionRoute: '/(tabs)',
  },
  {
    id: '3',
    title: 'Wishlist Item Price Drop 🏷️',
    message: 'Good news! "Minimalist Canvas Sneakers" in your wishlist is now 20% off.',
    time: '1 day ago',
    category: 'offers',
    read: true,
    actionRoute: '/(tabs)/cart',
  },
  {
    id: '4',
    title: 'Login Alert 🛡️',
    message: "You successfully logged in from a new device (Dhaka, Bangladesh). If this wasn't you, please secure your account.",
    time: '2 days ago',
    category: 'updates',
    read: true,
    actionRoute: '/settings',
  },
  {
    id: '5',
    title: 'Double Points Weekend! 🎉',
    message: 'Earn double membership points on every purchase made this weekend. Shop now!',
    time: '3 days ago',
    category: 'offers',
    read: true,
    actionRoute: '/(tabs)',
  },
];

type FilterType = 'all' | 'orders' | 'offers' | 'updates';

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  useEffect(() => {
    const backAction = () => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [router]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const toggleReadStatus = (id: string, actionRoute?: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    if (actionRoute) {
      router.push(actionRoute as any);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'orders':
        return (
          <View style={tw`w-10 h-10 rounded-full bg-blue-500/10 items-center justify-center mr-3`}>
            <ShoppingBag size={20} color="#3b82f6" />
          </View>
        );
      case 'offers':
        return (
          <View style={tw`w-10 h-10 rounded-full bg-amber-500/10 items-center justify-center mr-3`}>
            <Zap size={20} color="#f59e0b" />
          </View>
        );
      default:
        return (
          <View style={tw`w-10 h-10 rounded-full bg-purple-500/10 items-center justify-center mr-3`}>
            <Bell size={20} color="#a855f7" />
          </View>
        );
    }
  };

  const filteredNotifications = notifications.filter(
    (n) => activeFilter === 'all' || n.category === activeFilter
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={tw`flex-1 bg-white dark:bg-black`}>
      {/* Header */}
      <View style={[tw`flex-row justify-between items-center px-5 pb-4 border-b border-gray-100 dark:border-gray-900 bg-white dark:bg-black`, { paddingTop: Platform.OS === 'android' ? 32 : 12 }]}>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity onPress={handleBack} style={tw`p-2 -ml-2 mr-2`}>
            <ArrowLeft size={24} style={tw`text-black dark:text-white`} />
          </TouchableOpacity>
          <Text style={tw`text-2xl font-black text-black dark:text-white`}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={tw`bg-red-500 px-2 py-0.5 rounded-full ml-2`}>
              <Text style={tw`text-white text-xs font-bold`}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {notifications.length > 0 && (
          <TouchableOpacity onPress={clearAll} style={tw`p-2`}>
            <Trash2 size={20} style={tw`text-gray-400 dark:text-gray-500`} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      {notifications.length > 0 && (
        <View style={tw`py-4 px-5`}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`gap-x-2`}>
            {(['all', 'orders', 'offers', 'updates'] as FilterType[]).map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                style={tw`px-5 py-2.5 rounded-full border border-gray-100 dark:border-gray-800 ${
                  activeFilter === filter
                    ? 'bg-black dark:bg-white border-black dark:border-white'
                    : 'bg-gray-50 dark:bg-gray-900'
                }`}
              >
                <Text
                  style={tw`text-sm font-bold capitalize ${
                    activeFilter === filter ? 'text-white dark:text-black' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Actions (Mark all read) */}
      {notifications.length > 0 && unreadCount > 0 && (
        <TouchableOpacity
          onPress={markAllAsRead}
          style={tw`flex-row items-center px-5 pb-3 justify-end`}
        >
          <CheckSquare size={16} style={tw`text-gray-400 mr-1.5`} />
          <Text style={tw`text-xs font-semibold text-gray-400`}>Mark all as read</Text>
        </TouchableOpacity>
      )}

      {/* List Feed */}
      {filteredNotifications.length === 0 ? (
        <View style={tw`flex-1 items-center justify-center p-5`}>
          <View style={tw`w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full items-center justify-center mb-6`}>
            <BellOff size={40} color="#9ca3af" />
          </View>
          <Text style={tw`text-xl font-bold text-black dark:text-white mb-2`}>
            {notifications.length === 0 ? 'No notifications yet' : 'No matches found'}
          </Text>
          <Text style={tw`text-gray-500 text-center mb-8`}>
            {notifications.length === 0
              ? "We'll let you know when there's an update on your orders or offers."
              : 'Try changing your filter settings.'}
          </Text>
          <TouchableOpacity
            onPress={handleBack}
            style={tw`bg-black dark:bg-white px-8 py-4 rounded-xl shadow-lg`}
          >
            <Text style={tw`text-white dark:text-black font-bold text-base`}>Go Back Shop</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={tw`px-5 pb-10`}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => toggleReadStatus(item.id, item.actionRoute)}
              style={tw`flex-row p-4 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl mb-3 border border-gray-100 dark:border-gray-800/50 items-start ${
                !item.read ? 'bg-gray-100/50 dark:bg-gray-900/60 border-blue-500/20' : ''
              }`}
            >
              {getCategoryIcon(item.category)}
              
              <View style={tw`flex-1 mr-2`}>
                <View style={tw`flex-row justify-between items-center mb-1`}>
                  <Text style={tw`flex-1 text-base font-bold text-black dark:text-white pr-2 ${!item.read ? 'font-extrabold' : ''}`}>
                    {item.title}
                  </Text>
                  {!item.read && (
                    <View style={tw`w-2 h-2 rounded-full bg-blue-500`} />
                  )}
                </View>
                <Text style={tw`text-sm text-gray-500 dark:text-gray-400 mb-2 leading-5`}>
                  {item.message}
                </Text>
                <View style={tw`flex-row justify-between items-center mt-1`}>
                  <Text style={tw`text-xs text-gray-400`}>
                    {item.time}
                  </Text>
                  <TouchableOpacity
                    onPress={() => deleteNotification(item.id)}
                    style={tw`p-1.5 bg-red-50 dark:bg-red-900/20 rounded-full border border-red-100 dark:border-red-900/30`}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Trash2 size={14} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
