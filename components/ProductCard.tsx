import React from 'react';
import { View, Text, Image, TouchableOpacity, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import tw from '@/lib/tailwind';
import { Product } from '@/data/products';
import { Star, Heart } from 'lucide-react-native';
import { useShop } from '@/store/useShop';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, runOnJS } from 'react-native-reanimated';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const toggleWish = useShop((s) => s.toggleWishlist);
  const wished = useShop((s) => s.wishlist.includes(product.id));

  const scale = useSharedValue(1);
  const cardScale = useSharedValue(1);

  const handleHeartPress = () => {
    scale.value = withSequence(
      withSpring(1.4, { damping: 2, stiffness: 80 }),
      withSpring(1, { damping: 4, stiffness: 40 })
    );
    toggleWish(product.id);
  };

  const heartStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    cardScale.value = withSpring(0.96, { damping: 15, stiffness: 220 });
  };

  const handlePressOut = () => {
    cardScale.value = withSpring(1.0, { damping: 15, stiffness: 220 });
  };

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardScale.value }],
    };
  });

  return (
    <Pressable 
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => router.push(`/product/${product.id}` as any)}
      style={tw`w-full`}
    >
      <Animated.View style={[
        tw`w-full bg-white dark:bg-[#1A1A1A] rounded-[24px] overflow-hidden shadow-md shadow-gray-200 dark:shadow-none border border-gray-100 dark:border-white/10`,
        cardStyle
      ]}>
        <View style={tw`h-44 relative bg-gray-50 dark:bg-[#111]`}>
          <Image 
            source={typeof product.images[0] === 'string' ? { uri: product.images[0] } : product.images[0]} 
            style={tw`w-full h-full`} 
            resizeMode="cover"
          />
          {product.badge && (
            <View style={tw`absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full`}>
              <Text style={tw`text-[10px] font-bold text-white tracking-widest`}>{product.badge}</Text>
            </View>
          )}
          <Pressable 
            onPress={handleHeartPress}
            style={tw`absolute top-3 right-3 h-8 w-8 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-full items-center justify-center`}
          >
            <Animated.View style={heartStyle}>
              <Heart size={16} color={wished ? '#ef4444' : (tw.color('dark:text-white') || '#000')} fill={wished ? '#ef4444' : 'transparent'} />
            </Animated.View>
          </Pressable>
        </View>

        <View style={tw`p-2.5`}>
          <Text style={tw`text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-0.5`}>{product.brand}</Text>
          <View style={tw`min-h-[36px] justify-start mb-1.5`}>
            <Text numberOfLines={2} style={tw`text-sm font-bold text-black dark:text-white leading-tight`}>{product.name}</Text>
          </View>
          <View style={tw`flex-row justify-between items-center mt-auto`}>
            <View style={tw`flex-row items-baseline`}>
              <Text style={tw`text-base font-black text-black dark:text-white tracking-tight`}>${product.price}</Text>
              {product.oldPrice && (
                <Text style={tw`text-[10px] text-gray-400 line-through ml-1.5`}>${product.oldPrice}</Text>
              )}
            </View>
            <View style={tw`flex-row items-center bg-gray-50 dark:bg-[#222] px-1.5 py-0.5 rounded-full border border-gray-100 dark:border-gray-800`}>
              <Star size={10} color="#f59e0b" fill="#f59e0b" />
              <Text style={tw`text-[10px] font-bold text-black dark:text-white ml-1`}>{product.rating}</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}
