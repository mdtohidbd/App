import React, { useEffect, useState, useRef } from 'react';
import { 
  View, Text, ScrollView, Image, TouchableOpacity, 
  Dimensions, TextInput, FlatList, Platform, Animated as RNAnimated 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import tw from '@/lib/tailwind';
import { banners, categories, flashSale } from '@/data/products';
import { ChevronRight, Zap, Bell, Search, X } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useShop } from '@/store/useShop';
import ProductCard from '@/components/ProductCard';
import { useCountdown } from '@/hooks/useCountdown';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  
  const hour = new Date().getHours();
  let greeting = 'Good evening 🌙';
  if (hour >= 5 && hour < 12) greeting = 'Good morning ✨';
  else if (hour >= 12 && hour < 17) greeting = 'Good afternoon ☀️';

  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const products = useShop(s => s.products);

  const { h, m, s } = useCountdown(5); // 5 hours countdown
  const [searchQuery, setSearchQuery] = useState('');

  // Search input focus states
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Pulse animation for Flash Sale Zap Badge
  const pulseAnim = useRef(new RNAnimated.Value(1)).current;

  useEffect(() => {
    RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 800,
          useNativeDriver: true,
        }),
        RNAnimated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [pulseAnim]);

  // Extended banners array for seamless infinite carousel
  const extendedBanners = [...banners, banners[0]];

  // Hero Banner Auto Scroll
  const bannerRef = useRef<FlatList>(null);
  const [currentBanner, setCurrentBanner] = useState(0);
  const isAutoScrolling = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isAutoScrolling.current) return;
      
      let nextIndex = currentBanner + 1;
      
      if (nextIndex >= extendedBanners.length) {
        nextIndex = 1;
      }
      
      if (bannerRef.current) {
        isAutoScrolling.current = true;
        bannerRef.current.scrollToIndex({ index: nextIndex, animated: true });
        setCurrentBanner(nextIndex);
        
        // If we just scrolled to the cloned last item (which is index = banners.length)
        if (nextIndex === banners.length) {
          setTimeout(() => {
            if (bannerRef.current) {
              bannerRef.current.scrollToIndex({ index: 0, animated: false });
              setCurrentBanner(0);
              isAutoScrolling.current = false;
            }
          }, 500); // 500ms matches standard transition duration
        } else {
          setTimeout(() => {
            isAutoScrolling.current = false;
          }, 500);
        }
      }
    }, 4000);
    
    return () => clearInterval(interval);
  }, [currentBanner]);

  const onMomentumScrollEnd = (e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    
    if (index >= banners.length) {
      // Swiped to the cloned end, silently snap to index 0
      bannerRef.current?.scrollToIndex({ index: 0, animated: false });
      setCurrentBanner(0);
    } else {
      setCurrentBanner(index);
    }
  };

  // Filter products based on search query
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Color theme selections
  const themeBg = isDark ? 'bg-[#0A0D0B]' : 'bg-[#F4F7F5]';
  const themeCard = isDark ? 'bg-[#131815]' : 'bg-white';
  const themeBorder = isDark ? 'border-[#222E28]' : 'border-[#D9E2DE]';
  const themeTextPrimary = isDark ? 'text-white' : 'text-gray-900';
  const themeTextMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const themeBrandColor = '#4E7661'; // Blushify Sage Green

  const renderTimerBlock = (value: string) => (
    <View style={[
      tw`rounded-xl px-2.5 py-1.5 border items-center justify-center min-w-[34px] shadow-sm`,
      { 
        backgroundColor: isDark ? '#1C1516' : '#FFF3F3',
        borderColor: isDark ? '#4A1D20' : '#FFD2D2'
      }
    ]}>
      <Text style={[
        tw`text-xs font-black text-red-500`,
        { 
          fontVariant: ['tabular-nums'],
          textShadowColor: 'rgba(239, 68, 68, 0.15)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2
        }
      ]}>
        {value}
      </Text>
    </View>
  );

  return (
    <View style={[tw`flex-1`, tw`${themeBg}`]}>
      
      {/* Sticky Top Header */}
      <Animated.View 
        entering={FadeInUp.duration(600).delay(100)}
        style={[
          tw`px-5 pb-3 border-b`,
          tw`${themeCard} ${themeBorder}`,
          { paddingTop: Math.max(insets.top, 16) }
        ]}
      >
        <View style={tw`flex-row justify-between items-center mb-3`}>
          <View>
            <Text style={tw`text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5`}>{greeting}</Text>
            <Text style={[tw`text-3xl font-black tracking-tight`, tw`${themeTextPrimary}`]}>Stylofy</Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => router.push('/notifications')}
            style={[tw`h-11 w-11 rounded-2xl items-center justify-center border shadow-sm relative`, tw`${themeCard} ${themeBorder}`]}
          >
            <Bell size={20} color={isDark ? '#fff' : '#000'} strokeWidth={2} />
            <View style={tw`absolute top-2.5 right-3 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full`} />
          </TouchableOpacity>
        </View>

        {/* Dynamic Search Bar */}
        <View style={[
          tw`flex-row items-center border rounded-2xl px-4 py-0.5 shadow-sm`,
          {
            backgroundColor: isDark ? '#19201C' : '#F9FBF9',
            borderColor: isSearchFocused ? themeBrandColor : (isDark ? '#222E28' : '#E5E7EB'),
            borderWidth: isSearchFocused ? 1.5 : 1
          }
        ]}>
          <Search size={18} color="#9ca3af" style={tw`mr-3`} />
          <TextInput 
            placeholder="Search for premium fashion..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            style={[
              tw`flex-1 text-sm py-3 px-0`,
              tw`${themeTextPrimary}`,
              Platform.OS === 'web' && { outlineStyle: 'none' } as any
            ]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={tw`p-1.5 rounded-full bg-gray-200 dark:bg-gray-800 ml-2`}
            >
              <X size={12} style={tw`${themeTextPrimary}`} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* SEARCH RESULTS SCREEN */}
      {searchQuery.trim() !== '' ? (
        <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`p-5`}>
          <View style={tw`flex-row justify-between items-center mb-5`}>
            <Text style={[tw`text-lg font-extrabold`, tw`${themeTextPrimary}`]}>
              Search Results
            </Text>
            <Text style={tw`text-xs text-gray-500`}>
              {filteredProducts.length} items found
            </Text>
          </View>

          {filteredProducts.length === 0 ? (
            <View style={tw`py-16 items-center justify-center`}>
              <View style={[tw`w-20 h-20 rounded-full border items-center justify-center mb-4`, tw`${themeCard} ${themeBorder}`]}>
                <Search size={32} color="#9ca3af" />
              </View>
              <Text style={[tw`text-lg font-bold text-center mb-1`, tw`${themeTextPrimary}`]}>No Matches Found</Text>
              <Text style={tw`text-xs text-gray-400 text-center px-8`}>
                {"We couldn't find any products matching your search. Try double checking spelling or category."}
              </Text>
            </View>
          ) : (
            <View style={tw`flex-row flex-wrap justify-between`}>
              {filteredProducts.map((p) => (
                <View key={p.id} style={tw`w-[48%] mb-4`}>
                  <ProductCard product={p} />
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        /* STANDARD HOME FEED SCREEN */
        <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
          
          {/* Hero Banner Banner Carousel */}
          <Animated.View entering={FadeInDown.duration(600).delay(200)} style={tw`mt-4`}>
            <FlatList
              ref={bannerRef}
              data={extendedBanners}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEnabled={true}
              onMomentumScrollEnd={onMomentumScrollEnd}
              onScrollToIndexFailed={(info) => {
                const wait = new Promise((resolve) => setTimeout(resolve, 50));
                wait.then(() => {
                  bannerRef.current?.scrollToIndex({ index: info.index, animated: false });
                });
              }}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              renderItem={({ item }) => (
                <View style={[tw`px-5`, { width }]}>
                  <View style={tw`relative h-48 rounded-[28px] overflow-hidden bg-gray-900 shadow-md`}>
                    <Image source={typeof item.img === 'string' ? { uri: item.img } : item.img} style={tw`absolute inset-0 w-full h-full opacity-85`} />
                    <View style={tw`absolute inset-0 bg-black/35 p-6 flex-col justify-end`}>
                      <View style={tw`bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full self-start mb-3 border border-white/25`}>
                        <Text style={tw`text-[9px] font-bold text-white tracking-widest uppercase`}>Featured</Text>
                      </View>
                      <Text style={tw`text-2xl font-black text-white mb-1.5 leading-7`}>{item.title}</Text>
                      <Text style={tw`text-xs text-white/80`}>{item.subtitle}</Text>
                    </View>
                  </View>
                </View>
              )}
            />
            {/* Elegant Pagination Indicators */}
            <View style={tw`flex-row justify-center items-center mt-3 gap-1.5`}>
              {banners.map((_, i) => {
                const isActive = (currentBanner % banners.length) === i;
                return (
                  <View 
                    key={i} 
                    style={[
                      tw`h-1.5 rounded-full`,
                      isActive 
                        ? [tw`w-4`, { backgroundColor: themeBrandColor }] 
                        : [tw`w-1.5`, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }]
                    ]} 
                  />
                );
              })}
            </View>
          </Animated.View>

          {/* Interactive Categories (Navigation Switch) */}
          <Animated.View entering={FadeInDown.duration(600).delay(300)} style={tw`mt-8 px-5`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text style={[tw`text-lg font-black tracking-tight`, tw`${themeTextPrimary}`]}>Categories</Text>
              <TouchableOpacity 
                onPress={() => router.push('/categories')}
                style={tw`flex-row items-center`}
              >
                <Text style={tw`text-xs text-gray-500 font-bold`}>See all </Text>
                <ChevronRight size={14} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`-mx-5 px-5`}>
              {categories.map((c) => (
                <TouchableOpacity 
                  key={c.id} 
                  onPress={() => router.push(`/categories?categoryId=${c.id}`)}
                  style={tw`mr-4 items-center`}
                >
                  <View style={[
                    tw`h-16 w-16 rounded-[22px] overflow-hidden mb-2 border items-center justify-center shadow-sm`,
                    tw`${themeCard} ${themeBorder}`
                  ]}>
                    <Image source={typeof c.img === 'string' ? { uri: c.img } : c.img} style={tw`w-full h-full opacity-95`} />
                    <View style={tw`absolute inset-0 bg-black/10`} />
                  </View>
                  <Text style={[tw`text-xs font-bold`, tw`${themeTextPrimary}`]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Flash Sale with Premium Countdown Timer */}
          <Animated.View entering={FadeInDown.duration(600).delay(400)} style={tw`mt-8 px-5`}>
            <View style={tw`flex-row justify-between items-center mb-4.5`}>
              <View style={tw`flex-row items-center`}>
                {/* Glowing Zap circle */}
                <RNAnimated.View style={[
                  tw`bg-red-500/10 p-2 rounded-full mr-2.5 border border-red-500/15`,
                  { transform: [{ scale: pulseAnim }] }
                ]}>
                  <Zap size={15} color="#ef4444" fill="#ef4444" />
                </RNAnimated.View>
                
                <Text style={[tw`text-lg font-black tracking-tight mr-4.5`, tw`${themeTextPrimary}`]}>
                  Flash Sale
                </Text>
                
                {/* Premium Monospaced Digital Timer */}
                <View style={tw`flex-row items-center gap-x-1`}>
                  {renderTimerBlock(h)}
                  <Text style={[tw`text-xs font-bold text-red-500/80`, { fontVariant: ['tabular-nums'] }]}>:</Text>
                  {renderTimerBlock(m)}
                  <Text style={[tw`text-xs font-bold text-red-500/80`, { fontVariant: ['tabular-nums'] }]}>:</Text>
                  {renderTimerBlock(s)}
                </View>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`-mx-5 px-5`}>
              {flashSale().map((p) => (
                <View key={p.id} style={tw`mr-4 w-44`}>
                  <ProductCard product={p} />
                </View>
              ))}
            </ScrollView>
          </Animated.View>

          {/* All Products Grid */}
          <Animated.View entering={FadeInDown.duration(600).delay(500)} style={tw`mt-8 px-5`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text style={[tw`text-lg font-black tracking-tight`, tw`${themeTextPrimary}`]}>All Premium Collections</Text>
            </View>
            <View style={tw`flex-row flex-wrap justify-between`}>
              {products.map((p) => (
                <View key={p.id} style={tw`w-[48%] mb-3`}>
                  <ProductCard product={p} />
                </View>
              ))}
            </View>
          </Animated.View>

          <View style={tw`h-28`} />
        </ScrollView>
      )}
    </View>
  );
}
