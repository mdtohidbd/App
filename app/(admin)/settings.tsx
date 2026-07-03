import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, Animated, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import tw from '@/lib/tailwind';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/store/useAuth';
import * as ImagePicker from 'expo-image-picker';
import { LogOut, ChevronRight, User, Settings as SettingsIcon, Bell, Shield, Store, Truck, X, Check, Camera, CheckCircle2 } from 'lucide-react-native';

export default function AdminSettings() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const updateUser = useAuth((s) => s.updateUser);

  const themeBrandColor = '#8E3200'; // Batik Terracotta
  const themeBg = isDark ? 'bg-[#191514]' : 'bg-[#FAF7F2]';
  const themeCard = isDark ? 'bg-[#261E1D]' : 'bg-white';
  const themeText = isDark ? 'text-[#EFEBE9]' : 'text-[#3E2723]';
  const themeTextMuted = isDark ? 'text-[#A1887F]' : 'text-[#8D6E63]';
  const themeBorder = isDark ? 'border-[#3E2723]' : 'border-[#EFEBE9]';
  const themeInput = isDark ? 'bg-[#3E2723] text-[#EFEBE9] border-[#3E2723]' : 'bg-[#F5F0E6] text-[#3E2723] border-[#EFEBE9]';

  // Modal States
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Profile Edit State
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [tempAvatar, setTempAvatar] = useState(user?.avatar || '');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Store Details State
  const [storeName, setStoreName] = useState('Stylofy Shop');
  const [storeEmail, setStoreEmail] = useState('support@stylofy.com');
  const [storeCurrency, setStoreCurrency] = useState('USD ($)');

  // Toggles State
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [stockAlerts, setStockAlerts] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(isDark);

  // Toast State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowToast(false));
      }, 2000);
    });
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/auth');
        }
      }
    ]);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setTempAvatar(result.assets[0].uri);
    }
  };

  const saveProfile = () => {
    if (editName && editEmail) {
      updateUser(editName, editEmail, tempAvatar);
      setActiveModal(null);
      triggerToast('Profile updated successfully!');
    } else {
      Alert.alert('Error', 'Name and Email are required.');
    }
  };

  const savePassword = () => {
    if (currentPassword && newPassword) {
      setCurrentPassword('');
      setNewPassword('');
      setActiveModal(null);
      triggerToast('Password changed successfully!');
    } else {
      Alert.alert('Error', 'Please fill all fields.');
    }
  };

  const saveStoreSettings = () => {
    setActiveModal(null);
    triggerToast('Store settings updated!');
  };

  const SettingItem = ({ icon: Icon, title, isDestructive = false, onPress }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      style={[tw`flex-row items-center p-4 rounded-xl mb-3 shadow-sm border`, tw`${themeCard} ${themeBorder}`]}
    >
      <View style={[tw`w-10 h-10 rounded-full items-center justify-center mr-4`, { backgroundColor: isDestructive ? '#ef444420' : `${themeBrandColor}15` }]}>
        <Icon size={20} color={isDestructive ? '#ef4444' : themeBrandColor} />
      </View>
      <Text style={[tw`flex-1 text-base font-medium`, isDestructive ? tw`text-red-500` : tw`${themeText}`]}>
        {title}
      </Text>
      {!isDestructive && <ChevronRight size={20} color={isDark ? '#4b5563' : '#9ca3af'} />}
    </TouchableOpacity>
  );

  return (
    <View style={[tw`flex-1`, tw`${themeBg}`]}>
      <View style={[tw`px-6 pb-4 border-b`, tw`${themeBorder}`, { paddingTop: Math.max(insets.top, 20) }]}>
        <Text style={[tw`text-3xl font-extrabold mt-2`, tw`${themeText}`]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={tw`p-6 pb-24`} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={[tw`p-5 rounded-3xl mb-8 shadow-sm items-center border`, tw`${themeCard} ${themeBorder}`]}>
          <Image 
            source={{ uri: user?.avatar || 'https://api.dicebear.com/7.x/avataaars/png?seed=admin' }} 
            style={tw`w-24 h-24 rounded-full mb-4 bg-gray-100 border-4 border-[#4E7661]/20`}
          />
          <Text style={[tw`text-xl font-black mb-1`, tw`${themeText}`]}>{user?.name || 'Administrator'}</Text>
          <Text style={[tw`text-sm`, tw`${themeTextMuted}`]}>{user?.email || 'admin@stylofy.com'}</Text>
          <View style={tw`bg-[#4E7661]/10 px-4 py-1.5 rounded-full mt-4 border border-[#4E7661]/20`}>
            <Text style={tw`text-[#4E7661] text-xs font-bold uppercase tracking-wider`}>Super Admin</Text>
          </View>
        </View>

        <Text style={[tw`text-xs font-black uppercase tracking-widest mb-3 ml-2`, tw`${themeTextMuted}`]}>Account</Text>
        <SettingItem icon={User} title="Personal Information" onPress={() => setActiveModal('profile')} />
        <SettingItem icon={Shield} title="Security & Passwords" onPress={() => setActiveModal('security')} />
        
        <Text style={[tw`text-xs font-black uppercase tracking-widest mb-3 ml-2 mt-6`, tw`${themeTextMuted}`]}>Store</Text>
        <SettingItem icon={Store} title="Store Details" onPress={() => setActiveModal('store')} />
        <SettingItem icon={Truck} title="Delivery & Shipping" onPress={() => triggerToast('Shipping synced with API.')} />

        <Text style={[tw`text-xs font-black uppercase tracking-widest mb-3 ml-2 mt-6`, tw`${themeTextMuted}`]}>Preferences</Text>
        <SettingItem icon={Bell} title="Notifications" onPress={() => setActiveModal('notifications')} />
        <SettingItem icon={SettingsIcon} title="App Settings" onPress={() => setActiveModal('appSettings')} />

        <View style={tw`mt-8 mb-4`}>
          <SettingItem icon={LogOut} title="Log Out" isDestructive onPress={handleLogout} />
        </View>
      </ScrollView>

      {/* Toast Notification */}
      {showToast && (
        <Animated.View style={[tw`absolute bottom-20 inset-x-5 bg-black dark:bg-white rounded-2xl p-4 flex-row items-center shadow-lg z-50`, { opacity: fadeAnim }]}>
          <View style={tw`bg-green-500 rounded-full p-1 mr-3`}>
            <CheckCircle2 size={16} color="#fff" />
          </View>
          <Text style={tw`text-white dark:text-black font-medium`}>{toastMessage}</Text>
        </Animated.View>
      )}

      {/* Profile Modal */}
      <Modal visible={activeModal === 'profile'} animationType="slide" presentationStyle="formSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[tw`flex-1`, tw`${themeBg}`]}>
          <View style={[tw`px-6 py-4 flex-row justify-between items-center border-b`, tw`${themeBorder}`]}>
            <TouchableOpacity onPress={() => setActiveModal(null)} style={tw`p-2 -ml-2`}>
              <X size={24} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
            <Text style={[tw`text-lg font-bold`, tw`${themeText}`]}>Edit Profile</Text>
            <TouchableOpacity onPress={saveProfile} style={tw`p-2 -mr-2`}>
              <Check size={24} color={themeBrandColor} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={tw`p-6`}>
            <View style={tw`items-center mb-8`}>
              <TouchableOpacity onPress={pickImage} style={tw`relative`}>
                <Image source={{ uri: tempAvatar || 'https://via.placeholder.com/150' }} style={tw`w-28 h-28 rounded-full border-4 border-[#4E7661]/20`} />
                <View style={tw`absolute bottom-0 right-0 bg-[#4E7661] p-2 rounded-full shadow-lg border-2 border-white dark:border-[#131815]`}>
                  <Camera size={16} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>
            <Text style={[tw`text-sm font-bold mb-2 ml-1`, tw`${themeTextMuted}`]}>Full Name</Text>
            <TextInput style={[tw`p-4 rounded-xl mb-4 border`, tw`${themeInput}`]} value={editName} onChangeText={setEditName} />
            <Text style={[tw`text-sm font-bold mb-2 ml-1`, tw`${themeTextMuted}`]}>Email Address</Text>
            <TextInput style={[tw`p-4 rounded-xl mb-4 border`, tw`${themeInput}`]} value={editEmail} onChangeText={setEditEmail} keyboardType="email-address" autoCapitalize="none" />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Security Modal */}
      <Modal visible={activeModal === 'security'} animationType="slide" presentationStyle="formSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[tw`flex-1`, tw`${themeBg}`]}>
          <View style={[tw`px-6 py-4 flex-row justify-between items-center border-b`, tw`${themeBorder}`]}>
            <TouchableOpacity onPress={() => setActiveModal(null)} style={tw`p-2 -ml-2`}>
              <X size={24} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
            <Text style={[tw`text-lg font-bold`, tw`${themeText}`]}>Change Password</Text>
            <TouchableOpacity onPress={savePassword} style={tw`p-2 -mr-2`}>
              <Check size={24} color={themeBrandColor} />
            </TouchableOpacity>
          </View>
          <View style={tw`p-6`}>
            <Text style={[tw`text-sm font-bold mb-2 ml-1`, tw`${themeTextMuted}`]}>Current Password</Text>
            <TextInput style={[tw`p-4 rounded-xl mb-4 border`, tw`${themeInput}`]} value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
            <Text style={[tw`text-sm font-bold mb-2 ml-1`, tw`${themeTextMuted}`]}>New Password</Text>
            <TextInput style={[tw`p-4 rounded-xl mb-4 border`, tw`${themeInput}`]} value={newPassword} onChangeText={setNewPassword} secureTextEntry />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Store Modal */}
      <Modal visible={activeModal === 'store'} animationType="slide" presentationStyle="formSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[tw`flex-1`, tw`${themeBg}`]}>
          <View style={[tw`px-6 py-4 flex-row justify-between items-center border-b`, tw`${themeBorder}`]}>
            <TouchableOpacity onPress={() => setActiveModal(null)} style={tw`p-2 -ml-2`}>
              <X size={24} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
            <Text style={[tw`text-lg font-bold`, tw`${themeText}`]}>Store Details</Text>
            <TouchableOpacity onPress={saveStoreSettings} style={tw`p-2 -mr-2`}>
              <Check size={24} color={themeBrandColor} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={tw`p-6`}>
            <Text style={[tw`text-sm font-bold mb-2 ml-1`, tw`${themeTextMuted}`]}>Store Name</Text>
            <TextInput style={[tw`p-4 rounded-xl mb-4 border`, tw`${themeInput}`]} value={storeName} onChangeText={setStoreName} />
            <Text style={[tw`text-sm font-bold mb-2 ml-1`, tw`${themeTextMuted}`]}>Support Email</Text>
            <TextInput style={[tw`p-4 rounded-xl mb-4 border`, tw`${themeInput}`]} value={storeEmail} onChangeText={setStoreEmail} keyboardType="email-address" />
            <Text style={[tw`text-sm font-bold mb-2 ml-1`, tw`${themeTextMuted}`]}>Base Currency</Text>
            <TextInput style={[tw`p-4 rounded-xl mb-4 border`, tw`${themeInput}`]} value={storeCurrency} onChangeText={setStoreCurrency} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Notifications Modal */}
      <Modal visible={activeModal === 'notifications'} animationType="slide" presentationStyle="formSheet">
        <View style={[tw`flex-1`, tw`${themeBg}`]}>
          <View style={[tw`px-6 py-4 flex-row justify-between items-center border-b`, tw`${themeBorder}`]}>
            <TouchableOpacity onPress={() => setActiveModal(null)} style={tw`p-2 -ml-2`}>
              <X size={24} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
            <Text style={[tw`text-lg font-bold`, tw`${themeText}`]}>Alerts & Notifications</Text>
            <View style={tw`w-10`} />
          </View>
          <View style={tw`p-6`}>
            <View style={[tw`flex-row justify-between items-center p-4 rounded-xl mb-4 border`, tw`${themeCard} ${themeBorder}`]}>
              <View>
                <Text style={[tw`text-base font-bold`, tw`${themeText}`]}>New Order Alerts</Text>
                <Text style={[tw`text-xs mt-1`, tw`${themeTextMuted}`]}>Push notification on new orders</Text>
              </View>
              <Switch value={orderAlerts} onValueChange={setOrderAlerts} trackColor={{ true: themeBrandColor, false: '#d1d5db' }} />
            </View>
            <View style={[tw`flex-row justify-between items-center p-4 rounded-xl border`, tw`${themeCard} ${themeBorder}`]}>
              <View>
                <Text style={[tw`text-base font-bold`, tw`${themeText}`]}>Low Stock Alerts</Text>
                <Text style={[tw`text-xs mt-1`, tw`${themeTextMuted}`]}>Notify when items are running out</Text>
              </View>
              <Switch value={stockAlerts} onValueChange={setStockAlerts} trackColor={{ true: themeBrandColor, false: '#d1d5db' }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* App Settings Modal */}
      <Modal visible={activeModal === 'appSettings'} animationType="slide" presentationStyle="formSheet">
        <View style={[tw`flex-1`, tw`${themeBg}`]}>
          <View style={[tw`px-6 py-4 flex-row justify-between items-center border-b`, tw`${themeBorder}`]}>
            <TouchableOpacity onPress={() => setActiveModal(null)} style={tw`p-2 -ml-2`}>
              <X size={24} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
            <Text style={[tw`text-lg font-bold`, tw`${themeText}`]}>App Settings</Text>
            <View style={tw`w-10`} />
          </View>
          <View style={tw`p-6`}>
            <View style={[tw`flex-row justify-between items-center p-4 rounded-xl mb-4 border`, tw`${themeCard} ${themeBorder}`]}>
              <View>
                <Text style={[tw`text-base font-bold`, tw`${themeText}`]}>Dark Mode</Text>
                <Text style={[tw`text-xs mt-1`, tw`${themeTextMuted}`]}>Follows system settings</Text>
              </View>
              <Switch value={darkModeEnabled} onValueChange={setDarkModeEnabled} disabled trackColor={{ true: themeBrandColor, false: '#d1d5db' }} />
            </View>
            <Text style={[tw`text-xs text-center mt-4`, tw`${themeTextMuted}`]}>App version 1.0.0 (Admin Build)</Text>
          </View>
        </View>
      </Modal>

    </View>
  );
}
