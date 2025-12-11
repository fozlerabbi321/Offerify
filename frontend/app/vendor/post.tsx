import React, { useState } from 'react';
import { ScrollView, TextInput, TouchableOpacity, Alert, Image as RNImage, Modal, FlatList, Platform } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import Box from '../../src/components/ui/Box';
import Text from '../../src/components/ui/Text';
import api from '../../src/lib/api';
import theme from '../../src/theme/theme';

// Types
type OfferType = 'discount' | 'coupon' | 'voucher';

interface Category {
    id: string;
    name: string;
}

interface City {
    id: number;
    name: string;
}

// API Functions
const fetchCategories = async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data || [];
};

const fetchCities = async (): Promise<City[]> => {
    const response = await api.get('/location/cities');
    return response.data || [];
};

const createOffer = async (formData: FormData) => {
    const response = await api.post('/offers', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Offer Type Options
const OFFER_TYPES: { value: OfferType; label: string; description: string }[] = [
    { value: 'discount', label: 'Discount', description: 'Percentage off (e.g., 20% off)' },
    { value: 'coupon', label: 'Coupon', description: 'Code-based discount' },
    { value: 'voucher', label: 'Voucher', description: 'Fixed value offer' },
];

// Input styles
const inputStyle = {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
    fontSize: 16,
};

export default function PostOfferScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const isWeb = Platform.OS === 'web';

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [offerType, setOfferType] = useState<OfferType>('discount');
    const [categoryId, setCategoryId] = useState('');
    const [cityId, setCityId] = useState<number | null>(null);
    const [discountPercentage, setDiscountPercentage] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [voucherValue, setVoucherValue] = useState('');
    const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

    // Modal state
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showCityModal, setShowCityModal] = useState(false);
    const [showTypeModal, setShowTypeModal] = useState(false);

    // Queries
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });

    const { data: cities = [] } = useQuery({
        queryKey: ['cities'],
        queryFn: fetchCities,
    });

    // Mutation
    const mutation = useMutation({
        mutationFn: createOffer,
        onSuccess: (data) => {
            console.log('Offer created successfully:', data);
            queryClient.invalidateQueries({ queryKey: ['offers'] });
            queryClient.invalidateQueries({ queryKey: ['vendorStats'] });

            if (isWeb) {
                // For web, use window.alert and then navigate
                window.alert('Offer created successfully!');
                router.replace('/vendor');
            } else {
                Alert.alert('Success', 'Offer created successfully!', [
                    { text: 'OK', onPress: () => router.replace('/vendor') }
                ]);
            }
        },
        onError: (err: any) => {
            console.error('Create offer error:', err);
            const errorMessage = err.response?.data?.message || 'Failed to create offer';
            if (isWeb) {
                window.alert(`Error: ${errorMessage}`);
            } else {
                Alert.alert('Error', errorMessage);
            }
        },
    });

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant camera roll permissions');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const validateForm = (): boolean => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a title');
            return false;
        }
        if (!description.trim()) {
            Alert.alert('Error', 'Please enter a description');
            return false;
        }
        if (!categoryId) {
            Alert.alert('Error', 'Please select a category');
            return false;
        }

        // Type-specific validation
        if (offerType === 'discount') {
            const percentage = parseFloat(discountPercentage);
            if (!discountPercentage || isNaN(percentage) || percentage < 0 || percentage > 100) {
                Alert.alert('Error', 'Please enter a valid discount percentage (0-100)');
                return false;
            }
        } else if (offerType === 'coupon') {
            if (!couponCode.trim()) {
                Alert.alert('Error', 'Please enter a coupon code');
                return false;
            }
        } else if (offerType === 'voucher') {
            const value = parseFloat(voucherValue);
            if (!voucherValue || isNaN(value) || value <= 0) {
                Alert.alert('Error', 'Please enter a valid voucher value');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        const formData = new FormData();

        // Required fields
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        formData.append('type', offerType);
        formData.append('categoryId', categoryId);

        // Optional city
        if (cityId) {
            formData.append('cityId', cityId.toString());
        }

        // Type-specific fields
        if (offerType === 'discount' && discountPercentage) {
            formData.append('discountPercentage', discountPercentage);
        }
        if (offerType === 'coupon' && couponCode) {
            formData.append('couponCode', couponCode.trim());
        }
        if (offerType === 'voucher' && voucherValue) {
            formData.append('voucherValue', voucherValue);
        }

        // Image file
        if (image) {
            const file: any = {
                uri: image.uri,
                name: image.fileName || 'offer.jpg',
                type: image.mimeType || 'image/jpeg',
            };
            formData.append('file', file);
        }

        console.log('Submitting offer:', { title, description, offerType, categoryId, cityId });
        mutation.mutate(formData);
    };

    const selectedCategory = categories.find(c => c.id === categoryId);
    const selectedCity = cities.find(c => c.id === cityId);
    const selectedType = OFFER_TYPES.find(t => t.value === offerType);

    return (
        <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 100, maxWidth: 600, alignSelf: 'center', width: '100%' }}
            style={{ backgroundColor: theme.colors.mainBackground }}
        >
            <Text variant="header" marginBottom="l">Create Offer</Text>

            {/* Image Picker */}
            <Text marginBottom="s" fontWeight="600">Offer Image (Optional)</Text>
            <TouchableOpacity onPress={pickImage}>
                <Box
                    height={200}
                    backgroundColor="gray"
                    borderRadius={12}
                    justifyContent="center"
                    alignItems="center"
                    marginBottom="l"
                    overflow="hidden"
                >
                    {image ? (
                        <RNImage source={{ uri: image.uri }} style={{ width: '100%', height: '100%' }} />
                    ) : (
                        <Box alignItems="center">
                            <Ionicons name="image-outline" size={48} color="white" />
                            <Text color="textInverted" marginTop="s">Tap to select image</Text>
                        </Box>
                    )}
                </Box>
            </TouchableOpacity>

            {/* Title */}
            <Text marginBottom="s" fontWeight="600">Title <Text color="error">*</Text></Text>
            <TextInput
                placeholder="e.g., 50% Off Whopper"
                value={title}
                onChangeText={setTitle}
                style={inputStyle}
                placeholderTextColor="#999"
            />

            {/* Description */}
            <Text marginBottom="s" fontWeight="600">Description <Text color="error">*</Text></Text>
            <TextInput
                placeholder="Describe your offer..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                style={{ ...inputStyle, height: 100, textAlignVertical: 'top' }}
                placeholderTextColor="#999"
            />

            {/* Offer Type Selector */}
            <Text marginBottom="s" fontWeight="600">Offer Type <Text color="error">*</Text></Text>
            <TouchableOpacity onPress={() => setShowTypeModal(true)}>
                <Box
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                    padding="m"
                    backgroundColor="white"
                    borderRadius={8}
                    borderWidth={1}
                    borderColor="gray"
                    marginBottom="m"
                >
                    <Box>
                        <Text fontWeight="600">{selectedType?.label || 'Select Type'}</Text>
                        {selectedType && (
                            <Text fontSize={12} color="darkGray">{selectedType.description}</Text>
                        )}
                    </Box>
                    <Ionicons name="chevron-down" size={20} color={theme.colors.darkGray} />
                </Box>
            </TouchableOpacity>

            {/* Conditional Fields based on Offer Type */}
            {offerType === 'discount' && (
                <>
                    <Text marginBottom="s" fontWeight="600">Discount Percentage <Text color="error">*</Text></Text>
                    <Box flexDirection="row" alignItems="center" marginBottom="m">
                        <TextInput
                            placeholder="e.g., 20"
                            value={discountPercentage}
                            onChangeText={setDiscountPercentage}
                            keyboardType="numeric"
                            style={{ ...inputStyle, flex: 1, marginBottom: 0, marginRight: 8 }}
                            placeholderTextColor="#999"
                        />
                        <Text fontSize={18} fontWeight="600">%</Text>
                    </Box>
                </>
            )}

            {offerType === 'coupon' && (
                <>
                    <Text marginBottom="s" fontWeight="600">Coupon Code <Text color="error">*</Text></Text>
                    <TextInput
                        placeholder="e.g., FRIES24"
                        value={couponCode}
                        onChangeText={(text) => setCouponCode(text.toUpperCase())}
                        autoCapitalize="characters"
                        style={inputStyle}
                        placeholderTextColor="#999"
                    />
                    <Text marginBottom="s" fontWeight="600">Discount Percentage (Optional)</Text>
                    <Box flexDirection="row" alignItems="center" marginBottom="m">
                        <TextInput
                            placeholder="e.g., 15"
                            value={discountPercentage}
                            onChangeText={setDiscountPercentage}
                            keyboardType="numeric"
                            style={{ ...inputStyle, flex: 1, marginBottom: 0, marginRight: 8 }}
                            placeholderTextColor="#999"
                        />
                        <Text fontSize={18} fontWeight="600">%</Text>
                    </Box>
                </>
            )}

            {offerType === 'voucher' && (
                <>
                    <Text marginBottom="s" fontWeight="600">Voucher Value <Text color="error">*</Text></Text>
                    <Box flexDirection="row" alignItems="center" marginBottom="m">
                        <Text fontSize={18} fontWeight="600" marginRight="s">৳</Text>
                        <TextInput
                            placeholder="e.g., 500"
                            value={voucherValue}
                            onChangeText={setVoucherValue}
                            keyboardType="numeric"
                            style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                            placeholderTextColor="#999"
                        />
                    </Box>
                </>
            )}

            {/* Category Selector */}
            <Text marginBottom="s" fontWeight="600">Category <Text color="error">*</Text></Text>
            <TouchableOpacity onPress={() => setShowCategoryModal(true)}>
                <Box
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                    padding="m"
                    backgroundColor="white"
                    borderRadius={8}
                    borderWidth={1}
                    borderColor={categoryId ? 'primary' : 'gray'}
                    marginBottom="m"
                >
                    <Text color={categoryId ? 'text' : 'darkGray'}>
                        {selectedCategory?.name || 'Select Category'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={theme.colors.darkGray} />
                </Box>
            </TouchableOpacity>

            {/* City Selector (Optional) */}
            <Text marginBottom="s" fontWeight="600">Target City (Optional)</Text>
            <TouchableOpacity onPress={() => setShowCityModal(true)}>
                <Box
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                    padding="m"
                    backgroundColor="white"
                    borderRadius={8}
                    borderWidth={1}
                    borderColor={cityId ? 'primary' : 'gray'}
                    marginBottom="m"
                >
                    <Text color={cityId ? 'text' : 'darkGray'}>
                        {selectedCity?.name || 'Use vendor location (default)'}
                    </Text>
                    <Box flexDirection="row" alignItems="center">
                        {cityId && (
                            <TouchableOpacity onPress={() => setCityId(null)} style={{ marginRight: 8 }}>
                                <Ionicons name="close-circle" size={20} color={theme.colors.darkGray} />
                            </TouchableOpacity>
                        )}
                        <Ionicons name="chevron-down" size={20} color={theme.colors.darkGray} />
                    </Box>
                </Box>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity onPress={handleSubmit} disabled={mutation.isPending}>
                <Box
                    backgroundColor="primary"
                    padding="m"
                    borderRadius={8}
                    alignItems="center"
                    opacity={mutation.isPending ? 0.7 : 1}
                    marginTop="m"
                >
                    <Text color="textInverted" fontWeight="bold" fontSize={18}>
                        {mutation.isPending ? 'Creating...' : 'Create Offer'}
                    </Text>
                </Box>
            </TouchableOpacity>

            {/* Type Modal */}
            <Modal visible={showTypeModal} animationType="slide" transparent>
                <Box flex={1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} justifyContent="flex-end">
                    <Box backgroundColor="white" borderTopLeftRadius={20} borderTopRightRadius={20} padding="l" maxHeight="60%">
                        <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
                            <Text variant="subheader">Select Offer Type</Text>
                            <TouchableOpacity onPress={() => setShowTypeModal(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </Box>
                        {OFFER_TYPES.map((type) => (
                            <TouchableOpacity
                                key={type.value}
                                onPress={() => {
                                    setOfferType(type.value);
                                    setShowTypeModal(false);
                                }}
                            >
                                <Box
                                    padding="m"
                                    backgroundColor={offerType === type.value ? 'cardPrimaryBackground' : 'offWhite'}
                                    borderRadius={8}
                                    marginBottom="s"
                                >
                                    <Text fontWeight="600" color={offerType === type.value ? 'textInverted' : 'text'}>
                                        {type.label}
                                    </Text>
                                    <Text fontSize={12} color={offerType === type.value ? 'textInverted' : 'darkGray'}>
                                        {type.description}
                                    </Text>
                                </Box>
                            </TouchableOpacity>
                        ))}
                    </Box>
                </Box>
            </Modal>

            {/* Category Modal */}
            <Modal visible={showCategoryModal} animationType="slide" transparent>
                <Box flex={1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} justifyContent="flex-end">
                    <Box backgroundColor="white" borderTopLeftRadius={20} borderTopRightRadius={20} padding="l" maxHeight="60%">
                        <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
                            <Text variant="subheader">Select Category</Text>
                            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </Box>
                        <FlatList
                            data={categories}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => {
                                        setCategoryId(item.id);
                                        setShowCategoryModal(false);
                                    }}
                                >
                                    <Box
                                        padding="m"
                                        backgroundColor={categoryId === item.id ? 'primary' : 'offWhite'}
                                        borderRadius={8}
                                        marginBottom="s"
                                    >
                                        <Text color={categoryId === item.id ? 'textInverted' : 'text'}>
                                            {item.name}
                                        </Text>
                                    </Box>
                                </TouchableOpacity>
                            )}
                        />
                    </Box>
                </Box>
            </Modal>

            {/* City Modal */}
            <Modal visible={showCityModal} animationType="slide" transparent>
                <Box flex={1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} justifyContent="flex-end">
                    <Box backgroundColor="white" borderTopLeftRadius={20} borderTopRightRadius={20} padding="l" maxHeight="60%">
                        <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
                            <Text variant="subheader">Select City</Text>
                            <TouchableOpacity onPress={() => setShowCityModal(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </Box>
                        <FlatList
                            data={cities}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => {
                                        setCityId(item.id);
                                        setShowCityModal(false);
                                    }}
                                >
                                    <Box
                                        padding="m"
                                        backgroundColor={cityId === item.id ? 'primary' : 'offWhite'}
                                        borderRadius={8}
                                        marginBottom="s"
                                    >
                                        <Text color={cityId === item.id ? 'textInverted' : 'text'}>
                                            {item.name}
                                        </Text>
                                    </Box>
                                </TouchableOpacity>
                            )}
                        />
                    </Box>
                </Box>
            </Modal>
        </ScrollView>
    );
}
