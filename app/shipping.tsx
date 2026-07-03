import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, SafeAreaView, TouchableOpacity, ScrollView, 
  FlatList, TextInput, Switch, Modal, Alert, Platform, Animated 
} from 'react-native';
import { useRouter } from 'expo-router';
import tw from '@/lib/tailwind';
import { useShop, type ShippingAddress } from '@/store/useShop';
import { 
  ArrowLeft, MapPin, Plus, Trash2, Edit3, CheckCircle2, 
  User, Phone, Building2, Hash, Check 
} from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ShippingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { 
    addresses = [], 
    addAddress, 
    deleteAddress, 
    updateAddress, 
    setDefaultAddress 
  } = useShop();

  // Modal control states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Form Fields States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [isDefault, setIsDefault] = useState(false);
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

  const openAddModal = () => {
    setEditingAddressId(null);
    setFullName('');
    setPhone('');
    setAddressLine('');
    setCity('');
    setZip('');
    setIsDefault(addresses.length === 0); // Default if first address
    setShowFormModal(true);
  };

  const openEditModal = (addr: ShippingAddress) => {
    setEditingAddressId(addr.id);
    setFullName(addr.name);
    setPhone(addr.phone);
    setAddressLine(addr.address);
    setCity(addr.city);
    setZip(addr.zip);
    setIsDefault(addr.isDefault);
    setShowFormModal(true);
  };

  const handleSave = () => {
    if (!fullName.trim() || !phone.trim() || !addressLine.trim() || !city.trim() || !zip.trim()) {
      if (Platform.OS === 'web') {
        alert("Please fill in all address details.");
      } else {
        Alert.alert("Missing Fields", "Please fill in all address details.");
      }
      return;
    }

    const payload = {
      name: fullName.trim(),
      phone: phone.trim(),
      address: addressLine.trim(),
      city: city.trim(),
      zip: zip.trim(),
      isDefault: isDefault
    };

    if (editingAddressId) {
      updateAddress(editingAddressId, payload);
      triggerToast("Address updated successfully!");
    } else {
      addAddress(payload);
      triggerToast("New address added successfully!");
    }
    setShowFormModal(false);
  };

  const handleDelete = (id: string, isAddrDefault: boolean) => {
    if (isAddrDefault && addresses.length > 1) {
      if (Platform.OS === 'web') {
        alert("Please set another address as default before deleting this one.");
      } else {
        Alert.alert("Cannot Delete Default", "Please set another address as default before deleting this one.");
      }
      return;
    }

    if (Platform.OS === 'web') {
      const confirm = window.confirm("Are you sure you want to remove this shipping address?");
      if (confirm) {
        deleteAddress(id);
        triggerToast("Address removed successfully.");
      }
    } else {
      Alert.alert(
        "Delete Address",
        "Are you sure you want to remove this shipping address?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Delete", 
            style: "destructive",
            onPress: () => {
              deleteAddress(id);
              triggerToast("Address removed successfully.");
            }
          }
        ]
      );
    }
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
    icon: React.ReactNode,
    fieldKey: string,
    keyboardType: 'default' | 'phone-pad' | 'numeric' = 'default'
  ) => {
    const isFocused = focusedField === fieldKey;
    return (
      <View style={[
        tw`flex-row items-center border rounded-2xl px-4 py-0.5`,
        {
          backgroundColor: isDark ? '#19201C' : '#F9FBF9',
          borderColor: isFocused ? themeBrandColor : themeBorderHex,
          borderWidth: isFocused ? 1.5 : 1
        }
      ]}>
        <View style={tw`mr-3 opacity-70`}>
          {icon}
        </View>
        <TextInput 
          placeholder={placeholder} 
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
          style={[
            tw`flex-1 text-base`,
            tw`${themeTextPrimary}`,
            { 
              height: 50,
              minHeight: 50,
              ...(Platform.OS === 'web' && { outlineStyle: 'none' } as any)
            }
          ]} 
          onFocus={() => setFocusedField(fieldKey)}
          onBlur={() => setFocusedField(null)}
        />
      </View>
    );
  };

  const renderAddressCard = ({ item }: { item: ShippingAddress }) => (
    <View style={[
      tw`rounded-3xl p-5 border mb-4 shadow-sm relative overflow-hidden`,
      { backgroundColor: themeCardHex, borderColor: item.isDefault ? themeBrandColor : themeBorderHex, borderWidth: item.isDefault ? 1.5 : 1 }
    ]}>
      {/* Default Label */}
      {item.isDefault && (
        <View style={[tw`absolute top-0 right-0 px-3.5 py-1 rounded-bl-2xl flex-row items-center`, { backgroundColor: themeBrandColor }]}>
          <Check size={11} color="#fff" strokeWidth={3} style={tw`mr-1`} />
          <Text style={tw`text-[10px] text-white font-extrabold tracking-wider uppercase`}>Default</Text>
        </View>
      )}

      <Text style={[tw`text-lg font-bold mb-1`, tw`${themeTextPrimary}`]}>{item.name}</Text>
      <View style={tw`flex-row items-center mb-2`}>
        <Phone size={12} style={tw`text-gray-400 mr-1.5`} />
        <Text style={tw`text-xs text-gray-500`}>{item.phone}</Text>
      </View>

      <Text style={[tw`text-sm leading-5 mb-4`, tw`${themeTextMuted}`]}>
        {item.address}, {item.city} - {item.zip}
      </Text>

      <View style={tw`h-px bg-gray-100 dark:bg-gray-800/60 mb-4`} />

      <View style={tw`flex-row justify-between items-center`}>
        {!item.isDefault ? (
          <TouchableOpacity 
            onPress={() => setDefaultAddress(item.id)}
            style={tw`flex-row items-center py-1.5`}
          >
            <View style={[tw`w-4 h-4 rounded-full border items-center justify-center mr-2`, { borderColor: themeBorderHex }]} />
            <Text style={tw`text-xs font-bold text-gray-500`}>Set as default</Text>
          </TouchableOpacity>
        ) : (
          <View style={tw`flex-row items-center py-1.5`}>
            <CheckCircle2 size={16} color={themeBrandColor} style={tw`mr-1.5`} />
            <Text style={[tw`text-xs font-bold`, { color: themeBrandColor }]}>Default shipping address</Text>
          </View>
        )}

        <View style={tw`flex-row gap-x-2`}>
          <TouchableOpacity 
            onPress={() => openEditModal(item)}
            style={[tw`w-9 h-9 rounded-full items-center justify-center border`, { borderColor: themeBorderHex, backgroundColor: isDark ? '#19211D' : '#F9FBF9' }]}
          >
            <Edit3 size={14} style={tw`${themeTextPrimary}`} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleDelete(item.id, item.isDefault)}
            style={[tw`w-9 h-9 rounded-full items-center justify-center border border-red-500/20`, { backgroundColor: isDark ? '#2D181A' : '#FFF5F5' }]}
          >
            <Trash2 size={14} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

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
        tw`flex-row items-center justify-between px-5 pb-4 border-b`,
        { backgroundColor: themeCardHex, borderColor: themeBorderHex },
        { paddingTop: Platform.OS === 'android' ? 32 : 12 }
      ]}>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={[tw`h-10 w-10 rounded-full items-center justify-center border mr-3`, { backgroundColor: themeCardHex, borderColor: themeBorderHex }]}
          >
            <ArrowLeft size={20} style={tw`${themeTextPrimary}`} />
          </TouchableOpacity>
          <Text style={[tw`text-2xl font-black`, tw`${themeTextPrimary}`]}>Addresses</Text>
        </View>
        
        <TouchableOpacity 
          onPress={openAddModal}
          style={[tw`flex-row items-center px-4 py-2.5 rounded-full shadow-sm`, { backgroundColor: themeBrandColor }]}
        >
          <Plus size={16} color="#fff" style={tw`mr-1.5`} strokeWidth={2.5} />
          <Text style={tw`text-white font-extrabold text-xs`}>Add New</Text>
        </TouchableOpacity>
      </View>

      {/* Main List */}
      {addresses.length === 0 ? (
        <View style={tw`flex-1 items-center justify-center p-6`}>
          <View style={[tw`w-24 h-24 rounded-full items-center justify-center mb-6 border shadow-sm`, { backgroundColor: themeCardHex, borderColor: themeBorderHex }]}>
            <MapPin size={40} color="#9ca3af" />
          </View>
          <Text style={[tw`text-xl font-bold mb-2`, tw`${themeTextPrimary}`]}>No Addresses Saved</Text>
          <Text style={[tw`text-center mb-8 text-sm px-6 leading-5`, tw`${themeTextMuted}`]}>
            Add a default shipping address to checkout much faster on your next order!
          </Text>
          <TouchableOpacity
            onPress={openAddModal}
            style={[tw`px-8 py-4 rounded-full shadow-lg`, { backgroundColor: themeBrandColor }]}
          >
            <Text style={tw`text-white font-bold text-base`}>Add Shipping Address</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList 
          data={addresses}
          keyExtractor={(item) => item.id}
          renderItem={renderAddressCard}
          contentContainerStyle={tw`p-5 pb-24`}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FORM MODAL */}
      <Modal
        visible={showFormModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFormModal(false)}
      >
        <View style={tw`flex-1 bg-black/60 justify-end`}>
          <TouchableOpacity 
            style={tw`absolute inset-0`}
            activeOpacity={1}
            onPress={() => setShowFormModal(false)}
          />
          <View style={[
            tw`rounded-t-[32px] p-6 pb-12 border-t w-full`,
            { 
              backgroundColor: themeCardHex, 
              borderColor: themeBorderHex,
              maxHeight: '90%'
            }
          ]}>
            {/* Form Header */}
            <View style={tw`flex-row justify-between items-center mb-6`}>
              <Text style={[tw`text-2xl font-black`, tw`${themeTextPrimary}`]}>
                {editingAddressId ? 'Edit Address' : 'Add Shipping Address'}
              </Text>
              <TouchableOpacity onPress={() => setShowFormModal(false)} style={tw`py-1.5 px-3.5 rounded-full bg-gray-100 dark:bg-gray-800`}>
                <Text style={tw`text-xs font-bold text-gray-500 dark:text-gray-400`}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`gap-y-4 pb-6`}>
              {renderInput(
                "Full Name",
                fullName,
                setFullName,
                <User size={18} color={focusedField === 'name' ? themeBrandColor : '#9ca3af'} />,
                'name'
              )}

              {renderInput(
                "Phone Number",
                phone,
                setPhone,
                <Phone size={18} color={focusedField === 'phone' ? themeBrandColor : '#9ca3af'} />,
                'phone',
                'phone-pad'
              )}

              {renderInput(
                "Full Address",
                addressLine,
                setAddressLine,
                <MapPin size={18} color={focusedField === 'address' ? themeBrandColor : '#9ca3af'} />,
                'address'
              )}

              <View style={tw`flex-row gap-x-4`}>
                <View style={tw`flex-1`}>
                  {renderInput(
                    "City",
                    city,
                    setCity,
                    <Building2 size={18} color={focusedField === 'city' ? themeBrandColor : '#9ca3af'} />,
                    'city'
                  )}
                </View>
                <View style={tw`flex-1`}>
                  {renderInput(
                    "Zip Code",
                    zip,
                    setZip,
                    <Hash size={18} color={focusedField === 'zip' ? themeBrandColor : '#9ca3af'} />,
                    'zip',
                    'numeric'
                  )}
                </View>
              </View>

              {/* Set as Default switch */}
              <View style={tw`flex-row items-center justify-between p-4 bg-gray-50 dark:bg-[#19201C] rounded-2xl border border-gray-100 dark:border-gray-850 my-2`}>
                <View>
                  <Text style={[tw`text-sm font-bold`, tw`${themeTextPrimary}`]}>Set as Default Address</Text>
                  <Text style={tw`text-xs text-gray-400 mt-0.5`}>Make this my primary delivery location</Text>
                </View>
                <Switch 
                  trackColor={{ false: '#e5e7eb', true: themeBrandColor }}
                  thumbColor={'#fff'}
                  onValueChange={setIsDefault}
                  value={isDefault}
                  disabled={editingAddressId !== null && addresses.find(a => a.id === editingAddressId)?.isDefault}
                />
              </View>

              {/* Save / Cancel buttons */}
              <View style={tw`flex-row gap-x-3 mt-4`}>
                <TouchableOpacity
                  onPress={() => setShowFormModal(false)}
                  style={[tw`flex-1 py-4 border rounded-2xl items-center justify-center`, { borderColor: themeBorderHex }]}
                >
                  <Text style={tw`font-bold text-base ${themeTextPrimary}`}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  style={[tw`flex-1 py-4 rounded-2xl items-center justify-center shadow-lg`, { backgroundColor: themeBrandColor }]}
                >
                  <Text style={tw`text-white font-bold text-base`}>Save Address</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
