import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, SafeAreaView, TouchableOpacity, ScrollView, 
  FlatList, TextInput, Switch, Modal, Alert, Platform, Animated 
} from 'react-native';
import { useRouter } from 'expo-router';
import tw from '@/lib/tailwind';
import { useShop, type SavedPaymentMethod } from '@/store/useShop';
import { 
  ArrowLeft, CreditCard, Plus, Trash2, CheckCircle2, 
  User, Calendar, ShieldCheck, Smartphone, Check 
} from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { 
    paymentMethods = [], 
    addPaymentMethod, 
    deletePaymentMethod, 
    setDefaultPaymentMethod 
  } = useShop();

  // Modal control states
  const [showFormModal, setShowFormModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'card' | 'mfs'>('card');
  const [selectedMfsProvider, setSelectedMfsProvider] = useState<'bkash' | 'nagad'>('bkash');

  // Credit Card Form States
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // MFS Form States
  const [mfsNumber, setMfsNumber] = useState('');
  const [mfsLabel, setMfsLabel] = useState('');

  // Common Form States
  const [isDefault, setIsDefault] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Toast notification overlay
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  // Sync toast timer
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

  // Detect card type based on number prefix
  const getCardType = (num: string): 'visa' | 'mastercard' | 'unknown' => {
    const cleanNum = num.replace(/\s+/g, '');
    if (cleanNum.startsWith('4')) return 'visa';
    if (cleanNum.startsWith('5')) return 'mastercard';
    return 'unknown';
  };

  // Format Card Number (adds space every 4 digits)
  const formatCardNumber = (text: string) => {
    const cleanText = text.replace(/\D/g, '');
    const matched = cleanText.match(/\d{1,4}/g);
    return matched ? matched.join(' ') : cleanText;
  };

  // Format Expiry Date (MM/YY)
  const formatExpiry = (text: string) => {
    const cleanText = text.replace(/\D/g, '');
    if (cleanText.length > 2) {
      return `${cleanText.slice(0, 2)}/${cleanText.slice(2, 4)}`;
    }
    return cleanText;
  };

  const openAddModal = () => {
    // Reset forms
    setCardNumber('');
    setCardHolder('');
    setCardExpiry('');
    setCardCvv('');
    setMfsNumber('');
    setMfsLabel('');
    setIsDefault(paymentMethods.length === 0);
    setActiveTab('card');
    setShowFormModal(true);
  };

  const handleSave = () => {
    if (activeTab === 'card') {
      const cleanCard = cardNumber.replace(/\s+/g, '');
      if (cleanCard.length < 16) {
        if (Platform.OS === 'web') {
          alert("Please enter a valid 16-digit card number.");
        } else {
          Alert.alert("Invalid Card", "Please enter a valid 16-digit card number.");
        }
        return;
      }
      if (!cardHolder.trim()) {
        if (Platform.OS === 'web') {
          alert("Please enter the cardholder name.");
        } else {
          Alert.alert("Cardholder Required", "Please enter the cardholder name.");
        }
        return;
      }
      if (cardExpiry.length < 5) {
        if (Platform.OS === 'web') {
          alert("Please enter expiry date (MM/YY).");
        } else {
          Alert.alert("Expiry Required", "Please enter expiry date (MM/YY).");
        }
        return;
      }
      if (cardCvv.length < 3) {
        if (Platform.OS === 'web') {
          alert("Please enter your 3-digit CVV.");
        } else {
          Alert.alert("CVV Required", "Please enter your 3-digit CVV.");
        }
        return;
      }

      const cardType = getCardType(cardNumber);
      const displayType = cardType === 'mastercard' ? 'mastercard' : 'visa';

      addPaymentMethod({
        type: displayType,
        cardHolder: cardHolder.toUpperCase().trim(),
        number: `•••• •••• •••• ${cleanCard.slice(-4)}`,
        expiry: cardExpiry,
        isDefault
      });
      triggerToast("Card added successfully!");

    } else {
      if (mfsNumber.length < 11) {
        if (Platform.OS === 'web') {
          alert("Please enter a valid MFS mobile number.");
        } else {
          Alert.alert("Invalid Number", "Please enter a valid MFS mobile number.");
        }
        return;
      }

      addPaymentMethod({
        type: selectedMfsProvider,
        cardHolder: mfsLabel.trim() || `${selectedMfsProvider === 'bkash' ? 'bKash' : 'Nagad'} Account`,
        number: `${mfsNumber.slice(0, 3)}••••${mfsNumber.slice(-4)}`,
        isDefault
      });
      triggerToast(`${selectedMfsProvider === 'bkash' ? 'bKash' : 'Nagad'} wallet added!`);
    }

    setShowFormModal(false);
  };

  const handleDelete = (id: string, isPmDefault: boolean) => {
    if (isPmDefault && paymentMethods.length > 1) {
      if (Platform.OS === 'web') {
        alert("Please set another payment method as default before deleting this one.");
      } else {
        Alert.alert("Cannot Delete Default", "Please set another payment method as default before deleting this one.");
      }
      return;
    }

    if (Platform.OS === 'web') {
      const confirm = window.confirm("Remove this payment method from your account?");
      if (confirm) {
        deletePaymentMethod(id);
        triggerToast("Payment method deleted.");
      }
    } else {
      Alert.alert(
        "Delete Payment Method",
        "Remove this payment method from your account?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Delete", 
            style: "destructive",
            onPress: () => {
              deletePaymentMethod(id);
              triggerToast("Payment method deleted.");
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
    maxLength?: number,
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
          maxLength={maxLength}
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

  const renderPaymentCard = ({ item }: { item: SavedPaymentMethod }) => {
    const isCard = item.type === 'visa' || item.type === 'mastercard';
    return (
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

        <View style={tw`flex-row items-center mb-4`}>
          {/* Brand Visual Logo */}
          <View style={[
            tw`w-14 h-9.5 rounded-lg items-center justify-center mr-3.5 border border-gray-100/50 shadow-sm`,
            { backgroundColor: item.type === 'bkash' ? '#E2136E' : item.type === 'nagad' ? '#ED1C24' : '#1e293b' }
          ]}>
            {item.type === 'visa' && <Text style={tw`text-white font-extrabold italic text-sm`}>VISA</Text>}
            {item.type === 'mastercard' && <Text style={tw`text-amber-500 font-extrabold italic text-xs`}>MC</Text>}
            {item.type === 'bkash' && <Text style={tw`text-white font-black text-[10px]`}>bKash</Text>}
            {item.type === 'nagad' && <Text style={tw`text-white font-black text-[10px]`}>নগদ</Text>}
          </View>

          <View style={tw`flex-1`}>
            <Text style={[tw`text-base font-bold capitalize`, tw`${themeTextPrimary}`]}>
              {isCard ? `${item.type} card` : item.type}
            </Text>
            <Text style={[tw`text-xs`, tw`${themeTextMuted}`]}>{item.cardHolder}</Text>
          </View>
        </View>

        <Text style={[tw`text-lg font-black tracking-widest mb-4`, tw`${themeTextPrimary}`]}>
          {item.number}
        </Text>

        <View style={tw`h-px bg-gray-100 dark:bg-gray-800/60 mb-4`} />

        <View style={tw`flex-row justify-between items-center`}>
          {!item.isDefault ? (
            <TouchableOpacity 
              onPress={() => setDefaultPaymentMethod(item.id)}
              style={tw`flex-row items-center py-1.5`}
            >
              <View style={[tw`w-4 h-4 rounded-full border items-center justify-center mr-2`, { borderColor: themeBorderHex }]} />
              <Text style={tw`text-xs font-bold text-gray-500`}>Set default</Text>
            </TouchableOpacity>
          ) : (
            <View style={tw`flex-row items-center py-1.5`}>
              <CheckCircle2 size={16} color={themeBrandColor} style={tw`mr-1.5`} />
              <Text style={[tw`text-xs font-bold`, { color: themeBrandColor }]}>Default payment method</Text>
            </View>
          )}

          <TouchableOpacity 
            onPress={() => handleDelete(item.id, item.isDefault)}
            style={[tw`w-9 h-9 rounded-full items-center justify-center border border-red-500/20`, { backgroundColor: isDark ? '#2D181A' : '#FFF5F5' }]}
          >
            <Trash2 size={14} color="#ef4444" />
          </TouchableOpacity>
        </View>
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
          <Text style={[tw`text-2xl font-black`, tw`${themeTextPrimary}`]}>Payments</Text>
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
      {paymentMethods.length === 0 ? (
        <View style={tw`flex-1 items-center justify-center p-6`}>
          <View style={[tw`w-24 h-24 rounded-full items-center justify-center mb-6 border shadow-sm`, { backgroundColor: themeCardHex, borderColor: themeBorderHex }]}>
            <CreditCard size={40} color="#9ca3af" />
          </View>
          <Text style={[tw`text-xl font-bold mb-2`, tw`${themeTextPrimary}`]}>No Payment Methods</Text>
          <Text style={[tw`text-center mb-8 text-sm px-6 leading-5`, tw`${themeTextMuted}`]}>
            Link a credit card or mobile wallet (bKash/Nagad) to make checkout fast and seamless.
          </Text>
          <TouchableOpacity
            onPress={openAddModal}
            style={[tw`px-8 py-4 rounded-full shadow-lg`, { backgroundColor: themeBrandColor }]}
          >
            <Text style={tw`text-white font-bold text-base`}>Add Payment Method</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList 
          data={paymentMethods}
          keyExtractor={(item) => item.id}
          renderItem={renderPaymentCard}
          contentContainerStyle={tw`p-5 pb-24`}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ADD METHOD FORM MODAL */}
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
              maxHeight: '93%'
            }
          ]}>
            {/* Form Header */}
            <View style={tw`flex-row justify-between items-center mb-5`}>
              <Text style={[tw`text-2xl font-black`, tw`${themeTextPrimary}`]}>Add Payment Method</Text>
              <TouchableOpacity onPress={() => setShowFormModal(false)} style={tw`py-1.5 px-3.5 rounded-full bg-gray-100 dark:bg-gray-800`}>
                <Text style={tw`text-xs font-bold text-gray-500 dark:text-gray-400`}>Close</Text>
              </TouchableOpacity>
            </View>

            {/* Selector Tabs */}
            <View style={tw`flex-row bg-gray-100 dark:bg-[#1C2320] p-1.5 rounded-2xl mb-6`}>
              <TouchableOpacity
                onPress={() => setActiveTab('card')}
                style={[tw`flex-1 py-3 rounded-xl items-center`, activeTab === 'card' ? { backgroundColor: isDark ? '#2E3D37' : '#ffffff' } : {}]}
              >
                <Text style={[tw`text-xs font-bold`, activeTab === 'card' ? tw`${themeTextPrimary}` : tw`text-gray-400`]}>Credit/Debit Card</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab('mfs')}
                style={[tw`flex-1 py-3 rounded-xl items-center`, activeTab === 'mfs' ? { backgroundColor: isDark ? '#2E3D37' : '#ffffff' } : {}]}
              >
                <Text style={[tw`text-xs font-bold`, activeTab === 'mfs' ? tw`${themeTextPrimary}` : tw`text-gray-400`]}>MFS (bKash/Nagad)</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-6`}>
              {activeTab === 'card' ? (
                <View style={tw`gap-y-4`}>
                  {/* Virtual Credit Card View (Visual Wow Factor!) */}
                  <View style={[
                    tw`w-full h-48 rounded-[24px] p-6 justify-between shadow-xl relative overflow-hidden`,
                    { backgroundColor: isDark ? '#1E2D27' : '#3D5E4E' }
                  ]}>
                    {/* Decorative abstract circles */}
                    <View style={tw`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/5`} />
                    <View style={tw`absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/5`} />

                    <View style={tw`flex-row justify-between items-start`}>
                      <View style={tw`w-12 h-9 bg-amber-500/20 rounded-md border border-amber-500/30 items-center justify-center`}>
                        <View style={tw`w-8 h-5 bg-amber-400/40 rounded`} />
                      </View>
                      
                      {/* Logo selection on card */}
                      <Text style={tw`text-white font-extrabold italic text-lg`}>
                        {getCardType(cardNumber) === 'mastercard' ? 'mastercard' : 'VISA'}
                      </Text>
                    </View>

                    <Text style={[tw`text-xl text-white font-black tracking-widest my-4`, { textShadowColor: '#00000040', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }]}>
                      {cardNumber || '•••• •••• •••• ••••'}
                    </Text>

                    <View style={tw`flex-row justify-between items-center`}>
                      <View>
                        <Text style={tw`text-[8px] text-white/50 uppercase tracking-widest`}>Card Holder</Text>
                        <Text style={tw`text-xs text-white font-bold uppercase tracking-wider`}>
                          {cardHolder || 'Jane Doe'}
                        </Text>
                      </View>
                      <View style={tw`items-end`}>
                        <Text style={tw`text-[8px] text-white/50 uppercase tracking-widest`}>Expires</Text>
                        <Text style={tw`text-xs text-white font-bold`}>
                          {cardExpiry || 'MM/YY'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={tw`h-3`} />

                  {/* Card input forms */}
                  {renderInput(
                    "Card Number",
                    cardNumber,
                    (t) => setCardNumber(formatCardNumber(t)),
                    <CreditCard size={18} color={focusedField === 'cardNo' ? themeBrandColor : '#9ca3af'} />,
                    'cardNo',
                    19,
                    'numeric'
                  )}

                  {renderInput(
                    "Cardholder Name",
                    cardHolder,
                    setCardHolder,
                    <User size={18} color={focusedField === 'cardName' ? themeBrandColor : '#9ca3af'} />,
                    'cardName'
                  )}

                  <View style={tw`flex-row gap-x-4`}>
                    <View style={tw`flex-1`}>
                      {renderInput(
                        "Expiry (MM/YY)",
                        cardExpiry,
                        (t) => setCardExpiry(formatExpiry(t)),
                        <Calendar size={18} color={focusedField === 'expiry' ? themeBrandColor : '#9ca3af'} />,
                        'expiry',
                        5,
                        'numeric'
                      )}
                    </View>
                    <View style={tw`flex-1`}>
                      {renderInput(
                        "CVV",
                        cardCvv,
                        setCardCvv,
                        <ShieldCheck size={18} color={focusedField === 'cvv' ? themeBrandColor : '#9ca3af'} />,
                        'cvv',
                        3,
                        'numeric'
                      )}
                    </View>
                  </View>
                </View>
              ) : (
                <View style={tw`gap-y-4`}>
                  {/* MFS Provider Selection */}
                  <View style={tw`flex-row gap-x-4 mb-4`}>
                    <TouchableOpacity
                      onPress={() => setSelectedMfsProvider('bkash')}
                      style={[
                        tw`flex-1 flex-row items-center justify-center py-4 border rounded-2xl`,
                        selectedMfsProvider === 'bkash' 
                          ? tw`border-[#E2136E] bg-[#E2136E]/5` 
                          : [{ borderColor: themeBorderHex }]
                      ]}
                    >
                      <View style={tw`w-3.5 h-3.5 rounded-full border border-gray-300 mr-2.5 items-center justify-center`}>
                        {selectedMfsProvider === 'bkash' && <View style={tw`w-2 h-2 rounded-full bg-[#E2136E]`} />}
                      </View>
                      <Text style={[tw`font-extrabold text-sm`, selectedMfsProvider === 'bkash' ? tw`text-[#E2136E]` : tw`${themeTextPrimary}`]}>bKash</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setSelectedMfsProvider('nagad')}
                      style={[
                        tw`flex-1 flex-row items-center justify-center py-4 border rounded-2xl`,
                        selectedMfsProvider === 'nagad' 
                          ? tw`border-[#ED1C24] bg-[#ED1C24]/5` 
                          : [{ borderColor: themeBorderHex }]
                      ]}
                    >
                      <View style={tw`w-3.5 h-3.5 rounded-full border border-gray-300 mr-2.5 items-center justify-center`}>
                        {selectedMfsProvider === 'nagad' && <View style={tw`w-2 h-2 rounded-full bg-[#ED1C24]`} />}
                      </View>
                      <Text style={[tw`font-extrabold text-sm`, selectedMfsProvider === 'nagad' ? tw`text-[#ED1C24]` : tw`${themeTextPrimary}`]}>Nagad</Text>
                    </TouchableOpacity>
                  </View>

                  {renderInput(
                    "Mobile Account Number",
                    mfsNumber,
                    setMfsNumber,
                    <Smartphone size={18} color={focusedField === 'mfsNo' ? themeBrandColor : '#9ca3af'} />,
                    'mfsNo',
                    11,
                    'phone-pad'
                  )}

                  {renderInput(
                    "Account Label (e.g. Personal, Dad's Phone)",
                    mfsLabel,
                    setMfsLabel,
                    <User size={18} color={focusedField === 'mfsLabel' ? themeBrandColor : '#9ca3af'} />,
                    'mfsLabel'
                  )}
                </View>
              )}

              {/* Set as Default switch */}
              <View style={tw`flex-row items-center justify-between p-4 bg-gray-50 dark:bg-[#19201C] rounded-2xl border border-gray-100 dark:border-gray-850 my-4`}>
                <View>
                  <Text style={[tw`text-sm font-bold`, tw`${themeTextPrimary}`]}>Set as Default Method</Text>
                  <Text style={tw`text-xs text-gray-400 mt-0.5`}>Make this my primary payment option</Text>
                </View>
                <Switch 
                  trackColor={{ false: '#e5e7eb', true: themeBrandColor }}
                  thumbColor={'#fff'}
                  onValueChange={setIsDefault}
                  value={isDefault}
                />
              </View>

              {/* Save / Cancel buttons */}
              <View style={tw`flex-row gap-x-3 mt-2`}>
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
                  <Text style={tw`text-white font-bold text-base`}>Save Method</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
