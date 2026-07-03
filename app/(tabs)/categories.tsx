import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import tw from '@/lib/tailwind';
import { categories, products } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import { ShoppingBag } from 'lucide-react-native';

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ categoryId?: string }>();
  const [active, setActive] = useState<string>("all");

  React.useEffect(() => {
    if (params.categoryId) {
      setActive(params.categoryId);
    }
  }, [params.categoryId]);
  const filtered = active === "all" ? products : products.filter((p) => p.category === active);

  return (
    <View style={tw`flex-1 bg-white dark:bg-black`}>
      <View style={[tw`px-5 pb-2 flex-row justify-between items-center`, { paddingTop: Math.max(insets.top, 16) }]}>
        <View>
          <Text style={tw`text-2xl font-bold text-black dark:text-white`}>Shop</Text>
          <Text style={tw`text-xs text-gray-500`}>Browse all categories</Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.push('/cart')}
          style={tw`h-10 w-10 bg-gray-100 rounded-full items-center justify-center`}
        >
          <ShoppingBag size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Category selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`px-5 mt-4`} contentContainerStyle={tw`pb-2`}>
          <TouchableOpacity 
            style={tw`items-center mr-4`}
            onPress={() => setActive('all')}
          >
            <View style={tw`h-16 w-16 rounded-2xl items-center justify-center mb-1 ${active === 'all' ? 'bg-black' : 'bg-gray-100'}`}>
              <Text style={tw`text-xs font-bold ${active === 'all' ? 'text-white' : 'text-black'}`}>All</Text>
            </View>
            <Text style={tw`text-[11px] text-gray-500`}>All</Text>
          </TouchableOpacity>

          {categories.map((c) => (
            <TouchableOpacity 
              key={c.id} 
              style={tw`items-center mr-4 opacity-${active === c.id ? '100' : '50'}`}
              onPress={() => setActive(c.id)}
            >
              <View style={tw`h-16 w-16 rounded-2xl overflow-hidden bg-gray-100 mb-1 border-2 ${active === c.id ? 'border-black' : 'border-transparent'}`}>
                <Image source={{ uri: c.img }} style={tw`w-full h-full`} />
              </View>
              <Text style={tw`text-[11px] text-gray-500`}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={tw`px-5 mt-6 mb-2`}>
          <Text style={tw`text-sm text-gray-500`}>{filtered.length} items</Text>
        </View>

        {/* Product Grid */}
        <View style={tw`px-5 flex-row flex-wrap justify-between`}>
          {filtered.map((p) => (
            <View key={p.id} style={tw`w-[48%]`}>
              <ProductCard product={p} />
            </View>
          ))}
        </View>
        <View style={tw`h-20`} />
      </ScrollView>
    </View>
  );
}
