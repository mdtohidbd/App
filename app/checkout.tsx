import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import tw from '@/lib/tailwind';
import { useShop, cartTotals } from '@/store/useShop';
import { 
  ArrowLeft, MapPin, CheckCircle2, ChevronRight, Smartphone, 
  Truck, FileText, Check, User, Phone, Building2, Hash 
} from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'cod' | null;

export default function CheckoutScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { cart, createOrder, coupon } = useShop();
  
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const backAction = () => {
      if (activeStep > 1) {
        setActiveStep((prev) => (prev - 1) as 1 | 2 | 3);
        return true;
      } else if (router.canGoBack()) {
        router.back();
        return true;
      } else {
        router.replace('/(tabs)');
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [activeStep, router]);

  const [isSuccess, setIsSuccess] = useState(false);
  
  // Form States
  const [shippingDetails, setShippingDetails] = useState({
    name: 'Jane Doe',
    phone: '01712345678',
    address: '123 Fashion Ave, Suite 400',
    city: 'Dhaka',
    zip: '1212'
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');
  const [paymentNumber, setPaymentNumber] = useState('');

  const totals = cartTotals(cart, coupon);

  const handlePlaceOrder = () => {
    if (!paymentMethod) return;
    createOrder(
      shippingDetails,
      paymentMethod,
      paymentNumber
    );
    setIsSuccess(true);
  };

  // Theme styling configurations
  const themeBgHex = isDark ? '#0A0D0B' : '#F4F7F5';
  const themeCardHex = isDark ? '#131815' : '#FFFFFF';
  const themeBorderHex = isDark ? '#222E28' : '#D9E2DE';
  const themeTextPrimary = isDark ? 'text-white' : 'text-gray-900';
  const themeTextMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const themeInputText = isDark ? 'text-white' : 'text-gray-900'; // Standard black/white color
  const themeInputPlaceholder = isDark ? '#6B7280' : '#9CA3AF';
  const themeBrandColor = '#4E7661'; // Blushify Sage Green

  const renderStepper = () => (
    <View style={tw`flex-row items-center justify-center px-6 py-5 mb-2`}>
      {/* Step 1 */}
      <View style={tw`items-center z-10`}>
        <View style={[
          tw`w-9 h-9 rounded-full items-center justify-center`,
          activeStep === 1 
            ? { backgroundColor: themeBrandColor, borderWidth: 3, borderColor: '#4E766140' } 
            : activeStep > 1 
              ? { backgroundColor: themeBrandColor } 
              : { backgroundColor: isDark ? '#19211D' : '#EAF0EC', borderWidth: 1, borderColor: isDark ? '#2A3530' : '#D5DFDA' }
        ]}>
          {activeStep > 1 ? (
            <Check size={16} color="#fff" strokeWidth={3} />
          ) : (
            <Text style={tw`font-bold ${activeStep === 1 ? 'text-white' : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>1</Text>
          )}
        </View>
        <Text style={tw`text-xs mt-2 font-semibold ${activeStep >= 1 ? (isDark ? 'text-white' : 'text-gray-900') : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>Address</Text>
      </View>
      
      <View style={[tw`flex-1 h-0.5 mx-2`, { backgroundColor: activeStep >= 2 ? themeBrandColor : (isDark ? '#2A3530' : '#D5DFDA') }]} />
      
      {/* Step 2 */}
      <View style={tw`items-center z-10`}>
        <View style={[
          tw`w-9 h-9 rounded-full items-center justify-center`,
          activeStep === 2 
            ? { backgroundColor: themeBrandColor, borderWidth: 3, borderColor: '#4E766140' } 
            : activeStep > 2 
              ? { backgroundColor: themeBrandColor } 
              : { backgroundColor: isDark ? '#19211D' : '#EAF0EC', borderWidth: 1, borderColor: isDark ? '#2A3530' : '#D5DFDA' }
        ]}>
          {activeStep > 2 ? (
            <Check size={16} color="#fff" strokeWidth={3} />
          ) : (
            <Text style={tw`font-bold ${activeStep === 2 ? 'text-white' : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>2</Text>
          )}
        </View>
        <Text style={tw`text-xs mt-2 font-semibold ${activeStep >= 2 ? (isDark ? 'text-white' : 'text-gray-900') : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>Payment</Text>
      </View>

      <View style={[tw`flex-1 h-0.5 mx-2`, { backgroundColor: activeStep >= 3 ? themeBrandColor : (isDark ? '#2A3530' : '#D5DFDA') }]} />
      
      {/* Step 3 */}
      <View style={tw`items-center z-10`}>
        <View style={[
          tw`w-9 h-9 rounded-full items-center justify-center`,
          activeStep === 3 
            ? { backgroundColor: themeBrandColor, borderWidth: 3, borderColor: '#4E766140' } 
            : { backgroundColor: isDark ? '#19211D' : '#EAF0EC', borderWidth: 1, borderColor: isDark ? '#2A3530' : '#D5DFDA' }
        ]}>
          <Text style={tw`font-bold ${activeStep === 3 ? 'text-white' : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>3</Text>
        </View>
        <Text style={tw`text-xs mt-2 font-semibold ${activeStep >= 3 ? (isDark ? 'text-white' : 'text-gray-900') : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>Review</Text>
      </View>
    </View>
  );

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
        tw`flex-row items-center border rounded-2xl px-4 py-1`,
        {
          backgroundColor: themeCardHex,
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
          placeholderTextColor={themeInputPlaceholder}
          style={[
            tw`flex-1 text-base py-3 px-0`,
            tw`${themeInputText}`,
            Platform.OS === 'web' && { outlineStyle: 'none' } as any
          ]} 
          onFocus={() => setFocusedField(fieldKey)}
          onBlur={() => setFocusedField(null)}
        />
      </View>
    );
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={[tw`flex-1 items-center justify-center p-6`, { backgroundColor: themeBgHex }]}>
        <Animated.View 
          entering={FadeInDown.duration(600).springify().damping(14)} 
          style={tw`items-center justify-center w-full`}
        >
          <View style={tw`w-24 h-24 bg-[#4E7661]/10 rounded-full items-center justify-center mb-6 border border-[#4E7661]/20`}>
            <CheckCircle2 size={48} color={themeBrandColor} />
          </View>
          <Text style={tw`text-3xl font-black ${themeTextPrimary} mb-2 text-center`}>Order Placed!</Text>
          <Text style={tw`text-center mb-10 text-sm leading-5 px-4 ${themeTextMuted}`}>
            {"Your order has been placed successfully. You can track its status in the 'My Orders' tab."}
          </Text>
          
          <View style={tw`w-full gap-y-4`}>
            <TouchableOpacity 
              onPress={() => router.replace('/orders')}
              style={[tw`py-4 rounded-full w-full items-center justify-center flex-row shadow-lg`, { backgroundColor: themeBrandColor }]}
            >
              <Text style={tw`text-white font-bold text-base mr-2`}>Track Order</Text>
              <ChevronRight size={18} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.replace('/(tabs)')}
              style={[tw`border py-4 rounded-full w-full items-center justify-center`, { backgroundColor: themeCardHex, borderColor: themeBorderHex }]}
            >
              <Text style={tw`font-semibold text-base ${themeTextPrimary}`}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: themeBgHex }]}>
      {/* Header */}
      <View style={[tw`flex-row items-center px-5 py-4 border-b`, { backgroundColor: themeCardHex, borderColor: themeBorderHex }, { paddingTop: Platform.OS === 'android' ? 32 : 12 }]}>
        <TouchableOpacity 
          onPress={() => {
            if (activeStep > 1) {
              setActiveStep((prev) => (prev - 1) as 1 | 2 | 3);
            } else if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)');
            }
          }} 
          style={tw`p-2 -ml-2 mr-2`}
        >
          <ArrowLeft size={24} style={tw`${themeTextPrimary}`} />
        </TouchableOpacity>
        <Text style={tw`text-xl font-bold ${themeTextPrimary}`}>Checkout</Text>
      </View>

      {renderStepper()}

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-1`}
      >
        <ScrollView contentContainerStyle={tw`p-5 pb-32`} showsVerticalScrollIndicator={false}>
          
          {/* STEP 1: SHIPPING ADDRESS */}
          {activeStep === 1 && (
            <Animated.View entering={FadeInDown.duration(400)}>
              <View style={tw`flex-row items-center mb-6`}>
                <View style={[tw`w-10 h-10 rounded-full items-center justify-center mr-3`, { backgroundColor: '#4E766115' }]}>
                  <MapPin size={20} color={themeBrandColor} />
                </View>
                <Text style={tw`text-2xl font-bold ${themeTextPrimary}`}>Shipping Details</Text>
              </View>

              <View style={tw`gap-y-4`}>
                {renderInput(
                  "Full Name",
                  shippingDetails.name,
                  (t) => setShippingDetails({...shippingDetails, name: t}),
                  <User size={18} color={focusedField === 'name' ? themeBrandColor : (isDark ? '#8A9590' : '#626C68')} />,
                  'name'
                )}
                {renderInput(
                  "Phone Number (e.g. 017...)",
                  shippingDetails.phone,
                  (t) => setShippingDetails({...shippingDetails, phone: t}),
                  <Phone size={18} color={focusedField === 'phone' ? themeBrandColor : (isDark ? '#8A9590' : '#626C68')} />,
                  'phone',
                  'phone-pad'
                )}
                {renderInput(
                  "Full Address",
                  shippingDetails.address,
                  (t) => setShippingDetails({...shippingDetails, address: t}),
                  <MapPin size={18} color={focusedField === 'address' ? themeBrandColor : (isDark ? '#8A9590' : '#626C68')} />,
                  'address'
                )}
                <View style={tw`flex-row gap-x-4`}>
                  <View style={tw`flex-1`}>
                    {renderInput(
                      "City",
                      shippingDetails.city,
                      (t) => setShippingDetails({...shippingDetails, city: t}),
                      <Building2 size={18} color={focusedField === 'city' ? themeBrandColor : (isDark ? '#8A9590' : '#626C68')} />,
                      'city'
                    )}
                  </View>
                  <View style={tw`flex-1`}>
                    {renderInput(
                      "Zip Code",
                      shippingDetails.zip,
                      (t) => setShippingDetails({...shippingDetails, zip: t}),
                      <Hash size={18} color={focusedField === 'zip' ? themeBrandColor : (isDark ? '#8A9590' : '#626C68')} />,
                      'zip',
                      'numeric'
                    )}
                  </View>
                </View>
              </View>

              <TouchableOpacity 
                onPress={() => setActiveStep(2)}
                style={[tw`mt-8 py-4 rounded-2xl flex-row items-center justify-center shadow-lg`, { backgroundColor: themeBrandColor }]}
              >
                <Text style={tw`text-white font-bold text-lg mr-2`}>Continue to Payment</Text>
                <ChevronRight size={20} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* STEP 2: PAYMENT METHOD */}
          {activeStep === 2 && (
            <Animated.View entering={FadeInDown.duration(400)}>
              <View style={tw`flex-row items-center mb-6`}>
                <View style={[tw`w-10 h-10 rounded-full items-center justify-center mr-3`, { backgroundColor: '#4E766115' }]}>
                  <Smartphone size={20} color={themeBrandColor} />
                </View>
                <Text style={tw`text-2xl font-bold ${themeTextPrimary}`}>Payment Method</Text>
              </View>

              <View style={tw`mb-6 gap-y-3`}>
                {/* bKash */}
                <TouchableOpacity 
                  onPress={() => setPaymentMethod('bkash')}
                  style={[
                    tw`flex-row items-center p-4 rounded-2xl border`,
                    paymentMethod === 'bkash' 
                      ? tw`bg-[#E2136E]/10 border-[#E2136E]` 
                      : [{ backgroundColor: themeCardHex, borderColor: themeBorderHex }]
                  ]}
                >
                  <View style={tw`w-12 h-12 bg-white rounded-full items-center justify-center mr-4 shadow-sm`}>
                    <Text style={tw`text-[#E2136E] font-black text-xs`}>bKash</Text>
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`font-bold text-lg ${themeTextPrimary}`}>bKash</Text>
                    <Text style={tw`text-xs ${themeTextMuted}`}>Pay via bKash gateway</Text>
                  </View>
                  {paymentMethod === 'bkash' && <CheckCircle2 size={24} color="#E2136E" />}
                </TouchableOpacity>

                {/* Nagad */}
                <TouchableOpacity 
                  onPress={() => setPaymentMethod('nagad')}
                  style={[
                    tw`flex-row items-center p-4 rounded-2xl border`,
                    paymentMethod === 'nagad' 
                      ? tw`bg-[#ED1C24]/10 border-[#ED1C24]` 
                      : [{ backgroundColor: themeCardHex, borderColor: themeBorderHex }]
                  ]}
                >
                  <View style={tw`w-12 h-12 bg-white rounded-full items-center justify-center mr-4 shadow-sm`}>
                    <Text style={tw`text-[#ED1C24] font-black text-xs`}>নগদ</Text>
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`font-bold text-lg ${themeTextPrimary}`}>Nagad</Text>
                    <Text style={tw`text-xs ${themeTextMuted}`}>Pay via Nagad gateway</Text>
                  </View>
                  {paymentMethod === 'nagad' && <CheckCircle2 size={24} color="#ED1C24" />}
                </TouchableOpacity>

                {/* Rocket */}
                <TouchableOpacity 
                  onPress={() => setPaymentMethod('rocket')}
                  style={[
                    tw`flex-row items-center p-4 rounded-2xl border`,
                    paymentMethod === 'rocket' 
                      ? tw`bg-[#8C15A4]/10 border-[#8C15A4]` 
                      : [{ backgroundColor: themeCardHex, borderColor: themeBorderHex }]
                  ]}
                >
                  <View style={tw`w-12 h-12 bg-white rounded-full items-center justify-center mr-4 shadow-sm`}>
                    <Text style={tw`text-[#8C15A4] font-black text-xs`}>Rocket</Text>
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`font-bold text-lg ${themeTextPrimary}`}>Rocket</Text>
                    <Text style={tw`text-xs ${themeTextMuted}`}>Pay via Rocket gateway</Text>
                  </View>
                  {paymentMethod === 'rocket' && <CheckCircle2 size={24} color="#8C15A4" />}
                </TouchableOpacity>

                {/* COD */}
                <TouchableOpacity 
                  onPress={() => setPaymentMethod('cod')}
                  style={[
                    tw`flex-row items-center p-4 rounded-2xl border`,
                    paymentMethod === 'cod' 
                      ? { backgroundColor: '#4E766115', borderColor: '#4E7661' } 
                      : [{ backgroundColor: themeCardHex, borderColor: themeBorderHex }]
                  ]}
                >
                  <View style={tw`w-12 h-12 bg-[#4E7661]/10 rounded-full items-center justify-center mr-4`}>
                    <Truck size={24} color={themeBrandColor} />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`font-bold text-lg ${themeTextPrimary}`}>Cash on Delivery</Text>
                    <Text style={tw`text-xs ${themeTextMuted}`}>Pay when you receive</Text>
                  </View>
                  {paymentMethod === 'cod' && <CheckCircle2 size={24} color={themeBrandColor} />}
                </TouchableOpacity>
              </View>

              {/* Dynamic Input based on selection MFS */}
              {(paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') && (
                <View style={[tw`p-5 rounded-2xl border mb-6`, { backgroundColor: themeCardHex, borderColor: themeBorderHex }]}>
                  <Text style={tw`mb-3 text-sm font-semibold ${themeTextPrimary}`}>
                    Enter your {paymentMethod === 'bkash' ? 'bKash' : paymentMethod === 'nagad' ? 'Nagad' : 'Rocket'} Account Number
                  </Text>
                  {renderInput(
                    "e.g. 017XXXXXXXX",
                    paymentNumber,
                    setPaymentNumber,
                    <Smartphone size={18} color={focusedField === 'payNumber' ? themeBrandColor : (isDark ? '#8A9590' : '#626C68')} />,
                    'payNumber',
                    'phone-pad'
                  )}
                </View>
              )}

              <TouchableOpacity 
                onPress={() => setActiveStep(3)}
                style={[tw`mt-4 py-4 rounded-2xl flex-row items-center justify-center shadow-lg`, { backgroundColor: themeBrandColor }]}
              >
                <Text style={tw`text-white font-bold text-lg mr-2`}>Review Order</Text>
                <ChevronRight size={20} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* STEP 3: REVIEW ORDER */}
          {activeStep === 3 && (
            <Animated.View entering={FadeInDown.duration(400)}>
              <View style={tw`flex-row items-center mb-6`}>
                <View style={[tw`w-10 h-10 rounded-full items-center justify-center mr-3`, { backgroundColor: '#4E766115' }]}>
                  <FileText size={20} color={themeBrandColor} />
                </View>
                <Text style={tw`text-2xl font-bold ${themeTextPrimary}`}>Review Order</Text>
              </View>

              {/* Delivery Details Summary */}
              <View style={[tw`rounded-2xl p-5 border mb-4`, { backgroundColor: themeCardHex, borderColor: themeBorderHex }]}>
                <View style={tw`flex-row justify-between items-center mb-3`}>
                  <Text style={tw`text-xs font-bold uppercase tracking-wider ${themeTextMuted}`}>Shipping To</Text>
                  <TouchableOpacity onPress={() => setActiveStep(1)}>
                    <Text style={[tw`text-xs underline font-semibold`, { color: themeBrandColor }]}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <Text style={tw`font-bold text-base mb-1 ${themeTextPrimary}`}>{shippingDetails.name} ({shippingDetails.phone})</Text>
                <Text style={tw`text-sm ${themeTextMuted}`}>{shippingDetails.address}</Text>
                <Text style={tw`text-sm ${themeTextMuted}`}>{shippingDetails.city}, {shippingDetails.zip}</Text>
              </View>

              {/* Payment Details Summary */}
              <View style={[tw`rounded-2xl p-5 border mb-6`, { backgroundColor: themeCardHex, borderColor: themeBorderHex }]}>
                <View style={tw`flex-row justify-between items-center mb-3`}>
                  <Text style={tw`text-xs font-bold uppercase tracking-wider ${themeTextMuted}`}>Payment Method</Text>
                  <TouchableOpacity onPress={() => setActiveStep(2)}>
                    <Text style={[tw`text-xs underline font-semibold`, { color: themeBrandColor }]}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <View style={tw`flex-row items-center`}>
                  {paymentMethod === 'cod' ? (
                    <Truck size={20} color={themeBrandColor} style={tw`mr-3`} />
                  ) : (
                    <Smartphone size={20} color={themeBrandColor} style={tw`mr-3`} />
                  )}
                  <View>
                    <Text style={tw`font-bold text-base capitalize ${themeTextPrimary}`}>
                      {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}
                    </Text>
                    {paymentMethod !== 'cod' && paymentNumber ? (
                      <Text style={tw`text-sm ${themeTextMuted}`}>{paymentNumber}</Text>
                    ) : null}
                  </View>
                </View>
              </View>

              {/* Order Summary */}
              <Text style={tw`text-lg font-bold mb-4 ${themeTextPrimary}`}>Order Summary</Text>
              <View style={[tw`rounded-3xl p-5 border mb-6`, { backgroundColor: themeCardHex, borderColor: themeBorderHex }]}>
                {cart.map(item => (
                  <View key={item.product.id} style={tw`flex-row justify-between items-center mb-3`}>
                    <Text style={tw`flex-1 mr-4 text-sm ${themeTextPrimary}`} numberOfLines={1}>
                      {item.qty}x {item.product.name}
                    </Text>
                    <Text style={tw`font-semibold ${themeTextPrimary}`}>${(item.product.price * item.qty).toFixed(2)}</Text>
                  </View>
                ))}
                
                <View style={tw`h-px bg-gray-200 dark:bg-gray-800 my-3`} />
                
                <View style={tw`flex-row justify-between mb-2`}>
                  <Text style={tw`text-sm ${themeTextMuted}`}>Subtotal</Text>
                  <Text style={tw`font-semibold text-sm ${themeTextPrimary}`}>${totals.subtotal.toFixed(2)}</Text>
                </View>
                <View style={tw`flex-row justify-between mb-2`}>
                  <Text style={tw`text-sm ${themeTextMuted}`}>Tax (10%)</Text>
                  <Text style={tw`font-semibold text-sm ${themeTextPrimary}`}>${(totals.subtotal * 0.1).toFixed(2)}</Text>
                </View>
                <View style={tw`flex-row justify-between mb-2`}>
                  <Text style={tw`text-sm ${themeTextMuted}`}>Shipping</Text>
                  <Text style={tw`font-semibold text-sm text-[#4E7661]`}>Free</Text>
                </View>
                
                {totals.discount > 0 && (
                  <View style={tw`flex-row justify-between mb-2`}>
                    <Text style={tw`text-sm text-[#4E7661]`}>Discount</Text>
                    <Text style={tw`font-semibold text-sm text-[#4E7661]`}>-${totals.discount.toFixed(2)}</Text>
                  </View>
                )}
                
                <View style={tw`h-px bg-gray-200 dark:bg-gray-800 my-3`} />
                
                <View style={tw`flex-row justify-between items-center`}>
                  <Text style={tw`text-xl font-bold ${themeTextPrimary}`}>Total</Text>
                  <Text style={tw`text-2xl font-black ${themeTextPrimary}`}>${(totals.subtotal * 1.1 - totals.discount).toFixed(2)}</Text>
                </View>
              </View>

            </Animated.View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Bottom Action */}
      {activeStep === 3 && (
        <View style={[tw`absolute bottom-0 inset-x-0 p-5 border-t`, { backgroundColor: themeCardHex, borderColor: themeBorderHex }]}>
          <TouchableOpacity 
            style={[tw`w-full py-4 rounded-full flex-row justify-center items-center shadow-lg`, { backgroundColor: themeBrandColor }]}
            onPress={handlePlaceOrder}
          >
            <Check size={20} color="#fff" style={tw`mr-2`} strokeWidth={3} />
            <Text style={tw`text-white font-bold text-lg`}>Confirm & Place Order</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
