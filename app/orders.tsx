import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, FlatList, Image, Alert, Platform, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import tw from '@/lib/tailwind';
import { useShop, type Order, type OrderStatus } from '@/store/useShop';
import { 
  ArrowLeft, ShoppingBag, Calendar, MapPin, CreditCard, 
  ChevronRight, CheckCircle2, Truck, Package, Clock, 
  XCircle, FileText, Phone, Copy, HelpCircle as SupportIcon
} from 'lucide-react-native';
import { format } from 'date-fns';
import { useColorScheme } from '@/hooks/use-color-scheme';

type FilterType = 'all' | 'active' | 'completed' | 'cancelled';

export default function OrdersScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const { orders = [], cancelOrder, updateOrderStatus } = useShop();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Custom Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  // Safe Date Formatting helper to prevent date-fns RangeError crashes
  const safeFormatDate = (dateStr: string | undefined, pattern: string) => {
    try {
      if (!dateStr) return 'N/A';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'N/A';
      return format(d, pattern);
    } catch {
      return 'N/A';
    }
  };

  // Safe Toast Animation using React Native Core Animated (100% crash-free)
  useEffect(() => {
    if (showToast) {
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => setShowToast(false));
      }, 2200);

      return () => clearTimeout(timer);
    }
  }, [showToast, toastOpacity]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
  };

  const handleCopyId = (id: string) => {
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(id);
          triggerToast("Order ID copied to clipboard!");
          return;
        }
      }
      // Safe require fallback to prevent bundler errors
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const RN = require('react-native');
      const Clipboard = RN.Clipboard || (RN.ClipboardNativeInterface ? RN.ClipboardNativeInterface : null);
      if (Clipboard && typeof Clipboard.setString === 'function') {
        Clipboard.setString(id);
        triggerToast("Order ID copied to clipboard!");
      } else {
        triggerToast("Order ID: " + id);
      }
    } catch (err) {
      console.warn("Clipboard fallback alert:", err);
      triggerToast("Order ID: " + id);
    }
  };

  // Filter logic
  const getFilteredOrders = () => {
    switch (activeFilter) {
      case 'active':
        return orders.filter(o => o && ['placed', 'confirmed', 'shipped', 'out_for_delivery'].includes(o.status));
      case 'completed':
        return orders.filter(o => o && o.status === 'delivered');
      case 'cancelled':
        return orders.filter(o => o && o.status === 'cancelled');
      default:
        return orders.filter(Boolean);
    }
  };

  const filteredOrders = getFilteredOrders();

  // Theme styling configurations
  const themeBg = isDark ? 'bg-[#0A0D0B]' : 'bg-[#F4F7F5]';
  const themeCard = isDark ? 'bg-[#131815]' : 'bg-white';
  const themeBorder = isDark ? 'border-[#222E28]' : 'border-[#D9E2DE]';
  const themeTextPrimary = isDark ? 'text-white' : 'text-[#1E2522]';
  const themeTextMuted = isDark ? 'text-[#8A9590]' : 'text-[#626C68]';
  const themeBrandColor = '#4E7661'; // Blushify Sage Green

  // Status Helpers (with default fallback to prevent undefined crashes)
  const getStatusConfig = (status: OrderStatus | undefined) => {
    switch (status) {
      case 'placed':
        return { label: 'Placed', color: themeBrandColor, bg: 'bg-[#4E7661]/10 border-[#4E7661]/20 text-[#4E7661]', icon: Clock };
      case 'confirmed':
        return { label: 'Confirmed', color: themeBrandColor, bg: 'bg-[#4E7661]/10 border-[#4E7661]/20 text-[#4E7661]', icon: CheckCircle2 };
      case 'shipped':
        return { label: 'Shipped', color: '#f59e0b', bg: 'bg-amber-500/10 border-amber-500/20 text-amber-500', icon: Truck };
      case 'out_for_delivery':
        return { label: 'Out for Delivery', color: '#10b981', bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500', icon: Truck };
      case 'delivered':
        return { label: 'Delivered', color: '#22c55e', bg: 'bg-green-500/10 border-green-500/20 text-green-500', icon: CheckCircle2 };
      case 'cancelled':
        return { label: 'Cancelled', color: '#ef4444', bg: 'bg-red-500/10 border-red-500/20 text-red-500', icon: XCircle };
      default:
        return { label: 'Placed', color: themeBrandColor, bg: 'bg-[#4E7661]/10 border-[#4E7661]/20 text-[#4E7661]', icon: Clock };
    }
  };

  const handleCancelOrder = (orderId: string) => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order? This action cannot be undone.",
      [
        { text: "No, Keep Order", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: () => {
            cancelOrder(orderId);
            setSelectedOrder(prev => prev ? { ...prev, status: 'cancelled' } : null);
            triggerToast("Order has been cancelled.");
          }
        }
      ]
    );
  };

  // Render Order List Card
  const renderOrderCard = ({ item }: { item: Order }) => {
    const statusConfig = getStatusConfig(item?.status);
    const StatusIcon = statusConfig.icon || Clock;
    const dateFormatted = safeFormatDate(item?.date, 'MMM dd, yyyy · hh:mm a');
    const firstItem = item?.items?.[0];
    const totalAmount = item?.total ? item.total.toFixed(2) : '0.00';

    return (
      <View>
        <TouchableOpacity 
          onPress={() => setSelectedOrder(item)}
          style={[tw`rounded-3xl p-5 mb-4 border shadow-sm`, tw`${themeCard} ${themeBorder}`]}
          activeOpacity={0.7}
        >
          {/* Card Header */}
          <View style={tw`flex-row justify-between items-center mb-4`}>
            <View>
              <Text style={tw`text-base font-extrabold mb-0.5 tracking-tight ${themeTextPrimary}`}>{item?.id}</Text>
              <View style={tw`flex-row items-center`}>
                <Calendar size={12} style={tw`mr-1 ${isDark ? 'text-[#8A9590]' : 'text-[#626C68]'}`} />
                <Text style={tw`text-xs ${themeTextMuted}`}>{dateFormatted}</Text>
              </View>
            </View>
            <View style={[tw`flex-row items-center border rounded-full px-3 py-1`, tw`${statusConfig.bg}`]}>
              <StatusIcon size={11} color={statusConfig.color} style={tw`mr-1.5`} />
              <Text style={tw`text-[11px] font-extrabold`}>{statusConfig.label}</Text>
            </View>
          </View>

          <View style={tw`h-px mb-4 ${isDark ? 'bg-[#222E28]/50' : 'bg-[#D9E2DE]/50'}`} />

          {/* Card Body - Dual Layout based on item count */}
          {item?.items && item.items.length > 1 ? (
            <View style={tw`mb-2`}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`flex-row gap-x-3 py-1`}>
                {item.items.map((cartItem, idx) => (
                  <View key={`${cartItem?.product?.id || idx}-${idx}`} style={tw`relative`}>
                    <Image 
                      source={{ uri: cartItem?.product?.images?.[0] || 'https://images.unsplash.com/photo-1516257984-b1b4d707412e' }} 
                      style={tw`w-14 h-14 rounded-2xl bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800`}
                    />
                    <View style={tw`absolute -top-1.5 -right-1.5 bg-black dark:bg-white w-5 h-5 rounded-full items-center justify-center border border-white dark:border-[#121212]`}>
                      <Text style={tw`text-[9px] font-black text-white dark:text-black`}>{cartItem?.qty || 1}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
              <Text style={tw`text-xs mt-2 font-medium ${themeTextMuted}`}>
                Contains {item.items.reduce((acc, x) => acc + (x?.qty || 0), 0)} items in total
              </Text>
            </View>
          ) : (
            firstItem && (
              <View style={tw`flex-row items-center`}>
                <Image 
                  source={{ uri: firstItem.product?.images?.[0] || 'https://images.unsplash.com/photo-1516257984-b1b4d707412e' }} 
                  style={[tw`w-16 h-16 rounded-2xl border`, tw`${themeBorder}`]}
                />
                <View style={tw`ml-4 flex-1`}>
                  <Text style={tw`text-sm font-bold ${themeTextPrimary}`} numberOfLines={1}>
                    {firstItem.product?.name}
                  </Text>
                  <View style={tw`flex-row items-center mt-1`}>
                    <Text style={tw`text-xs ${themeTextMuted}`}>
                      Size: {firstItem.size}  ·  Color: 
                    </Text>
                    <View style={[tw`w-2.5 h-2.5 rounded-full ml-1 border border-white/20`, { backgroundColor: firstItem.color }]} />
                  </View>
                  <Text style={tw`text-xs font-bold mt-1 ${themeTextMuted}`}>
                    Qty: {firstItem.qty}
                  </Text>
                </View>
              </View>
            )
          )}

          <View style={tw`h-px my-4 ${isDark ? 'bg-[#222E28]/50' : 'bg-[#D9E2DE]/50'}`} />

          {/* Card Footer */}
          <View style={tw`flex-row justify-between items-center`}>
            <View>
              <Text style={tw`text-[10px] uppercase tracking-wider font-bold ${themeTextMuted}`}>Total Amount</Text>
              <Text style={tw`text-lg font-black mt-0.5 ${themeTextPrimary}`}>${totalAmount}</Text>
            </View>
            <View style={tw`flex-row gap-x-2`}>
              {['placed', 'confirmed'].includes(item?.status) && (
                <TouchableOpacity 
                  onPress={() => handleCancelOrder(item.id)}
                  style={tw`border border-red-500/30 dark:border-red-500/20 px-4 py-2 rounded-full justify-center items-center`}
                >
                  <Text style={tw`text-red-500 font-bold text-xs`}>Cancel</Text>
                </TouchableOpacity>
              )}
              <View style={[tw`px-5 py-2.5 rounded-full flex-row items-center`, { backgroundColor: themeBrandColor }]}>
                <Text style={tw`text-white font-extrabold text-xs mr-1`}>Track</Text>
                <ChevronRight size={12} color="#fff" strokeWidth={2.5} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Render Order Detail View
  const renderOrderDetail = (order: Order) => {
    const statusConfig = getStatusConfig(order?.status);
    const dateFormatted = safeFormatDate(order?.date, 'MMMM dd, yyyy · hh:mm a');
    
    // Delivery tracking stepper configs
    const steps = [
      { key: 'placed', title: 'Order Placed', desc: 'Your order was successfully placed.', icon: FileText },
      { key: 'confirmed', title: 'Confirmed', desc: 'Your order has been confirmed by the store.', icon: CheckCircle2 },
      { key: 'shipped', title: 'Shipped', desc: 'Your package is on its way to the hub.', icon: Truck },
      { key: 'out_for_delivery', title: 'Out for Delivery', desc: 'The courier is delivering package today.', icon: Truck },
      { key: 'delivered', title: 'Delivered', desc: 'Package delivered & signed successfully.', icon: Package }
    ];

    // Determine current active step index
    const getStatusIndex = (status: OrderStatus | undefined) => {
      const idx = steps.findIndex(s => s.key === status);
      return idx === -1 ? 0 : idx;
    };
    const currentStepIdx = getStatusIndex(order?.status);

    return (
      <SafeAreaView style={tw`flex-1 ${themeBg}`}>
        {/* Detail Header */}
        <View style={[tw`flex-row items-center px-5 pb-4 border-b`, tw`${themeCard} ${themeBorder}`, { paddingTop: Platform.OS === 'android' ? 32 : 12 }]}>
          <TouchableOpacity 
            onPress={() => setSelectedOrder(null)} 
            style={[tw`h-10 w-10 rounded-full items-center justify-center border mr-3`, tw`${themeCard} ${themeBorder}`]}
          >
            <ArrowLeft size={20} style={tw`${themeTextPrimary}`} />
          </TouchableOpacity>
          <View style={tw`flex-1`}>
            <Text style={tw`text-lg font-black ${themeTextPrimary}`}>Order Details</Text>
            <View style={tw`flex-row items-center gap-x-1.5 mt-0.5`}>
              <Text style={tw`text-xs font-medium ${themeTextMuted}`}>{order?.id}</Text>
              <TouchableOpacity onPress={() => handleCopyId(order?.id || '')} style={tw`p-1`}>
                <Copy size={12} style={tw`${themeTextMuted}`} />
              </TouchableOpacity>
            </View>
          </View>
          {['placed', 'confirmed'].includes(order?.status || '') && (
            <TouchableOpacity 
              onPress={() => handleCancelOrder(order.id)}
              style={tw`border border-red-500/30 px-3.5 py-1.5 rounded-full`}
            >
              <Text style={tw`text-red-500 font-bold text-xs`}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView contentContainerStyle={tw`p-5 pb-20`} showsVerticalScrollIndicator={false}>
          
          {/* Status Alert Banner */}
          {order?.status === 'cancelled' ? (
            <View style={tw`bg-red-500/10 border border-red-500/20 rounded-3xl p-5 mb-6 flex-row items-start`}>
              <XCircle size={24} color="#ef4444" style={tw`mr-3.5 mt-0.5`} />
              <View style={tw`flex-1`}>
                <Text style={tw`text-red-500 font-bold text-base mb-1`}>Order Cancelled</Text>
                <Text style={tw`text-xs leading-4 ${themeTextMuted}`}>
                  This order was cancelled. If you already made a payment, the refund will be credited to your account within 3-5 business days.
                </Text>
              </View>
            </View>
          ) : (
            <View
              style={[tw`rounded-3xl p-5 mb-6 border`, tw`${themeCard} ${themeBorder}`]}
            >
              <View style={tw`flex-row justify-between items-center mb-1`}>
                <Text style={tw`text-xs uppercase font-black tracking-wider ${themeTextMuted}`}>Current Status</Text>
                <Text style={tw`text-xs ${themeTextMuted}`}>{dateFormatted}</Text>
              </View>
              <View style={tw`flex-row items-center mt-1`}>
                <View style={[tw`w-3 h-3 rounded-full mr-2`, { backgroundColor: statusConfig.color }]} />
                <Text style={tw`text-xl font-black capitalize ${themeTextPrimary}`}>{statusConfig.label}</Text>
              </View>
            </View>
          )}

          {/* Vertical Visual Progress Stepper (Only if not cancelled) */}
          {order?.status !== 'cancelled' && (
            <View style={[tw`rounded-3xl p-6 border mb-6`, tw`${themeCard} ${themeBorder}`]}>
              <Text style={tw`text-base font-black mb-5 ${themeTextPrimary}`}>Delivery Progress</Text>
              
              <View style={tw`relative pl-1.5`}>
                {steps.map((step, index) => {
                  const isCompleted = index <= currentStepIdx;
                  const isActive = index === currentStepIdx;
                  const StepIcon = step.icon;
                  
                  return (
                    <View key={step.key} style={tw`flex-row mb-6 relative`}>
                      {/* Vertical connector line */}
                      {index !== steps.length - 1 && (
                        <View 
                          style={[
                            tw`absolute left-4.5 w-0.5 top-9 bottom-[-24px] z-0`,
                            isCompleted && index < currentStepIdx 
                              ? { backgroundColor: themeBrandColor } 
                              : tw`${isDark ? 'bg-[#222E28]' : 'bg-[#D9E2DE]'}`
                          ]} 
                        />
                      )}

                      {/* Timeline Dot Icon */}
                      <View style={tw`relative z-10 w-9.5 h-9.5 items-center justify-center`}>
                        {/* Glow effect with pure CSS elements */}
                        {isActive && (
                          <View 
                            style={[
                              tw`absolute w-13 h-13 rounded-full border`, 
                              { borderColor: themeBrandColor + '20', backgroundColor: themeBrandColor + '08' }
                            ]} 
                          />
                        )}
                        <View 
                          style={[
                            tw`w-9.5 h-9.5 rounded-full items-center justify-center border`,
                            isActive 
                              ? { backgroundColor: themeBrandColor, borderColor: themeBrandColor } 
                              : isCompleted 
                                ? tw`bg-[#4E7661]/10 border-[#4E7661]/30` 
                                : tw`${isDark ? 'bg-[#19211D] border-[#2A3530]' : 'bg-[#EAF0EC] border-[#D5DFDA]'}`
                          ]}
                        >
                          <StepIcon 
                            size={14} 
                            color={
                              isActive 
                                ? '#fff' 
                                : isCompleted 
                                  ? themeBrandColor 
                                  : (isDark ? '#5C6762' : '#9AA3A0')
                            } 
                          />
                        </View>
                      </View>

                      {/* Step description details */}
                      <View style={tw`ml-4 flex-1 justify-center`}>
                        <Text 
                          style={[
                            tw`text-sm font-bold`,
                            isActive 
                              ? tw`${themeTextPrimary}` 
                              : isCompleted 
                                ? tw`${themeTextPrimary} opacity-80` 
                                : tw`${themeTextMuted}`
                          ]}
                        >
                          {step.title}
                        </Text>
                        <Text style={tw`text-[11px] mt-0.5 leading-4 ${themeTextMuted}`}>
                          {step.desc}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Ordered Products Section */}
          <View style={[tw`rounded-3xl p-5 border mb-6 ${themeCard}`, tw`${themeBorder}`]}>
            <Text style={tw`text-base font-black mb-4 ${themeTextPrimary}`}>Items Ordered ({order?.items?.reduce((acc, x) => acc + (x?.qty || 0), 0) || 0})</Text>
            {order?.items?.map((item, idx) => (
              <View key={`${item?.product?.id || idx}-${idx}`}>
                <View style={tw`flex-row py-3`}>
                  <Image 
                    source={{ uri: item?.product?.images?.[0] || 'https://images.unsplash.com/photo-1516257984-b1b4d707412e' }} 
                    style={[tw`w-16 h-16 rounded-2xl border`, tw`${themeBorder}`]}
                  />
                  <View style={tw`ml-4 flex-1`}>
                    <Text style={tw`text-sm font-bold ${themeTextPrimary}`} numberOfLines={1}>
                      {item?.product?.name}
                    </Text>
                    <Text style={tw`text-xs mt-0.5 ${themeTextMuted}`}>{item?.product?.brand}</Text>
                    <View style={tw`flex-row items-center mt-2`}>
                      <Text style={tw`text-xs ${themeTextMuted}`}>Size: {item?.size}  ·  Color: </Text>
                      <View style={[tw`w-2.5 h-2.5 rounded-full border border-white/20 mr-2`, { backgroundColor: item?.color || '#000' }]} />
                      <Text style={tw`text-xs ${themeTextMuted}`}>Qty: {item?.qty}</Text>
                    </View>
                  </View>
                  <View style={tw`items-end justify-center`}>
                    <Text style={tw`text-base font-black ${themeTextPrimary}`}>${(item?.product?.price * item?.qty).toFixed(2)}</Text>
                  </View>
                </View>
                {idx !== (order?.items?.length || 0) - 1 && (
                  <View style={tw`h-px bg-gray-200 dark:bg-gray-800 my-1`} />
                )}
              </View>
            ))}
          </View>

          {/* Delivery & Shipping Info */}
          <View style={[tw`rounded-3xl p-5 border mb-6 ${themeCard}`, tw`${themeBorder}`]}>
            <View style={tw`flex-row items-center mb-4`}>
              <MapPin size={18} color={themeBrandColor} style={tw`mr-2`} />
              <Text style={tw`text-base font-black ${themeTextPrimary}`}>Delivery Address</Text>
            </View>
            <Text style={tw`text-sm font-bold mb-1 ${themeTextPrimary}`}>{order?.shippingDetails?.name}</Text>
            <View style={tw`flex-row items-center mb-2`}>
              <Phone size={12} style={tw`mr-1.5 ${themeTextMuted}`} />
              <Text style={tw`text-xs ${themeTextMuted}`}>{order?.shippingDetails?.phone}</Text>
            </View>
            <Text style={tw`text-sm leading-5 ${themeTextMuted}`}>
              {order?.shippingDetails?.address}, {order?.shippingDetails?.city} - {order?.shippingDetails?.zip}
            </Text>
          </View>

          {/* Payment & Transaction Info */}
          <View style={[tw`rounded-3xl p-5 border mb-6 ${themeCard}`, tw`${themeBorder}`]}>
            <View style={tw`flex-row items-center mb-4`}>
              <CreditCard size={18} color={themeBrandColor} style={tw`mr-2`} />
              <Text style={tw`text-base font-black ${themeTextPrimary}`}>Payment Method</Text>
            </View>
            <View style={tw`flex-row items-center justify-between`}>
              <View>
                <Text style={tw`text-sm font-bold capitalize ${themeTextPrimary}`}>
                  {order?.paymentMethod === 'cod' ? 'Cash on Delivery' : order?.paymentMethod}
                </Text>
                {order?.paymentNumber && (
                  <Text style={tw`text-xs mt-0.5 ${themeTextMuted}`}>Number: {order.paymentNumber}</Text>
                )}
              </View>
              {order?.paymentMethod !== 'cod' && order?.status !== 'cancelled' && (
                <View style={tw`px-3 py-1 rounded bg-green-500/10 border border-green-500/20`}>
                  <Text style={tw`text-xs font-bold text-green-500`}>Paid</Text>
                </View>
              )}
            </View>
          </View>

          {/* Cost Summary Section */}
          <View style={[tw`rounded-3xl p-5 border mb-6 ${themeCard}`, tw`${themeBorder}`]}>
            <Text style={tw`text-base font-black mb-4 ${themeTextPrimary}`}>Payment Summary</Text>
            
            <View style={tw`flex-row justify-between mb-3.5`}>
              <Text style={tw`text-sm ${themeTextMuted}`}>Subtotal</Text>
              <Text style={tw`text-sm font-bold ${themeTextPrimary}`}>${order?.subtotal?.toFixed(2) || '0.00'}</Text>
            </View>
            <View style={tw`flex-row justify-between mb-3.5`}>
              <Text style={tw`text-sm ${themeTextMuted}`}>Tax (10%)</Text>
              <Text style={tw`text-sm font-bold ${themeTextPrimary}`}>${order?.tax?.toFixed(2) || '0.00'}</Text>
            </View>
            <View style={tw`flex-row justify-between mb-3.5`}>
              <Text style={tw`text-sm ${themeTextMuted}`}>Shipping</Text>
              <Text style={tw`text-sm font-bold text-green-500`}>Free</Text>
            </View>
            {order?.discount && order.discount > 0 ? (
              <View style={tw`flex-row justify-between mb-3.5`}>
                <Text style={tw`text-sm text-green-500`}>Discount</Text>
                <Text style={tw`text-sm font-bold text-green-500`}>-${order.discount.toFixed(2)}</Text>
              </View>
            ) : null}
            
            <View style={tw`h-px bg-gray-200 dark:bg-gray-800 my-3`} />
            
            <View style={tw`flex-row justify-between items-center`}>
              <Text style={tw`text-base font-black ${themeTextPrimary}`}>Total Amount</Text>
              <Text style={tw`text-xl font-black ${themeTextPrimary}`}>${order?.total?.toFixed(2) || '0.00'}</Text>
            </View>
          </View>

          {/* Order Action Simulator (Admin/User Controls) */}
          {order?.status !== 'cancelled' && order?.status !== 'delivered' && (
            <View style={[tw`rounded-3xl p-5 border mb-6 ${themeCard}`, tw`${themeBorder}`]}>
              <Text style={tw`text-base font-black mb-3 ${themeTextPrimary}`}>Order Management</Text>
              
              <View style={tw`flex-row flex-wrap gap-2`}>
                {order?.status === 'placed' && (
                  <TouchableOpacity 
                    onPress={() => {
                      updateOrderStatus(order.id, 'confirmed');
                      setSelectedOrder({ ...order, status: 'confirmed' });
                      triggerToast("Order accepted by store.");
                    }}
                    style={tw`bg-blue-500/10 border border-blue-500/20 px-4 py-2.5 rounded-full`}
                  >
                    <Text style={tw`text-blue-500 font-bold text-sm`}>Accept Order (Admin)</Text>
                  </TouchableOpacity>
                )}
                {order?.status === 'confirmed' && (
                  <TouchableOpacity 
                    onPress={() => {
                      updateOrderStatus(order.id, 'shipped');
                      setSelectedOrder({ ...order, status: 'shipped' });
                      triggerToast("Order has been shipped.");
                    }}
                    style={tw`bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-full`}
                  >
                    <Text style={tw`text-amber-500 font-bold text-sm`}>Ship Order (Admin)</Text>
                  </TouchableOpacity>
                )}
                {order?.status === 'shipped' && (
                  <TouchableOpacity 
                    onPress={() => {
                      updateOrderStatus(order.id, 'out_for_delivery');
                      setSelectedOrder({ ...order, status: 'out_for_delivery' });
                      triggerToast("Order is out for delivery.");
                    }}
                    style={tw`bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-full`}
                  >
                    <Text style={tw`text-emerald-500 font-bold text-sm`}>Out for Delivery (Courier)</Text>
                  </TouchableOpacity>
                )}
                {order?.status === 'out_for_delivery' && (
                  <TouchableOpacity 
                    onPress={() => {
                      updateOrderStatus(order.id, 'delivered');
                      setSelectedOrder({ ...order, status: 'delivered' });
                      triggerToast("Order has been delivered successfully!");
                    }}
                    style={tw`bg-green-500/10 border border-green-500/20 px-4 py-2.5 rounded-full flex-row items-center w-full justify-center mt-1`}
                  >
                    <CheckCircle2 size={18} color="#22c55e" style={tw`mr-2`} />
                    <Text style={tw`text-green-500 font-black text-base`}>Confirm Receipt (Accept)</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Need Help Action */}
          <TouchableOpacity style={[tw`flex-row justify-center items-center py-4 rounded-2xl border shadow-sm`, tw`${themeCard} ${themeBorder}`]}>
            <SupportIcon size={16} style={tw`mr-2 ${themeTextMuted}`} />
            <Text style={tw`text-sm font-bold ${themeTextMuted}`}>Need help with this order?</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    );
  };

  if (selectedOrder) {
    return renderOrderDetail(selectedOrder);
  }

  return (
    <SafeAreaView style={tw`flex-1 ${themeBg}`}>
      {/* Toast Alert overlay (using standard Animated.View) */}
      {showToast && (
        <Animated.View 
          style={[
            tw`absolute left-5 right-5 bg-black/95 dark:bg-white/98 py-3.5 px-5 rounded-2xl flex-row items-center justify-between z-50 shadow-xl border border-white/10 dark:border-black/5`,
            { top: Platform.OS === 'android' ? 48 : 24, opacity: toastOpacity }
          ]}
        >
          <View style={tw`flex-row items-center`}>
            <CheckCircle2 size={16} color={isDark ? '#000' : '#22c55e'} style={tw`mr-2.5`} />
            <Text style={tw`text-sm font-bold text-white dark:text-black`}>{toastMessage}</Text>
          </View>
        </Animated.View>
      )}

      {/* Header */}
      <View style={[tw`flex-row items-center px-5 pb-4 border-b bg-white dark:bg-black`, tw`${themeCard} ${themeBorder}`, { paddingTop: Platform.OS === 'android' ? 32 : 12 }]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={[tw`h-10 w-10 rounded-full items-center justify-center border mr-3`, tw`${themeCard} ${themeBorder}`]}
        >
          <ArrowLeft size={20} style={tw`${themeTextPrimary}`} />
        </TouchableOpacity>
        <Text style={tw`text-2xl font-black ${themeTextPrimary}`}>My Orders</Text>
        {orders.length > 0 && (
          <View style={tw`bg-black dark:bg-white/10 px-2.5 py-0.5 rounded-full ml-3 border border-white/5`}>
            <Text style={tw`text-white dark:text-gray-300 text-xs font-bold`}>{orders.length}</Text>
          </View>
        )}
      </View>

      {/* Filter Tabs */}
      {orders.length > 0 && (
        <View style={[tw`py-4 px-5 border-b`, tw`${themeCard} ${themeBorder}`]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`gap-x-2`}>
            {(['all', 'active', 'completed', 'cancelled'] as FilterType[]).map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                style={[
                  tw`px-5 py-2.5 rounded-full border`,
                  activeFilter === filter
                    ? { backgroundColor: themeBrandColor, borderColor: themeBrandColor }
                    : tw`bg-transparent ${themeBorder}`
                ]}
              >
                <Text
                  style={[
                    tw`text-xs font-bold capitalize`,
                    activeFilter === filter ? tw`text-white` : tw`${themeTextMuted}`
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Main content list */}
      {filteredOrders.length === 0 ? (
        <View style={tw`flex-1 items-center justify-center p-6`}>
          <View style={[tw`w-24 h-24 rounded-full items-center justify-center mb-6 border shadow-sm`, tw`${themeCard} ${themeBorder}`]}>
            <ShoppingBag size={40} color={isDark ? '#5C6762' : '#9CA3AF'} />
          </View>
          <Text style={tw`text-xl font-bold mb-2 ${themeTextPrimary}`}>
            {orders.length === 0 ? 'No orders yet' : 'No matching orders'}
          </Text>
          <Text style={tw`text-center mb-8 text-sm px-6 leading-5 ${themeTextMuted}`}>
            {orders.length === 0 
              ? "You haven't placed any orders yet. Find premium fashion items and place your first order!"
              : "We couldn't find any orders in this status category."}
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)')}
            style={[tw`px-8 py-4 rounded-full shadow-lg`, { backgroundColor: themeBrandColor }]}
          >
            <Text style={tw`text-white font-bold text-base`}>
              {orders.length === 0 ? 'Start Shopping' : 'Browse Store'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item?.id || Math.random().toString()}
          renderItem={renderOrderCard}
          contentContainerStyle={tw`p-5 pb-24`}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
