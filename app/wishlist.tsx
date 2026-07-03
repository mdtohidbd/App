import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, BackHandler, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import tw from '@/lib/tailwind';
import { useShop } from '@/store/useShop';
import ProductCard from '@/components/ProductCard';
import { Heart, ArrowLeft } from 'lucide-react-native';
import { products } from '@/data/products';

export default function WishlistScreen() {
  const { wishlist } = useShop();
  const router = useRouter();

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

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <SafeAreaView style={tw`flex-1 bg-white dark:bg-black`}>
      <View style={[tw`flex-row justify-between items-center px-5 pb-4 border-b border-gray-100 dark:border-gray-800`, { paddingTop: Platform.OS === 'android' ? 32 : 12 }]}>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity onPress={handleBack} style={tw`p-2 -ml-2 mr-2`}>
            <ArrowLeft size={24} style={tw`text-black dark:text-white`} />
          </TouchableOpacity>
          <Text style={tw`text-2xl font-bold text-black dark:text-white`}>Wishlist</Text>
        </View>
        <View style={tw`bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full`}>
          <Text style={tw`text-black dark:text-white font-medium`}>{wishlistedProducts.length} Items</Text>
        </View>
      </View>

      {wishlistedProducts.length === 0 ? (
        <View style={tw`flex-1 items-center justify-center p-5`}>
          <View style={tw`w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full items-center justify-center mb-6`}>
            <Heart size={40} color="#9ca3af" />
          </View>
          <Text style={tw`text-xl font-bold text-black dark:text-white mb-2`}>Your wishlist is empty</Text>
          <Text style={tw`text-gray-500 text-center mb-8`}>Save items you love to your wishlist to easily find them later.</Text>
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/categories')}
            style={tw`bg-black dark:bg-white px-8 py-4 rounded-xl`}
          >
            <Text style={tw`text-white dark:text-black font-bold text-base`}>Explore Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlistedProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={tw`p-2`}
          renderItem={({ item }) => (
            <View style={tw`w-1/2 p-2`}>
              <ProductCard product={item} />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
