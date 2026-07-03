import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import tw from '@/lib/tailwind';
import { useShop } from '@/store/useShop';
import { products } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import { Tag, Copy, Check, Percent, Sparkles } from 'lucide-react-native';

const COUPONS = [
  {
    code: 'VOGUE20',
    discount: '20% OFF',
    title: 'Site-wide Discount',
    desc: 'Get 20% off on all items. No minimum spend required.',
    expiry: 'Expires in 3 days',
  },
  {
    code: 'FREESHIP',
    discount: 'FREE SHIPPING',
    title: 'Free Delivery',
    desc: 'Enjoy free delivery worldwide on orders over $100.',
    expiry: 'Expires in 7 days',
  },
  {
    code: 'NEWSTYLE',
    discount: '$30 OFF',
    title: 'New Season Special',
    desc: 'Get $30 off on orders of $150 or more. Valid on outerwear.',
    expiry: 'Limited time offer',
  },
];

const COUPON_THEMES = [
  { 
    bg: 'bg-[#4E7661]',
    border: 'border-[#436754]',
    title: 'text-white',
    desc: 'text-[#D0DFD7]',
    badgeBg: 'bg-white/20',
    badgeText: 'text-white',
    expiry: 'text-white/90',
    codeBox: 'bg-white/15 border-white/20',
    codeText: 'text-white',
    btnBg: 'bg-white',
    btnText: 'text-[#4E7661]',
    iconColor: '#4E7661'
  },
  { 
    bg: 'bg-[#1A1A1A]',
    border: 'border-[#2A2A2A]',
    title: 'text-white',
    desc: 'text-gray-400',
    badgeBg: 'bg-white/15',
    badgeText: 'text-white',
    expiry: 'text-gray-400',
    codeBox: 'bg-white/10 border-white/10',
    codeText: 'text-white',
    btnBg: 'bg-white',
    btnText: 'text-black',
    iconColor: '#000000'
  },
  { 
    bg: 'bg-[#8F353C]',
    border: 'border-[#7C2D33]',
    title: 'text-white',
    desc: 'text-[#E8C4C6]',
    badgeBg: 'bg-white/20',
    badgeText: 'text-white',
    expiry: 'text-white/90',
    codeBox: 'bg-white/15 border-white/20',
    codeText: 'text-white',
    btnBg: 'bg-white',
    btnText: 'text-[#8F353C]',
    iconColor: '#8F353C'
  },
];

export default function OffersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Filter products that have an oldPrice or are explicitly badged as "SALE"
  const saleProducts = products.filter(p => p.oldPrice || p.badge === 'SALE');

  const copyToClipboard = async (code: string) => {
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(code);
      } else {
        const Clipboard = require('react-native').Clipboard;
        if (Clipboard && typeof Clipboard.setString === 'function') {
          Clipboard.setString(code);
        }
      }
    } catch (e) {
      console.log('Clipboard write failed or is unsupported on this platform:', e);
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <View style={tw`flex-1 bg-white dark:bg-black`}>
      <View style={[tw`px-5 pb-4 bg-white dark:bg-black z-10 border-b border-gray-100 dark:border-gray-900`, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={tw`flex-row items-center`}>
          <View style={tw`w-10 h-10 rounded-full bg-amber-500/10 items-center justify-center mr-3`}>
            <Percent size={20} color="#f59e0b" />
          </View>
          <View>
            <Text style={tw`text-2xl font-black text-black dark:text-white`}>Offers & Deals</Text>
            <Text style={tw`text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5`}>Promo Codes & Hot Sales</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={saleProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={tw`px-4`}
        contentContainerStyle={tw`pb-32`}
        ListHeaderComponent={
          <View style={tw`px-5 pt-6 pb-4`}>
            {/* Promo Codes Section */}
            <View style={tw`flex-row items-center mb-4`}>
              <Sparkles size={18} color="#f59e0b" style={tw`mr-2`} />
              <Text style={tw`text-lg font-bold text-black dark:text-white`}>Available Coupons</Text>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={tw`pb-4 gap-x-4`}
            >
              {COUPONS.map((coupon, index) => {
                const theme = COUPON_THEMES[index % COUPON_THEMES.length];
                return (
                <View 
                  key={coupon.code} 
                  style={tw`w-72 ${theme.bg} border ${theme.border} rounded-[28px] p-5 shadow-lg shadow-black/10`}
                >
                  <View style={tw`flex-row justify-between items-start mb-4`}>
                    <View style={tw`${theme.badgeBg} px-3 py-1.5 rounded-full border border-white/10`}>
                      <Text style={tw`text-xs font-black ${theme.badgeText}`}>{coupon.discount}</Text>
                    </View>
                    <Text style={tw`text-xs font-semibold ${theme.expiry} mt-1.5`}>{coupon.expiry}</Text>
                  </View>

                  <Text style={tw`text-xl font-black ${theme.title} mb-1.5 tracking-tight`}>{coupon.title}</Text>
                  <Text style={tw`text-xs ${theme.desc} mb-5 leading-5`} numberOfLines={2}>
                    {coupon.desc}
                  </Text>

                  <View style={tw`flex-row items-center justify-between ${theme.codeBox} p-2 rounded-2xl border`}>
                    <Text style={tw`text-sm font-black ${theme.codeText} pl-3 tracking-widest`}>{coupon.code}</Text>
                    <TouchableOpacity 
                      onPress={() => copyToClipboard(coupon.code)}
                      style={tw`flex-row items-center ${theme.btnBg} px-4 py-2.5 rounded-xl shadow-sm`}
                    >
                      {copiedCode === coupon.code ? (
                        <>
                          <Check size={16} color={theme.iconColor} style={tw`mr-1.5`} strokeWidth={3} />
                          <Text style={tw`text-xs font-bold ${theme.btnText}`}>Copied!</Text>
                        </>
                      ) : (
                        <>
                          <Copy size={16} color={theme.iconColor} style={tw`mr-1.5`} strokeWidth={2.5} />
                          <Text style={tw`text-xs font-bold ${theme.btnText}`}>Copy</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
                );
              })}
            </ScrollView>

            {/* Sale Products Section Header */}
            <View style={tw`flex-row items-center mt-6 mb-2`}>
              <Tag size={18} color="#ef4444" style={tw`mr-2`} />
              <Text style={tw`text-lg font-bold text-black dark:text-white`}>Hot Sales & Discounts</Text>
              <View style={tw`bg-red-500/10 px-2.5 py-1 rounded-full ml-3`}>
                <Text style={tw`text-xs font-black text-red-500`}>{saleProducts.length} Items</Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={tw`w-1/2 p-2`}>
            <ProductCard product={item} />
          </View>
        )}
      />
    </View>
  );
}
