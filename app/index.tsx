import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  withSpring, 
  runOnJS 
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import tw from '@/lib/tailwind';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { useAuth } from '@/store/useAuth';

export default function CustomSplashScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const user = useAuth((s) => s.user);

  // Animation values
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.5);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // Hide the native splash screen immediately when the custom splash mounts
    SplashScreen.hideAsync().catch(() => {});

    // Logo entrance animation
    logoOpacity.value = withTiming(1, { duration: 700 });
    logoScale.value = withSpring(1.0, { damping: 12, stiffness: 80 });

    // Text elements entrance (slight delay for visual hierarchy)
    textOpacity.value = withDelay(450, withTiming(1, { duration: 600 }));
    textTranslateY.value = withDelay(450, withSpring(0, { damping: 14, stiffness: 70 }));

    // Smooth exit transition: fade out container and redirect
    containerOpacity.value = withDelay(
      2200,
      withTiming(0, { duration: 600 }, (finished) => {
        if (finished) {
          if (user) {
            runOnJS(router.replace)('/(tabs)');
          } else {
            runOnJS(router.replace)('/onboarding');
          }
        }
      })
    );
  }, [user]);

  const logoStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
      transform: [{ scale: logoScale.value }],
    };
  });

  const textStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
      transform: [{ translateY: textTranslateY.value }],
    };
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: containerOpacity.value,
    };
  });

  // Dynamic Theme Colors
  const bgClass = isDark ? 'bg-black' : 'bg-white';
  const logoBgClass = isDark ? 'bg-white' : 'bg-black';
  const logoTextClass = isDark ? 'text-black' : 'text-white';
  const titleClass = isDark ? 'text-white' : 'text-black';
  const subtitleClass = isDark ? 'text-gray-400' : 'text-gray-500';

  return (
    <Animated.View style={[tw`flex-1 ${bgClass} items-center justify-center`, containerStyle]}>
      <View style={tw`items-center`}>
        {/* Animated Brand Logo Icon */}
        <Animated.View style={[
          tw`w-24 h-24 ${logoBgClass} rounded-full items-center justify-center mb-6 shadow-2xl`,
          logoStyle
        ]}>
          <Text style={tw`text-4xl font-extrabold ${logoTextClass}`}>S</Text>
        </Animated.View>

        {/* Animated Brand Name & Subtitle */}
        <Animated.View style={[tw`items-center`, textStyle]}>
          <Text style={tw`text-4xl font-black ${titleClass} tracking-widest`}>Stylofy</Text>
          <Text style={tw`text-xs mt-2.5 tracking-widest font-semibold uppercase ${subtitleClass}`}>Premium Fashion</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}
