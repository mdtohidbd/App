import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView, Platform, Animated, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import tw from '@/lib/tailwind';
import { useShop } from '@/store/useShop';
import { ChevronLeft, Heart, Star, Minus, Plus, ShoppingBag, CheckCircle2, Check } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { height } = Dimensions.get('window');

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = useShop(s => s.products.find(p => p.id === id));
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeBrandColor = '#4E7661'; // Blushify Sage Green
  
  const addToCart = useShop((s) => s.addToCart);
  const toggleWish = useShop((s) => s.toggleWishlist);
  const wished = useShop((s) => s.wishlist.includes(id));

  const [imgIdx, setImgIdx] = useState(0);
  const [size, setSize] = useState(product?.sizes[1] ?? product?.sizes[0] ?? "");
  const [color, setColor] = useState(product?.colors[0] ?? "");
  const [qty, setQty] = useState(1);

  // Toast State
  const [showToast, setShowToast] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  if (!product) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-white dark:bg-black`}>
        <Text style={tw`text-black dark:text-white`}>Product not found</Text>
      </View>
    );
  }

  const add = () => {
    addToCart(product, size, color, qty);
    
    // Show Toast
    setShowToast(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Hide Toast after 3 seconds
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowToast(false));
    }, 3000);
  };

  const buy = () => {
    addToCart(product, size, color, qty);
    router.push('/checkout');
  };

  return (
    <View style={tw`flex-1 bg-white dark:bg-black`}>
      <ScrollView 
        style={tw`flex-1`} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ flexGrow: 1 }}
        bounces={false}
      >
        
        {/* Image Slider */}
        <View style={[tw`relative bg-gray-50 dark:bg-[#111]`, { height: height * 0.45 }]}>
          <Image 
            source={typeof product.images[imgIdx] === 'string' ? { uri: product.images[imgIdx] } : product.images[imgIdx]} 
            style={tw`w-full h-full`} 
            resizeMode="cover"
          />
          
          {/* Top Actions */}
          <SafeAreaView style={tw`absolute inset-x-0 top-0 flex-row justify-between px-4 pt-2 z-10`}>
            <TouchableOpacity 
              onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
              style={[tw`h-10 w-10 items-center justify-center rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-md`, { marginTop: Platform.OS === 'android' ? 20 : 0 }]}
            >
              <ChevronLeft size={20} color={tw.color('dark:text-white') || '#000'} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => toggleWish(product.id)}
              style={[tw`h-10 w-10 items-center justify-center rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-md`, { marginTop: Platform.OS === 'android' ? 20 : 0 }]}
            >
              <Heart size={20} color={wished ? "#ef4444" : (tw.color('dark:text-white') || '#000')} fill={wished ? "#ef4444" : "transparent"} />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Mini thumbnails */}
          <View style={tw`absolute right-3 bottom-10 gap-2`}>
            {product.images.map((img, i) => (
              <TouchableOpacity 
                key={i} 
                onPress={() => setImgIdx(i)}
                style={tw`h-12 w-12 rounded-[12px] border-2 overflow-hidden bg-white/50 ${i === imgIdx ? 'border-black dark:border-white' : 'border-transparent'}`}
              >
                <Image source={typeof img === 'string' ? { uri: img } : img} style={tw`w-full h-full`} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Content */}
        <View style={tw`flex-1 -mt-6 rounded-t-[32px] bg-white dark:bg-[#1A1A1A] px-5 pt-8 shadow-sm border-t border-gray-100 dark:border-white/10 pb-8`}>
          <Text style={tw`text-[10px] uppercase tracking-widest font-extrabold text-gray-400 mb-2`}>{product.brand}</Text>
          
          <View style={tw`flex-row justify-between items-start`}>
            <Text style={tw`text-xl font-black text-black dark:text-white flex-1 mr-4 leading-7`}>{product.name}</Text>
            <View style={tw`items-end`}>
              <Text style={tw`text-xl font-black text-black dark:text-white`}>
                ${(product.price * qty).toFixed(2)}
              </Text>
              {qty > 1 && (
                <Text style={tw`text-xs text-gray-500 dark:text-gray-400 font-bold mt-0.5`}>
                  ${product.price} each
                </Text>
              )}
              {product.oldPrice && (
                <Text style={tw`text-sm text-gray-400 line-through mt-0.5`}>
                  ${(product.oldPrice * qty).toFixed(2)}
                </Text>
              )}
            </View>
          </View>

          <View style={tw`mt-4 flex-row items-center`}>
            <View style={tw`flex-row items-center bg-gray-100 dark:bg-black rounded-full px-2.5 py-1 mr-2 border border-gray-200 dark:border-gray-800`}>
              <Star size={12} fill="#000" color="#000" />
              <Text style={tw`text-xs font-bold text-black dark:text-white ml-1.5`}>{product.rating}</Text>
            </View>
            <Text style={tw`text-sm text-gray-500 font-medium`}>({product.reviews} reviews)</Text>
          </View>

          {/* Color Selection */}
          <View style={tw`mt-7`}>
            <Text style={tw`text-[10px] font-extrabold text-gray-400 tracking-wider mb-3`}>COLOR</Text>
            <View style={tw`flex-row gap-4`}>
              {product.colors.map((c) => {
                const isSelected = color === c;
                return (
                  <TouchableOpacity 
                    key={c}
                    onPress={() => setColor(c)}
                    activeOpacity={0.8}
                    style={[
                      tw`h-11 w-11 rounded-full items-center justify-center border-2`,
                      { 
                        backgroundColor: c, 
                        borderColor: isSelected ? themeBrandColor : (isDark ? '#2D3934' : '#E2E8F0'),
                        shadowColor: isSelected ? themeBrandColor : 'transparent',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: isSelected ? 0.3 : 0,
                        shadowRadius: 4,
                        elevation: isSelected ? 3 : 0
                      }
                    ]}
                  >
                    {isSelected && (
                      <Check 
                        size={18} 
                        color={c.toLowerCase() === '#ffffff' ? '#000000' : '#ffffff'} 
                        strokeWidth={3.5} 
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Size Selection */}
          <View style={tw`mt-7`}>
            <View style={tw`flex-row justify-between items-center mb-3`}>
              <Text style={tw`text-[10px] font-extrabold text-gray-400 tracking-wider`}>SIZE</Text>
              <Text style={tw`text-[11px] text-black dark:text-white opacity-60 font-semibold underline`}>Size guide</Text>
            </View>
            <View style={tw`flex-row flex-wrap gap-3`}>
              {product.sizes.map((s) => (
                <TouchableOpacity 
                  key={s}
                  onPress={() => setSize(s)}
                  style={tw`min-w-[50px] rounded-xl px-3 py-2 items-center justify-center border ${size === s ? 'bg-black dark:bg-white border-black dark:border-white' : 'bg-gray-50 dark:bg-[#222] border-gray-200 dark:border-gray-800'}`}
                >
                  <Text style={tw`text-xs font-bold ${size === s ? 'text-white dark:text-black' : 'text-black dark:text-white'}`}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quantity */}
          <View style={tw`mt-7 flex-row justify-between items-center`}>
            <Text style={tw`text-[10px] font-extrabold text-gray-400 tracking-wider`}>QUANTITY</Text>
            <View style={tw`flex-row items-center bg-gray-100 dark:bg-black rounded-full p-1.5 border border-gray-200 dark:border-gray-800`}>
              <TouchableOpacity 
                onPress={() => setQty(Math.max(1, qty - 1))}
                style={tw`h-8 w-8 items-center justify-center bg-white dark:bg-[#222] rounded-full shadow-sm`}
              >
                <Minus size={16} color={tw.color('dark:text-white') || '#000'} />
              </TouchableOpacity>
              <Text style={tw`w-10 text-center text-sm font-bold text-black dark:text-white`}>{qty}</Text>
              <TouchableOpacity 
                onPress={() => setQty(qty + 1)}
                style={tw`h-8 w-8 items-center justify-center bg-black dark:bg-white rounded-full`}
              >
                <Plus size={16} color={tw.color('dark:text-black') || '#fff'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View style={tw`mt-7`}>
            <Text style={tw`text-[11px] uppercase tracking-wider font-extrabold text-gray-400 mb-2`}>DESCRIPTION</Text>
            <Text style={tw`text-[13px] leading-5 text-gray-500 dark:text-gray-400`}>{product.description}</Text>
          </View>
          
        </View>
      </ScrollView>

      {/* Toast Notification */}
      {showToast && (
        <Animated.View style={[tw`absolute bottom-28 inset-x-5 bg-black dark:bg-white rounded-2xl p-4 flex-row justify-between items-center shadow-lg z-50`, { opacity: fadeAnim }]}>
          <View style={tw`flex-row items-center`}>
            <View style={tw`bg-green-500 rounded-full p-1 mr-3`}>
              <CheckCircle2 size={16} color="#fff" />
            </View>
            <Text style={tw`text-white dark:text-black font-medium`}>Added to Cart</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/cart')}>
            <Text style={tw`text-white dark:text-black font-bold underline`}>View Cart</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Bottom Sticky CTA (Outside ScrollView) */}
      <View style={[tw`bg-white dark:bg-black px-5 pt-4 border-t border-gray-100 dark:border-gray-900 flex-row gap-3`, { paddingBottom: Platform.OS === 'ios' ? 32 : 16 }]}>
        <TouchableOpacity 
          onPress={add}
          style={tw`flex-1 flex-row items-center justify-center bg-[#4E7661]/10 rounded-[20px] py-4 border border-[#4E7661]/20`}
        >
          <ShoppingBag size={18} color="#4E7661" style={tw`mr-2`} />
          <Text style={tw`text-base font-bold text-[#4E7661]`}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={buy}
          style={tw`flex-1 items-center justify-center bg-[#4E7661] rounded-[20px] py-4 shadow-lg shadow-[#4E7661]/30`}
        >
          <Text style={tw`text-base font-bold text-white`}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
