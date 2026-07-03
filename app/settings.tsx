import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, SafeAreaView, TouchableOpacity, ScrollView, 
  TextInput, Switch, Alert, Platform, Animated 
} from 'react-native';
import { useRouter } from 'expo-router';
import tw from '@/lib/tailwind';
import { 
  ArrowLeft, Lock, Smartphone, Fingerprint, 
  Trash2, ShieldCheck, CheckCircle2, Laptop 
} from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SecurityScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Toggle states
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Toast notification overlay
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showToast) {
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
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

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Weak Password", "New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Mismatch", "New password and confirmation do not match.");
      return;
    }

    // Success simulation
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    triggerToast("Password changed successfully!");
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account Permanently",
      "Are you absolutely sure you want to delete your account? This action cannot be undone and you will lose all order history.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete Account", 
          style: "destructive",
          onPress: () => {
            Alert.alert("Account Deleted", "Your account has been deleted successfully.");
            router.replace('/auth');
          }
        }
      ]
    );
  };

  // UI Theme styling configurations
  const themeBgHex = isDark ? '#0A0D0B' : '#F4F7F5';
  const themeCardHex = isDark ? '#131815' : '#FFFFFF';
  const themeBorderHex = isDark ? '#222E28' : '#D9E2DE';
  const themeTextPrimary = isDark ? 'text-white' : 'text-gray-900';
  const themeTextMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const themeBrandColor = '#4E7661'; // Blushify Sage Green

  const renderInput = (
    placeholder: string,
    value: string,
    onChangeText: (t: string) => void,
    fieldKey: string
  ) => {
    const isFocused = focusedField === fieldKey;
    return (
      <View style={[
        tw`flex-row items-center border rounded-2xl px-4 py-1`,
        {
          backgroundColor: isDark ? '#19201C' : '#F9FBF9',
          borderColor: isFocused ? themeBrandColor : themeBorderHex,
          borderWidth: isFocused ? 1.5 : 1
        }
      ]}>
        <View style={tw`mr-3 opacity-70`}>
          <Lock size={18} color={isFocused ? themeBrandColor : '#9ca3af'} />
        </View>
        <TextInput 
          placeholder={placeholder} 
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={true}
          placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
          style={[
            tw`flex-1 text-base py-3.5 px-0`,
            tw`${themeTextPrimary}`,
            Platform.OS === 'web' && { outlineStyle: 'none' } as any
          ]} 
          onFocus={() => setFocusedField(fieldKey)}
          onBlur={() => setFocusedField(null)}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: themeBgHex }]}>
      {/* Toast Overlay */}
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

      {/* Header */}
      <View style={[
        tw`flex-row items-center px-5 pb-4 border-b`,
        { backgroundColor: themeCardHex, borderColor: themeBorderHex },
        { paddingTop: Platform.OS === 'android' ? 32 : 12 }
      ]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={[tw`h-10 w-10 rounded-full items-center justify-center border mr-3`, { backgroundColor: themeCardHex, borderColor: themeBorderHex }]}
        >
          <ArrowLeft size={20} style={tw`${themeTextPrimary}`} />
        </TouchableOpacity>
        <Text style={[tw`text-2xl font-black`, tw`${themeTextPrimary}`]}>Security Settings</Text>
      </View>

      <ScrollView contentContainerStyle={tw`p-5 pb-24`} showsVerticalScrollIndicator={false}>
        
        {/* Verification Status Card */}
        <View style={[
          tw`rounded-3xl p-5 border mb-6 flex-row items-center`,
          { backgroundColor: themeCardHex, borderColor: themeBorderHex }
        ]}>
          <View style={[tw`w-12 h-12 rounded-full items-center justify-center mr-4`, { backgroundColor: '#4E766115' }]}>
            <ShieldCheck size={24} color={themeBrandColor} />
          </View>
          <View style={tw`flex-1`}>
            <Text style={[tw`text-base font-bold`, tw`${themeTextPrimary}`]}>Account Secure</Text>
            <Text style={[tw`text-xs`, tw`${themeTextMuted}`]}>FaceID & 2FA details are configured.</Text>
          </View>
        </View>

        {/* Biometrics & MFA Preferences */}
        <Text style={tw`text-xs font-bold tracking-widest text-gray-500 mb-3 ml-2 uppercase`}>Authentication</Text>
        <View style={[
          tw`rounded-3xl overflow-hidden border mb-6 shadow-sm`,
          { backgroundColor: themeCardHex, borderColor: themeBorderHex }
        ]}>
          {/* FaceID Toggle */}
          <View style={tw`flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800/50`}>
            <View style={tw`flex-row items-center`}>
              <View style={[tw`w-10 h-10 rounded-full items-center justify-center mr-3 border`, { borderColor: themeBorderHex }]}>
                <Fingerprint size={18} style={tw`${themeTextPrimary}`} />
              </View>
              <View>
                <Text style={[tw`text-sm font-bold`, tw`${themeTextPrimary}`]}>Biometric Sign-In</Text>
                <Text style={tw`text-[11px] text-gray-400`}>Login using FaceID or Fingerprint</Text>
              </View>
            </View>
            <Switch 
              trackColor={{ false: '#e5e7eb', true: themeBrandColor }}
              thumbColor={'#fff'}
              onValueChange={(val) => {
                setFaceIdEnabled(val);
                triggerToast(val ? "FaceID Login enabled" : "FaceID Login disabled");
              }}
              value={faceIdEnabled}
            />
          </View>

          {/* Two-Factor Toggle */}
          <View style={tw`flex-row items-center justify-between p-4`}>
            <View style={tw`flex-row items-center`}>
              <View style={[tw`w-10 h-10 rounded-full items-center justify-center mr-3 border`, { borderColor: themeBorderHex }]}>
                <Smartphone size={18} style={tw`${themeTextPrimary}`} />
              </View>
              <View>
                <Text style={[tw`text-sm font-bold`, tw`${themeTextPrimary}`]}>Two-Factor Authentication</Text>
                <Text style={tw`text-[11px] text-gray-400`}>Secure code sent to mobile login</Text>
              </View>
            </View>
            <Switch 
              trackColor={{ false: '#e5e7eb', true: themeBrandColor }}
              thumbColor={'#fff'}
              onValueChange={(val) => {
                setTwoFactorEnabled(val);
                triggerToast(val ? "2-Factor Auth enabled" : "2-Factor Auth disabled");
              }}
              value={twoFactorEnabled}
            />
          </View>
        </View>

        {/* Change Password Section */}
        <Text style={tw`text-xs font-bold tracking-widest text-gray-500 mb-3 ml-2 uppercase`}>Change Password</Text>
        <View style={[
          tw`rounded-3xl p-5 border mb-6 shadow-sm gap-y-4`,
          { backgroundColor: themeCardHex, borderColor: themeBorderHex }
        ]}>
          {renderInput("Current Password", currentPassword, setCurrentPassword, 'currPass')}
          {renderInput("New Password", newPassword, setNewPassword, 'newPass')}
          {renderInput("Confirm New Password", confirmPassword, setConfirmPassword, 'confPass')}

          <TouchableOpacity 
            onPress={handleUpdatePassword}
            style={[tw`py-4 rounded-2xl items-center justify-center shadow-md mt-2`, { backgroundColor: themeBrandColor }]}
          >
            <Text style={tw`text-white font-bold text-base`}>Update Password</Text>
          </TouchableOpacity>
        </View>

        {/* Active Logged-In Sessions */}
        <Text style={tw`text-xs font-bold tracking-widest text-gray-500 mb-3 ml-2 uppercase`}>Active Sessions</Text>
        <View style={[
          tw`rounded-3xl overflow-hidden border mb-6 shadow-sm`,
          { backgroundColor: themeCardHex, borderColor: themeBorderHex }
        ]}>
          <View style={tw`flex-row items-center p-4 border-b border-gray-100 dark:border-gray-800/50`}>
            <Smartphone size={20} color={themeBrandColor} style={tw`mr-3`} />
            <View style={tw`flex-1`}>
              <Text style={[tw`text-sm font-bold`, tw`${themeTextPrimary}`]}>iPhone 15 Pro (This device)</Text>
              <Text style={tw`text-[11px] text-gray-400`}>Dhaka, Bangladesh · Active Now</Text>
            </View>
            <View style={[tw`px-2.5 py-0.5 rounded bg-green-500/10 border border-green-500/20`]}>
              <Text style={tw`text-[9px] font-bold text-green-500`}>Active</Text>
            </View>
          </View>

          <View style={tw`flex-row items-center p-4`}>
            <Laptop size={20} style={tw`text-gray-400 mr-3`} />
            <View style={tw`flex-1`}>
              <Text style={[tw`text-sm font-bold`, tw`${themeTextPrimary}`]}>Chrome Browser (Windows 11)</Text>
              <Text style={tw`text-[11px] text-gray-400`}>Dhaka, Bangladesh · 2 hours ago</Text>
            </View>
            <TouchableOpacity 
              onPress={() => triggerToast("Device logged out.")}
              style={tw`border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-full`}
            >
              <Text style={tw`text-xs text-gray-500 font-bold`}>Log out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <Text style={tw`text-xs font-bold tracking-widest text-red-500 mb-3 ml-2 uppercase`}>Danger Zone</Text>
        <View style={[
          tw`rounded-3xl p-5 border shadow-sm border-red-500/15`,
          { backgroundColor: themeCardHex }
        ]}>
          <Text style={[tw`text-sm font-bold mb-1`, tw`${themeTextPrimary}`]}>Delete Account</Text>
          <Text style={[tw`text-xs leading-4 mb-4`, tw`${themeTextMuted}`]}>
            Permanently delete your Stylofy account. All orders, shipping addresses, and items will be deleted permanently.
          </Text>
          <TouchableOpacity 
            onPress={handleDeleteAccount}
            style={tw`flex-row items-center justify-center py-3.5 border border-red-500/25 bg-red-500/5 rounded-2xl`}
          >
            <Trash2 size={16} color="#ef4444" style={tw`mr-2`} />
            <Text style={tw`text-sm font-bold text-red-500`}>Delete My Account</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
