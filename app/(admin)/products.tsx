import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import tw from '@/lib/tailwind';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useShop } from '@/store/useShop';
import { Product } from '@/data/products';
import { Plus, Edit2, Trash2, Star, X, Check } from 'lucide-react-native';

export default function AdminProducts() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const products = useShop((s) => s.products);
  const addProduct = useShop((s) => s.addProduct);
  const updateProduct = useShop((s) => s.updateProduct);
  const deleteProduct = useShop((s) => s.deleteProduct);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const themeBg = isDark ? 'bg-[#191514]' : 'bg-[#FAF7F2]';
  const themeCard = isDark ? 'bg-[#261E1D]' : 'bg-white';
  const themeText = isDark ? 'text-[#EFEBE9]' : 'text-[#3E2723]';
  const themeTextMuted = isDark ? 'text-[#A1887F]' : 'text-[#8D6E63]';
  const themeBorder = isDark ? 'border-[#3E2723]' : 'border-[#EFEBE9]';
  const themeInput = isDark ? 'bg-[#3E2723] text-[#EFEBE9]' : 'bg-[#F5F0E6] text-[#3E2723]';

  const resetForm = () => {
    setName('');
    setBrand('');
    setPrice('');
    setImage('');
    setCategory('');
    setDescription('');
    setEditingProduct(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setBrand(product.brand);
    setPrice(product.price.toString());
    setImage(product.images?.[0] || '');
    setCategory(product.category);
    setDescription(product.description || '');
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Product', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: () => deleteProduct(id)
      }
    ]);
  };

  const handleSave = () => {
    if (!name || !price || !brand) {
      Alert.alert('Error', 'Please fill in the required fields (Name, Brand, Price)');
      return;
    }

    const productData = {
      name,
      brand,
      price: parseFloat(price) || 0,
      images: image ? [image] : [],
      category: category || 'General',
      description,
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviews: editingProduct ? editingProduct.reviews : 0,
      colors: editingProduct ? editingProduct.colors : ['#000000'],
      sizes: editingProduct ? editingProduct.sizes : ['M', 'L']
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData as Omit<Product, 'id'>);
    }
    
    setModalVisible(false);
    resetForm();
  };

  return (
    <View style={[tw`flex-1`, tw`${themeBg}`]}>
      <View style={[tw`px-6 pb-4 flex-row justify-between items-end border-b`, tw`${themeBorder}`, { paddingTop: Math.max(insets.top, 20) }]}>
        <View>
          <Text style={[tw`text-3xl font-extrabold mt-2`, tw`${themeText}`]}>Products</Text>
          <Text style={[tw`text-base mt-1`, tw`${themeTextMuted}`]}>Manage inventory</Text>
        </View>
        <TouchableOpacity 
          onPress={openAddModal}
          style={tw`bg-[#4E7661] w-10 h-10 rounded-full items-center justify-center shadow-sm`}
        >
          <Plus color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={tw`p-6 pb-24`} showsVerticalScrollIndicator={false}>
        {products.map((product) => (
          <View key={product.id} style={[tw`flex-row p-4 rounded-2xl mb-4 shadow-sm items-center`, tw`${themeCard}`]}>
            <Image 
              source={{ uri: product.images?.[0] || 'https://via.placeholder.com/150' }} 
              style={tw`w-20 h-20 rounded-xl bg-gray-100 mr-4`}
              resizeMode="cover"
            />
            <View style={tw`flex-1`}>
              <Text style={[tw`font-bold text-base mb-1`, tw`${themeText}`]} numberOfLines={1}>{product.name}</Text>
              <Text style={[tw`text-sm mb-1`, tw`${themeTextMuted}`]}>{product.brand}</Text>
              <View style={tw`flex-row items-center mb-1`}>
                <Star size={12} color="#f59e0b" fill="#f59e0b" />
                <Text style={[tw`text-xs ml-1`, tw`${themeTextMuted}`]}>{product.rating} ({product.reviews})</Text>
              </View>
              <Text style={[tw`font-bold text-lg text-[#4E7661]`]}>${product.price.toFixed(2)}</Text>
            </View>
            <View style={tw`justify-between h-full py-1`}>
              <TouchableOpacity 
                onPress={() => openEditModal(product)}
                style={[tw`p-2 rounded-full mb-2`, { backgroundColor: '#4E766120' }]}
              >
                <Edit2 size={16} color="#4E7661" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleDelete(product.id)}
                style={[tw`p-2 rounded-full`, { backgroundColor: '#ef444420' }]}
              >
                <Trash2 size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {products.length === 0 && (
          <Text style={[tw`text-center py-10`, tw`${themeTextMuted}`]}>No products found.</Text>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="formSheet">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[tw`flex-1`, tw`${themeBg}`]}
        >
          <View style={[tw`px-6 py-4 flex-row justify-between items-center border-b`, tw`${themeBorder}`]}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={tw`p-2 -ml-2`}>
              <X size={24} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
            <Text style={[tw`text-lg font-bold`, tw`${themeText}`]}>
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </Text>
            <TouchableOpacity onPress={handleSave} style={tw`p-2 -mr-2`}>
              <Check size={24} color="#4E7661" />
            </TouchableOpacity>
          </View>
          
          <ScrollView contentContainerStyle={tw`p-6`} showsVerticalScrollIndicator={false}>
            <Text style={[tw`text-sm font-semibold mb-2 ml-1`, tw`${themeTextMuted}`]}>Product Name *</Text>
            <TextInput
              style={[tw`p-4 rounded-xl mb-4`, tw`${themeInput}`]}
              placeholder="e.g. Premium Leather Jacket"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
            />

            <View style={tw`flex-row mb-4`}>
              <View style={tw`flex-1 mr-2`}>
                <Text style={[tw`text-sm font-semibold mb-2 ml-1`, tw`${themeTextMuted}`]}>Brand *</Text>
                <TextInput
                  style={[tw`p-4 rounded-xl`, tw`${themeInput}`]}
                  placeholder="e.g. Nike"
                  placeholderTextColor="#9ca3af"
                  value={brand}
                  onChangeText={setBrand}
                />
              </View>
              <View style={tw`flex-1 ml-2`}>
                <Text style={[tw`text-sm font-semibold mb-2 ml-1`, tw`${themeTextMuted}`]}>Price *</Text>
                <TextInput
                  style={[tw`p-4 rounded-xl`, tw`${themeInput}`]}
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
            </View>

            <Text style={[tw`text-sm font-semibold mb-2 ml-1`, tw`${themeTextMuted}`]}>Category</Text>
            <TextInput
              style={[tw`p-4 rounded-xl mb-4`, tw`${themeInput}`]}
              placeholder="e.g. men"
              placeholderTextColor="#9ca3af"
              value={category}
              onChangeText={setCategory}
            />

            <Text style={[tw`text-sm font-semibold mb-2 ml-1`, tw`${themeTextMuted}`]}>Image URL</Text>
            <TextInput
              style={[tw`p-4 rounded-xl mb-4`, tw`${themeInput}`]}
              placeholder="https://..."
              placeholderTextColor="#9ca3af"
              value={image}
              onChangeText={setImage}
            />

            <Text style={[tw`text-sm font-semibold mb-2 ml-1`, tw`${themeTextMuted}`]}>Description</Text>
            <TextInput
              style={[tw`p-4 rounded-xl mb-6 min-h-[100px]`, tw`${themeInput}`]}
              placeholder="Enter product description"
              placeholderTextColor="#9ca3af"
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />

            <TouchableOpacity 
              onPress={handleSave}
              style={tw`bg-[#4E7661] p-4 rounded-xl items-center`}
            >
              <Text style={tw`text-white font-bold text-lg`}>Save Product</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
