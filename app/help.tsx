import React, { useState } from 'react';
import { 
  View, Text, SafeAreaView, TouchableOpacity, ScrollView, 
  TextInput, LayoutAnimation, Platform, UIManager, Linking 
} from 'react-native';
import { useRouter } from 'expo-router';
import tw from '@/lib/tailwind';
import { 
  ArrowLeft, Search, MessageSquare, Phone, Mail, 
  ChevronDown, ChevronUp, AlertCircle, ShoppingBag, CreditCard, 
  RefreshCw, ShieldCheck 
} from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface FAQItem {
  id: string;
  q: string;
  a: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'f1',
    q: 'How can I track my order?',
    a: "Go to the 'Profile' tab, tap on 'My Orders', select the order you wish to track, and you will see a detailed visual timeline of the delivery progress (Placed, Confirmed, Shipped, Out for Delivery, Delivered).",
    category: 'orders'
  },
  {
    id: 'f2',
    q: 'What is your return policy?',
    a: "We offer a 30-day return policy for all unworn clothing items with original tags. Returns are completely free of charge. You can initiate a return directly from the order details screen.",
    category: 'returns'
  },
  {
    id: 'f3',
    q: 'How long does a refund take?',
    a: "Once we receive your returned package and inspect the items, refunds are processed immediately back to your original payment method (Visa, bKash, Nagad). It typically takes 3-5 business days to reflect in your account.",
    category: 'refunds'
  },
  {
    id: 'f4',
    q: 'Can I change my delivery address after placing an order?',
    a: "If the order status is still 'Placed' or 'Confirmed', we can update the shipping address for you. Please contact customer support via Live Chat or phone dial immediately.",
    category: 'orders'
  },
  {
    id: 'f5',
    q: 'Is my payment information secure?',
    a: "Absolutely. All transactions are fully encrypted using SSL, and credit card payments are processed securely via PCIDSS-compliant payment gateways. We never save raw card credentials on our servers.",
    category: 'security'
  }
];

export default function HelpCenterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const toggleFaq = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedFaqId === id) {
      setExpandedFaqId(null);
    } else {
      setExpandedFaqId(id);
    }
  };

  const handleLiveChat = () => {
    // Show simulation alert
    if (Platform.OS === 'web') {
      alert("Starting live chat simulation with support representative...");
    } else {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Alert } = require('react-native');
      Alert.alert("Live Chat Support", "Starting chat session with a support agent. Please hold on...");
    }
  };

  const handlePhoneCall = () => {
    Linking.openURL('tel:16123').catch(() => {
      if (Platform.OS === 'web') {
        alert("Calling hotline 16123...");
      }
    });
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@stylofy.com?subject=Customer Support Inquiry').catch(() => {
      if (Platform.OS === 'web') {
        alert("Opening mail to support@stylofy.com...");
      }
    });
  };

  // Filter FAQs based on search and selected category
  const filteredFaqs = FAQ_DATA.filter(faq => {
    const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // UI Theme styling configurations
  const themeBgHex = isDark ? '#0A0D0B' : '#F4F7F5';
  const themeCardHex = isDark ? '#131815' : '#FFFFFF';
  const themeBorderHex = isDark ? '#222E28' : '#D9E2DE';
  const themeTextPrimary = isDark ? 'text-white' : 'text-gray-900';
  const themeTextMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const themeBrandColor = '#4E7661'; // Blushify Sage Green

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: themeBgHex }]}>
      
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
        <Text style={[tw`text-2xl font-black`, tw`${themeTextPrimary}`]}>Help Center</Text>
      </View>

      <ScrollView contentContainerStyle={tw`p-5 pb-24`} showsVerticalScrollIndicator={false}>
        
        {/* Search Bar */}
        <View style={[
          tw`flex-row items-center border rounded-2xl px-4 py-1.5 mb-6`,
          { backgroundColor: themeCardHex, borderColor: themeBorderHex }
        ]}>
          <Search size={18} color="#9ca3af" style={tw`mr-3`} />
          <TextInput 
            placeholder="Search FAQs, articles, guides..."
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[
              tw`flex-1 text-base py-3.5 px-0`,
              tw`${themeTextPrimary}`,
              Platform.OS === 'web' && { outlineStyle: 'none' } as any
            ]}
          />
        </View>

        {/* Contact Support Options Section */}
        <Text style={tw`text-xs font-bold tracking-widest text-gray-500 mb-3 ml-2 uppercase`}>Contact Us</Text>
        <View style={tw`flex-row gap-x-3 mb-6`}>
          {/* Live Chat */}
          <TouchableOpacity 
            onPress={handleLiveChat}
            style={[
              tw`flex-1 rounded-3xl p-4 items-center border shadow-sm`,
              { backgroundColor: themeCardHex, borderColor: themeBorderHex }
            ]}
          >
            <View style={[tw`w-10 h-10 rounded-full items-center justify-center mb-2.5`, { backgroundColor: '#4E766115' }]}>
              <MessageSquare size={18} color={themeBrandColor} />
            </View>
            <Text style={[tw`text-xs font-extrabold mb-0.5`, tw`${themeTextPrimary}`]}>Live Chat</Text>
            <Text style={tw`text-[10px] text-gray-400 text-center`}>Chat with agent</Text>
          </TouchableOpacity>

          {/* Phone Call */}
          <TouchableOpacity 
            onPress={handlePhoneCall}
            style={[
              tw`flex-1 rounded-3xl p-4 items-center border shadow-sm`,
              { backgroundColor: themeCardHex, borderColor: themeBorderHex }
            ]}
          >
            <View style={[tw`w-10 h-10 rounded-full items-center justify-center mb-2.5`, { backgroundColor: '#4E766115' }]}>
              <Phone size={18} color={themeBrandColor} />
            </View>
            <Text style={[tw`text-xs font-extrabold mb-0.5`, tw`${themeTextPrimary}`]}>Hotline</Text>
            <Text style={tw`text-[10px] text-gray-400 text-center`}>Call us 16123</Text>
          </TouchableOpacity>

          {/* Email Support */}
          <TouchableOpacity 
            onPress={handleEmailSupport}
            style={[
              tw`flex-1 rounded-3xl p-4 items-center border shadow-sm`,
              { backgroundColor: themeCardHex, borderColor: themeBorderHex }
            ]}
          >
            <View style={[tw`w-10 h-10 rounded-full items-center justify-center mb-2.5`, { backgroundColor: '#4E766115' }]}>
              <Mail size={18} color={themeBrandColor} />
            </View>
            <Text style={[tw`text-xs font-extrabold mb-0.5`, tw`${themeTextPrimary}`]}>Email Us</Text>
            <Text style={tw`text-[10px] text-gray-400 text-center`}>support@style</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Categories Selection */}
        <Text style={tw`text-xs font-bold tracking-widest text-gray-500 mb-3 ml-2 uppercase`}>FAQ Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`gap-x-2.5 mb-6`}>
          {[
            { id: 'all', label: 'All FAQs', icon: AlertCircle },
            { id: 'orders', label: 'Orders & Shipping', icon: ShoppingBag },
            { id: 'refunds', label: 'Payments & Refunds', icon: CreditCard },
            { id: 'returns', label: 'Returns', icon: RefreshCw },
            { id: 'security', label: 'Security', icon: ShieldCheck },
          ].map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              style={[
                tw`px-4 py-2.5 rounded-full border flex-row items-center`,
                selectedCategory === cat.id
                  ? { backgroundColor: themeBrandColor, borderColor: themeBrandColor }
                  : { backgroundColor: themeCardHex, borderColor: themeBorderHex }
              ]}
            >
              <cat.icon size={13} color={selectedCategory === cat.id ? '#fff' : (isDark ? '#fff' : '#000')} style={tw`mr-1.5`} />
              <Text style={[tw`text-xs font-bold`, selectedCategory === cat.id ? tw`text-white` : tw`${themeTextPrimary}`]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAQs list accordion */}
        <Text style={tw`text-xs font-bold tracking-widest text-gray-500 mb-3 ml-2 uppercase`}>Frequently Asked Questions</Text>
        {filteredFaqs.length === 0 ? (
          <View style={[
            tw`rounded-3xl p-8 items-center border`,
            { backgroundColor: themeCardHex, borderColor: themeBorderHex }
          ]}>
            <AlertCircle size={28} color="#9ca3af" style={tw`mb-2`} />
            <Text style={[tw`text-sm font-bold text-center`, tw`${themeTextPrimary}`]}>No FAQs found</Text>
            <Text style={tw`text-xs text-gray-400 text-center mt-1`}>{"Try searching for other words like 'track', 'refund' or 'return'."}</Text>
          </View>
        ) : (
          <View style={tw`gap-y-3`}>
            {filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <View 
                  key={faq.id}
                  style={[
                    tw`rounded-2xl border overflow-hidden shadow-sm`,
                    { backgroundColor: themeCardHex, borderColor: themeBorderHex }
                  ]}
                >
                  <TouchableOpacity 
                    onPress={() => toggleFaq(faq.id)}
                    style={tw`flex-row justify-between items-center p-4.5`}
                    activeOpacity={0.7}
                  >
                    <Text style={[tw`text-sm font-bold flex-1 mr-4`, tw`${themeTextPrimary}`]}>
                      {faq.q}
                    </Text>
                    {isExpanded ? (
                      <ChevronUp size={16} style={tw`${themeTextPrimary}`} />
                    ) : (
                      <ChevronDown size={16} style={tw`${themeTextPrimary}`} />
                    )}
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={tw`px-4.5 pb-4.5 border-t border-gray-50 dark:border-gray-800/30 pt-3`}>
                      <Text style={[tw`text-xs leading-5`, tw`${themeTextMuted}`]}>
                        {faq.a}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
