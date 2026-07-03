import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, 
  Platform, ScrollView, BackHandler 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import tw from '@/lib/tailwind';
import { Lock, User, ArrowLeft, Eye, EyeOff, Sparkles, Mail } from 'lucide-react-native';
import { useAuth } from '@/store/useAuth';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [isLogin, setIsLogin] = useState(true);
  
  // States
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Focus States
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  
  const login = useAuth((s) => s.login);

  useEffect(() => {
    const backAction = () => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [router]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleAuth = () => {
    if (!emailOrPhone || !password) return;
    // Call the login function from store
    login(emailOrPhone, isLogin ? undefined : name);
    router.replace('/(tabs)');
  };

  // Theme Constants
  const themeBg = isDark ? 'bg-[#0A0D0B]' : 'bg-[#F4F7F5]';
  const themeCard = isDark ? 'bg-[#131815]' : 'bg-white';
  const themeBorder = isDark ? 'border-[#222E28]' : 'border-[#D9E2DE]';
  const themeTextPrimary = isDark ? 'text-white' : 'text-gray-900';
  const themeTextMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const themeBrandColor = '#4E7661';
  
  const getInputStyle = (inputId: string) => {
    const isFocused = focusedInput === inputId;
    return [
      tw`flex-row items-center rounded-2xl px-4 py-1 border mb-5 shadow-sm`,
      {
        backgroundColor: isDark ? '#19201C' : '#F9FBF9',
        borderColor: isFocused ? themeBrandColor : (isDark ? '#222E28' : '#E5E7EB'),
        borderWidth: isFocused ? 1.5 : 1
      }
    ];
  };

  return (
    <View style={[tw`flex-1`, tw`${themeBg}`]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-1`}
      >
        <ScrollView 
          contentContainerStyle={[tw`flex-grow px-6 pb-10`, { paddingTop: Math.max(insets.top, 20) }]} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <TouchableOpacity 
            onPress={handleBack} 
            style={[tw`w-11 h-11 items-center justify-center rounded-full mb-8 border shadow-sm`, tw`${themeCard} ${themeBorder}`]}
          >
            <ArrowLeft size={20} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>

          <View style={tw`mb-10`}>
            <View style={tw`flex-row items-center mb-3`}>
              <Sparkles size={20} color={themeBrandColor} style={tw`mr-2`} />
              <Text style={[tw`text-sm font-bold tracking-widest uppercase`, { color: themeBrandColor }]}>
                Stylofy Premium
              </Text>
            </View>
            <Text style={[tw`text-4xl font-black mb-2 tracking-tight`, tw`${themeTextPrimary}`]}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </Text>
            <Text style={[tw`text-base`, tw`${themeTextMuted}`]}>
              {isLogin ? 'Sign in to access your saved items and premium features.' : 'Join Stylofy to discover premium fashion collections.'}
            </Text>
          </View>

          {/* Form Card */}
          <View style={[tw`p-6 rounded-3xl border shadow-sm mb-8`, tw`${themeCard} ${themeBorder}`]}>
            
            {!isLogin && (
              <>
                <Text style={tw`text-xs font-bold tracking-widest text-gray-500 mb-2 ml-1`}>FULL NAME</Text>
                <View style={getInputStyle('name')}>
                  <User size={18} color={focusedInput === 'name' ? themeBrandColor : "#9ca3af"} style={tw`mr-3`} />
                  <TextInput 
                    placeholder="Your Full Name"
                    placeholderTextColor="#9ca3af"
                    value={name}
                    onChangeText={setName}
                    onFocus={() => setFocusedInput('name')}
                    onBlur={() => setFocusedInput(null)}
                    autoComplete="name"
                    textContentType="name"
                    importantForAutofill="yes"
                    style={[tw`flex-1 text-base py-3.5 px-0 ${themeTextPrimary}`, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                  />
                </View>
              </>
            )}

            <Text style={tw`text-xs font-bold tracking-widest text-gray-500 mb-2 ml-1`}>EMAIL OR PHONE NUMBER</Text>
            <View style={getInputStyle('emailPhone')}>
              <Mail size={18} color={focusedInput === 'emailPhone' ? themeBrandColor : "#9ca3af"} style={tw`mr-3`} />
              <TextInput 
                placeholder="Email or Phone Number"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="username"
                textContentType="username"
                importantForAutofill="yes"
                value={emailOrPhone}
                onChangeText={setEmailOrPhone}
                onFocus={() => setFocusedInput('emailPhone')}
                onBlur={() => setFocusedInput(null)}
                style={[tw`flex-1 text-base py-3.5 px-0 ${themeTextPrimary}`, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
              />
            </View>

            <Text style={tw`text-xs font-bold tracking-widest text-gray-500 mb-2 ml-1`}>PASSWORD</Text>
            <View style={getInputStyle('password')}>
              <Lock size={18} color={focusedInput === 'password' ? themeBrandColor : "#9ca3af"} style={tw`mr-3`} />
              <TextInput 
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
                autoComplete={isLogin ? "current-password" : "new-password"}
                textContentType={isLogin ? "password" : "newPassword"}
                importantForAutofill="yes"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                style={[tw`flex-1 text-base py-3.5 px-0 ${themeTextPrimary}`, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={tw`ml-2 p-1`}>
                {showPassword ? (
                  <EyeOff size={20} color={focusedInput === 'password' ? themeBrandColor : "#9ca3af"} />
                ) : (
                  <Eye size={20} color="#9ca3af" />
                )}
              </TouchableOpacity>
            </View>

            {isLogin && (
              <TouchableOpacity style={tw`items-end mt-1 mb-1`}>
                <Text style={[tw`font-bold text-sm`, { color: themeBrandColor }]}>Forgot Password?</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Action Button */}
          <TouchableOpacity 
            style={[
              tw`w-full py-4 rounded-2xl items-center shadow-lg mb-8 flex-row justify-center`, 
              { backgroundColor: !emailOrPhone || !password ? (isDark ? '#2A3630' : '#A7BDB0') : themeBrandColor }
            ]}
            onPress={handleAuth}
            disabled={!emailOrPhone || !password}
          >
            <Text style={tw`text-white font-bold text-lg mr-2 tracking-wide`}>
              {isLogin ? 'Sign In' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          {/* Toggle */}
          <View style={tw`flex-row justify-center mt-auto`}>
            <Text style={tw`mr-2 ${themeTextMuted} font-medium`}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={[tw`font-black`, { color: themeBrandColor }]}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
