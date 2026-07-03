import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, 
  Image, Switch, Platform, Modal, TextInput, Alert, Animated 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import tw from '@/lib/tailwind';
import { 
  Settings, ShoppingBag, CreditCard, MapPin, Bell, 
  LogOut, LogIn, ChevronRight, Moon, Heart, HelpCircle, 
  Edit3, Camera, User, Mail, Sparkles, CheckCircle2 
} from 'lucide-react-native';
import { useAuth } from '@/store/useAuth';
import * as ImagePicker from 'expo-image-picker';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ACCOUNT_ITEMS = [
  { id: 'orders', title: 'My Orders', icon: ShoppingBag, subtitle: 'Track or return your orders' },
  { id: 'wishlist', title: 'Wishlist', icon: Heart, subtitle: 'Your saved items' },
  { id: 'shipping', title: 'Shipping Addresses', icon: MapPin, subtitle: 'Manage delivery locations' },
  { id: 'payment', title: 'Payment Methods', icon: CreditCard, subtitle: 'Visa, bKash, Nagad' },
];

const PREFERENCES_ITEMS = [
  { id: 'notifications', title: 'Notifications', icon: Bell, subtitle: 'Manage alerts and emails' },
  { id: 'settings', title: 'Security', icon: Settings, subtitle: 'Password, FaceID' },
];

const SUPPORT_ITEMS = [
  { id: 'help', title: 'Help Center', icon: HelpCircle, subtitle: 'FAQ and customer support' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [isDarkMode, setIsDarkMode] = useState(isDark);
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const updateUser = useAuth((s) => s.updateUser);

  // Edit Profile States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [tempAvatar, setTempAvatar] = useState('');

  // Toast notifications state
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  // Sync isDarkMode with system colorScheme if it changes
  useEffect(() => {
    setIsDarkMode(isDark);
  }, [isDark]);

  // Toast animation handler
  useEffect(() => {
    if (showToast) {
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => setShowToast(false));
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showToast, toastOpacity]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
  };

  const handleLogout = () => {
    logout();
    router.replace('/auth');
  };

  const openEditProfile = () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    setEditName(user.name);
    setEditEmail(user.email);
    setTempAvatar(user.avatar);
    setShowEditModal(true);
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to change your avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setTempAvatar(result.assets[0].uri);
      }
    } catch (err) {
      console.warn("Image picking error:", err);
      Alert.alert("Error", "Failed to open photo library.");
    }
  };

  const handleGenerateRandomAvatar = () => {
    const randomSeed = Math.floor(Math.random() * 100000).toString();
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${randomSeed}&backgroundColor=b6e3f4`;
    setTempAvatar(avatarUrl);
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      Alert.alert("Name Required", "Please enter your name.");
      return;
    }
    if (!editEmail.trim() || !editEmail.includes('@')) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    updateUser(editName.trim(), editEmail.trim(), tempAvatar);
    setShowEditModal(false);
    triggerToast("Profile updated successfully!");
  };

  // UI Theme styling colors
  const themeBg = isDark ? 'bg-[#0A0D0B]' : 'bg-[#F4F7F5]';
  const themeCard = isDark ? 'bg-[#131815]' : 'bg-white';
  const themeBorder = isDark ? 'border-[#222E28]' : 'border-[#D9E2DE]';
  const themeTextPrimary = isDark ? 'text-white' : 'text-gray-900';
  const themeTextMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const themeBrandColor = '#4E7661'; // Blushify Sage Green
  const themeCardHex = isDark ? '#131815' : '#FFFFFF';
  const themeBorderHex = isDark ? '#222E28' : '#D9E2DE';

  const renderSection = (title: string, items: any[]) => (
    <View style={tw`mb-6`}>
      <Text style={tw`text-gray-500 dark:text-gray-400 font-bold tracking-wider text-xs uppercase mb-3 ml-2`}>{title}</Text>
      <View style={[tw`rounded-3xl overflow-hidden border shadow-sm`, tw`${themeCard} ${themeBorder}`]}>
        {items.map((item, index) => (
          <TouchableOpacity 
            key={item.id}
            onPress={() => {
              if (item.id === 'wishlist') {
                router.push('/wishlist');
              } else {
                router.push(`/${item.id}` as any);
              }
            }}
            style={[tw`flex-row items-center justify-between p-4`, index !== items.length - 1 ? tw`border-b border-gray-50 dark:border-gray-800/50` : {}]}
          >
            <View style={tw`flex-row items-center`}>
              <View style={[tw`w-11 h-11 rounded-full items-center justify-center mr-4 border`, tw`${themeCard} ${themeBorder}`]}>
                <item.icon size={20} color={isDark ? '#fff' : '#000'} />
              </View>
              <View>
                <Text style={tw`text-base font-bold mb-0.5 ${themeTextPrimary}`}>{item.title}</Text>
                <Text style={tw`text-xs ${themeTextMuted}`}>{item.subtitle}</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[tw`flex-1`, tw`${themeBg}`]}>
      {/* Toast Alert overlay */}
      {showToast && (
        <Animated.View 
          style={[
            tw`absolute left-5 right-5 bg-black/95 dark:bg-white/98 py-3.5 px-5 rounded-2xl flex-row items-center justify-between z-50 shadow-xl border border-white/10 dark:border-black/5`,
            { top: Platform.OS === 'android' ? 48 : 24, opacity: toastOpacity }
          ]}
        >
          <View style={tw`flex-row items-center`}>
            <CheckCircle2 size={16} color={isDark ? '#000' : '#22c55e'} style={tw`mr-2.5`} />
            <Text style={tw`text-sm font-bold text-white dark:text-black`}>{toastMessage}</Text>
          </View>
        </Animated.View>
      )}

      {/* contentContainerStyle paddingBottom ensures the content is not hidden by the absolute Tab Bar */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 140 : 120 }}
      >
        
        {/* Header Profile Section */}
        <View style={[tw`px-5 pb-6`, { paddingTop: Math.max(insets.top, 32) }]}>
          <Text style={[tw`text-3xl font-black mb-8`, tw`${themeTextPrimary}`]}>Profile</Text>
          
          <View style={[tw`flex-row items-center p-5 rounded-3xl border shadow-sm`, tw`${themeCard} ${themeBorder}`]}>
            <View style={tw`relative`}>
              <Image 
                source={{ uri: user?.avatar || 'https://i.pravatar.cc/150?img=68' }} 
                style={[tw`w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-800 border-2`, tw`${themeBorder}`]}
              />
              <TouchableOpacity 
                onPress={openEditProfile}
                style={[tw`absolute bottom-0 right-0 bg-black dark:bg-white p-2 rounded-full border-2 border-white dark:border-gray-900 shadow-sm`]}
              >
                <Edit3 size={12} color={isDark ? '#000' : '#fff'} />
              </TouchableOpacity>
            </View>
            <View style={tw`ml-5 flex-1`}>
              <Text style={tw`text-xl font-bold mb-1 ${themeTextPrimary}`}>{user?.name || 'Guest User'}</Text>
              <Text style={tw`text-sm mb-2.5 ${themeTextMuted}`}>{user?.email || 'guest@example.com'}</Text>
              <View style={tw`flex-row gap-x-2`}>
                <View style={tw`bg-black dark:bg-white/10 self-start px-3 py-1 rounded-full`}>
                  <Text style={tw`text-white dark:text-gray-200 text-xs font-bold tracking-wider`}>PREMIUM</Text>
                </View>
                {user && (
                  <TouchableOpacity 
                    onPress={openEditProfile}
                    style={tw`border border-[#4E7661]/30 bg-[#4E7661]/10 px-3 py-1 rounded-full`}
                  >
                    <Text style={[tw`text-xs font-bold`, { color: themeBrandColor }]}>Edit Info</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Sections */}
        <View style={tw`px-5`}>
          
          {/* App Settings Section */}
          <View style={tw`mb-6`}>
            <Text style={tw`text-gray-500 dark:text-gray-400 font-bold tracking-wider text-xs uppercase mb-3 ml-2`}>App Settings</Text>
            <View style={[tw`rounded-3xl overflow-hidden border shadow-sm`, tw`${themeCard} ${themeBorder}`]}>
              <View style={tw`flex-row items-center justify-between p-4`}>
                <View style={tw`flex-row items-center`}>
                  <View style={[tw`w-11 h-11 rounded-full items-center justify-center mr-4 border`, tw`${themeCard} ${themeBorder}`]}>
                    <Moon size={20} color={isDark ? '#fff' : '#000'} />
                  </View>
                  <View>
                    <Text style={tw`text-base font-bold mb-0.5 ${themeTextPrimary}`}>Dark Mode</Text>
                    <Text style={tw`text-xs ${themeTextMuted}`}>Toggle application theme</Text>
                  </View>
                </View>
                <Switch
                  trackColor={{ false: '#e5e7eb', true: themeBrandColor }}
                  thumbColor={'#fff'}
                  ios_backgroundColor="#e5e7eb"
                  onValueChange={setIsDarkMode}
                  value={isDarkMode}
                />
              </View>
            </View>
          </View>

          {renderSection('My Account', ACCOUNT_ITEMS)}
          {renderSection('Preferences', PREFERENCES_ITEMS)}
          {renderSection('Support', SUPPORT_ITEMS)}

          {/* Logout / Login Button */}
          {user ? (
            <TouchableOpacity 
              style={[tw`flex-row items-center justify-center py-4 rounded-2xl border mt-2 mb-4 shadow-sm`, { backgroundColor: themeCardHex, borderColor: '#ef444430' }]}
              onPress={handleLogout}
            >
              <LogOut size={20} color="#ef4444" style={tw`mr-2`} />
              <Text style={tw`text-base font-bold text-red-500`}>Log Out</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[tw`flex-row items-center justify-center py-4 rounded-2xl mt-2 mb-4 shadow-sm`, { backgroundColor: themeBrandColor }]}
              onPress={() => router.push('/auth')}
            >
              <LogIn size={20} color="#fff" style={tw`mr-2`} />
              <Text style={tw`text-base font-bold text-white`}>Sign In</Text>
            </TouchableOpacity>
          )}
          
        </View>
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={tw`flex-1 bg-black/60 justify-end`}>
          <TouchableOpacity 
            style={tw`flex-1`}
            activeOpacity={1}
            onPress={() => setShowEditModal(false)}
          />
          
          <View style={[
            tw`rounded-t-[32px] p-6 pb-12 border-t`,
            { 
              backgroundColor: themeCardHex, 
              borderColor: themeBorderHex,
              maxHeight: '90%'
            }
          ]}>
            
            {/* Modal Header */}
            <View style={tw`flex-row justify-between items-center mb-6`}>
              <Text style={[tw`text-2xl font-black`, tw`${themeTextPrimary}`]}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)} style={tw`py-1 px-3 rounded-full bg-gray-100 dark:bg-gray-800`}>
                <Text style={tw`text-xs font-bold text-gray-500 dark:text-gray-400`}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-6`}>
              {/* Avatar Selector Section */}
              <View style={tw`items-center mb-8`}>
                <View style={tw`relative`}>
                  <Image 
                    source={{ uri: tempAvatar || 'https://i.pravatar.cc/150?img=68' }}
                    style={tw`w-28 h-28 rounded-full bg-gray-200 dark:bg-gray-800 border-4 border-[#4E7661]/25`}
                  />
                  <TouchableOpacity 
                    onPress={handlePickImage}
                    style={[tw`absolute bottom-0 right-0 p-2.5 rounded-full border-2 border-white dark:border-gray-900 shadow-lg`, { backgroundColor: themeBrandColor }]}
                  >
                    <Camera size={16} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* Avatar quick options */}
                <View style={tw`flex-row gap-x-2 mt-4`}>
                  <TouchableOpacity 
                    onPress={handlePickImage}
                    style={tw`flex-row items-center border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-xl`}
                  >
                    <Text style={[tw`text-xs font-bold ${themeTextPrimary}`]}>Choose Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={handleGenerateRandomAvatar}
                    style={tw`flex-row items-center border border-[#4E7661]/30 bg-[#4E7661]/5 px-4 py-2 rounded-xl`}
                  >
                    <Sparkles size={12} color={themeBrandColor} style={tw`mr-1.5`} />
                    <Text style={[tw`text-xs font-bold`, { color: themeBrandColor }]}>Random Avatar</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Name Input */}
              <Text style={tw`text-xs font-bold tracking-widest text-gray-500 mb-2 ml-1`}>FULL NAME</Text>
              <View style={[
                tw`flex-row items-center border rounded-2xl px-4 py-1.5 mb-6`,
                {
                  backgroundColor: isDark ? '#19201C' : '#F9FBF9',
                  borderColor: themeBorderHex
                }
              ]}>
                <User size={18} color="#9ca3af" style={tw`mr-3`} />
                <TextInput
                  placeholder="Your Name"
                  placeholderTextColor="#6b7280"
                  value={editName}
                  onChangeText={setEditName}
                  style={[tw`flex-1 text-base py-3 px-0 ${themeTextPrimary}`, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                />
              </View>

              {/* Email Input */}
              <Text style={tw`text-xs font-bold tracking-widest text-gray-500 mb-2 ml-1`}>EMAIL ADDRESS</Text>
              <View style={[
                tw`flex-row items-center border rounded-2xl px-4 py-1.5 mb-8`,
                {
                  backgroundColor: isDark ? '#19201C' : '#F9FBF9',
                  borderColor: themeBorderHex
                }
              ]}>
                <Mail size={18} color="#9ca3af" style={tw`mr-3`} />
                <TextInput
                  placeholder="Your Email"
                  placeholderTextColor="#6b7280"
                  value={editEmail}
                  onChangeText={setEditEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[tw`flex-1 text-base py-3 px-0 ${themeTextPrimary}`, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                />
              </View>

              {/* Submit Buttons */}
              <View style={tw`flex-row gap-x-3`}>
                <TouchableOpacity
                  onPress={() => setShowEditModal(false)}
                  style={[tw`flex-1 py-4 border rounded-2xl items-center justify-center`, { borderColor: themeBorderHex }]}
                >
                  <Text style={tw`font-bold text-base ${themeTextPrimary}`}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleSaveProfile}
                  style={[tw`flex-1 py-4 rounded-2xl items-center justify-center shadow-lg`, { backgroundColor: themeBrandColor }]}
                >
                  <Text style={tw`text-white font-bold text-base`}>Save Changes</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}

