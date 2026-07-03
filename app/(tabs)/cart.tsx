import React, { useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import tw from '@/lib/tailwind';
import { useShop, cartTotals } from '@/store/useShop';
import { Minus, Plus, Trash2, ArrowRight, Tag, X } from 'lucide-react-native';
import { Swipeable } from 'react-native-gesture-handler';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cart, removeFromCart, updateQty, coupon } = useShop();
  
  const totals = cartTotals(cart, coupon);

  const renderRightActions = (id: string) => {
    return (
      <TouchableOpacity 
        style={tw`bg-red-500 w-20 justify-center items-center h-full`}
        onPress={() => removeFromCart(id)}
      >
        <Trash2 size={24} color="#fff" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={tw`flex-1 bg-gray-50 dark:bg-black`}>
      {/* Header */}
      <View style={[tw`px-5 pb-4 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-black/90 z-10`, { paddingTop: Math.max(insets.top, 16) }]}>
        <Text style={tw`text-2xl font-bold text-black dark:text-white`}>Shopping Cart</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-1`}
      >
        <ScrollView 
          contentContainerStyle={tw`p-5 pb-40`} 
          showsVerticalScrollIndicator={false}
        >
          {cart.length === 0 ? (
            <View style={tw`flex-1 items-center justify-center py-20`}>
              <View style={tw`w-32 h-32 bg-gray-100 dark:bg-gray-900 rounded-full items-center justify-center mb-6`}>
                <Image 
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2762/2762885.png' }} 
                  style={tw`w-16 h-16 opacity-50`} 
                />
              </View>
              <Text style={tw`text-xl font-bold text-black dark:text-white mb-2`}>Your cart is empty</Text>
              <Text style={tw`text-gray-500 text-center mb-8 px-10`}>Looks like you haven't added anything to your cart yet.</Text>
              <TouchableOpacity 
                onPress={() => router.push('/(tabs)')}
                style={tw`bg-black dark:bg-white px-8 py-4 rounded-xl shadow-lg`}
              >
                <Text style={tw`text-white dark:text-black font-bold text-base`}>Start Shopping</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Cart Items */}
              <View style={tw`mb-8`}>
                {cart.map((item) => (
                  <View key={item.product.id} style={tw`mb-4 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800`}>
                    <Swipeable renderRightActions={() => renderRightActions(item.product.id)}>
                      <View style={tw`flex-row p-3 bg-white dark:bg-gray-900`}>
                        <View style={tw`w-24 h-28 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden`}>
                          <Image source={{ uri: item.product.images[0] }} style={tw`w-full h-full`} resizeMode="cover" />
                        </View>
                        
                        <View style={tw`flex-1 ml-4 py-1 justify-between`}>
                          <View>
                            <View style={tw`flex-row justify-between items-start`}>
                              <Text numberOfLines={1} style={tw`text-base font-semibold text-black dark:text-white flex-1 pr-2`}>{item.product.name}</Text>
                              <TouchableOpacity 
                                onPress={() => removeFromCart(item.product.id)}
                                style={tw`p-1.5 bg-gray-50 dark:bg-gray-800 rounded-full`}
                              >
                                <X size={14} color="#9ca3af" />
                              </TouchableOpacity>
                            </View>
                            <Text style={tw`text-xs text-gray-500 mt-1`}>Size: {item.size}  |  Color: {item.color}</Text>
                          </View>
                          
                          <View style={tw`flex-row justify-between items-end`}>
                            <Text style={tw`text-lg font-bold text-black dark:text-white`}>${item.product.price}</Text>
                            
                            {/* Quantity Updater */}
                            <View style={tw`flex-row items-center bg-gray-100 dark:bg-black rounded-full px-2 py-1 border border-gray-200 dark:border-gray-800`}>
                              <TouchableOpacity 
                                onPress={() => {
                                  if (item.qty <= 1) {
                                    removeFromCart(item.product.id);
                                  } else {
                                    updateQty(item.product.id, item.qty - 1);
                                  }
                                }}
                                style={tw`p-1`}
                              >
                                <Minus size={14} color={tw.color('dark:text-white') || '#000'} />
                              </TouchableOpacity>
                              <Text style={tw`mx-3 font-semibold text-black dark:text-white`}>{item.qty}</Text>
                              <TouchableOpacity 
                                onPress={() => updateQty(item.product.id, item.qty + 1)}
                                style={tw`p-1`}
                              >
                                <Plus size={14} color={tw.color('dark:text-white') || '#000'} />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </View>
                    </Swipeable>
                  </View>
                ))}
              </View>

              {/* Promo Code (Aesthetic) */}
              <View style={tw`flex-row items-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl mb-8 shadow-sm pl-4 pr-1.5 py-1.5`}>
                <Tag size={20} color="#9ca3af" />
                <TextInput 
                  placeholder="Enter Promo Code"
                  placeholderTextColor="#9ca3af"
                  style={tw`flex-1 px-3 py-3 text-black dark:text-white text-base font-medium`}
                />
                <TouchableOpacity style={tw`bg-black dark:bg-white px-6 py-3.5 rounded-xl shadow-md active:opacity-80`}>
                  <Text style={tw`text-white dark:text-black font-bold uppercase tracking-wider text-xs`}>Apply</Text>
                </TouchableOpacity>
              </View>

              {/* Order Summary */}
              <View style={tw`bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 mb-4`}>
                <Text style={tw`text-lg font-bold text-black dark:text-white mb-4`}>Order Summary</Text>
                <View style={tw`flex-row justify-between mb-3`}>
                  <Text style={tw`text-gray-500`}>Subtotal</Text>
                  <Text style={tw`font-semibold text-black dark:text-white`}>${totals.subtotal.toFixed(2)}</Text>
                </View>
                <View style={tw`flex-row justify-between mb-3`}>
                  <Text style={tw`text-gray-500`}>Tax (10%)</Text>
                  <Text style={tw`font-semibold text-black dark:text-white`}>${(totals.subtotal * 0.1).toFixed(2)}</Text>
                </View>
                {totals.discount > 0 && (
                  <View style={tw`flex-row justify-between mb-3`}>
                    <Text style={tw`text-green-500`}>Discount</Text>
                    <Text style={tw`font-semibold text-green-500`}>-${totals.discount.toFixed(2)}</Text>
                  </View>
                )}
                <View style={tw`h-px bg-gray-100 dark:bg-gray-800 my-2`} />
                <View style={tw`flex-row justify-between items-center mt-2`}>
                  <Text style={tw`text-xl font-bold text-black dark:text-white`}>Total</Text>
                  <Text style={tw`text-2xl font-black text-black dark:text-white`}>${(totals.subtotal * 1.1 - totals.discount).toFixed(2)}</Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Checkout Button */}
      {cart.length > 0 && (
        <View style={tw`absolute bottom-20 inset-x-0 bg-white/90 dark:bg-black/90 p-5 border-t border-gray-100 dark:border-gray-800`}>
          <TouchableOpacity 
            style={tw`bg-black dark:bg-white w-full py-4 rounded-2xl flex-row justify-center items-center shadow-lg`}
            onPress={() => router.push('/checkout')}
          >
            <Text style={tw`text-white dark:text-black font-bold text-lg mr-2`}>Proceed to Checkout</Text>
            <ArrowRight size={20} color={tw.color('dark:text-black') || '#fff'} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
