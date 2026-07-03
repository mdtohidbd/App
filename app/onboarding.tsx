import React, { useRef, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Dimensions, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  Extrapolate, 
  interpolate,
  useAnimatedScrollHandler
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import tw from '@/lib/tailwind';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Discover Your\nUnique Style',
    subtitle: 'Explore the latest trends in fashion and get the best collections from top brands around the globe.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: '2',
    title: 'Premium Quality\nExclusive Deals',
    subtitle: 'Get access to limited editions and exclusive drops from your favorite premium fashion designers.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: '3',
    title: 'Fast Delivery\nTo Your Door',
    subtitle: 'Enjoy lightning fast shipping worldwide with premium packaging and hassle-free returns.',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1000&q=80',
  },
];

const AnimatedFlatList = Animated.createAnimatedComponent(Animated.FlatList);

const Slide = ({ item, index, scrollX, isDark }: any) => {
  const imageStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [1.3, 1, 1.3],
      Extrapolate.CLAMP
    );
    const translateX = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [width * 0.4, 0, -width * 0.4],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ scale }, { translateX }],
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [60, 0, 60],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [0, 1, 0],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  const themeText = isDark ? 'text-white' : 'text-black';
  const themeTextMuted = isDark ? 'text-gray-300' : 'text-gray-600';
  const gradientColors: [string, string, string] = isDark 
    ? ['transparent', 'rgba(0,0,0,0.85)', '#000000']
    : ['transparent', 'rgba(255,255,255,0.85)', '#ffffff'];

  return (
    <View style={{ width, height: height * 0.72, overflow: 'hidden' }}>
      <Animated.Image 
        source={{ uri: item.image }} 
        style={[tw`w-full h-full absolute`, imageStyle]}
        resizeMode="cover"
      />
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[tw`absolute bottom-12 px-8 w-full`, textStyle]}>
        <Text style={tw`text-[42px] leading-[46px] font-black ${themeText} mb-4 tracking-tighter`}>{item.title}</Text>
        <Text style={tw`text-[15px] ${themeTextMuted} leading-6 font-medium`}>{item.subtitle}</Text>
      </Animated.View>
    </View>
  );
};

export default function OnboardingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<any>(null);
  
  const buttonScale = useSharedValue(1);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  // Theme adaptations
  const themeBg = isDark ? 'bg-black' : 'bg-white';
  const themeSkipText = isDark ? 'text-white' : 'text-black';
  const dotColorClass = isDark ? 'bg-white' : 'bg-black';

  const handleNext = () => {
    buttonScale.value = withSpring(0.9, { damping: 12, stiffness: 200 }, () => {
      buttonScale.value = withSpring(1);
    });
    
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      router.replace('/auth');
    }
  };

  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }]
    };
  });

  return (
    <SafeAreaView style={tw`flex-1 ${themeBg}`}>
      {/* Skip Button */}
      <View style={tw`absolute top-14 right-6 z-10`}>
        <TouchableOpacity onPress={() => router.replace('/auth')}>
          <Text style={tw`${themeSkipText} font-bold text-sm tracking-widest uppercase opacity-60`}>Skip</Text>
        </TouchableOpacity>
      </View>

      <AnimatedFlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item, index }: any) => (
          <Slide item={item} index={index} scrollX={scrollX} isDark={isDark} />
        )}
      />

      <View style={tw`px-8 pb-12 pt-4 ${themeBg} flex-row items-center justify-between`}>
        {/* Pagination Dots */}
        <View style={tw`flex-row items-center`}>
          {SLIDES.map((_, index) => {
            const animatedDotStyle = useAnimatedStyle(() => {
              const widthAnimation = interpolate(
                scrollX.value,
                [(index - 1) * width, index * width, (index + 1) * width],
                [8, 28, 8],
                Extrapolate.CLAMP
              );
              const opacityAnimation = interpolate(
                scrollX.value,
                [(index - 1) * width, index * width, (index + 1) * width],
                [0.2, 1, 0.2],
                Extrapolate.CLAMP
              );
              return {
                width: widthAnimation,
                opacity: opacityAnimation,
              };
            });
            return (
              <Animated.View
                key={index}
                style={[tw`h-2 rounded-full ${dotColorClass} mx-1`, animatedDotStyle]}
              />
            );
          })}
        </View>

        {/* Next / Get Started Button */}
        <Pressable onPress={handleNext}>
          <Animated.View style={buttonStyle}>
            {currentIndex === SLIDES.length - 1 ? (
              <LinearGradient
                colors={['#4E7661', '#3A5A4A', '#2D4438']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={tw`px-8 py-4 rounded-full shadow-lg shadow-green-950/30`}
              >
                <Text style={tw`text-white font-extrabold text-base tracking-wide`}>Get Started</Text>
              </LinearGradient>
            ) : (
              <View style={tw`${isDark ? 'bg-white' : 'bg-black'} px-10 py-4 rounded-full shadow-md`}>
                <Text style={tw`${isDark ? 'text-black' : 'text-white'} font-extrabold text-base tracking-wide`}>Next</Text>
              </View>
            )}
          </Animated.View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
