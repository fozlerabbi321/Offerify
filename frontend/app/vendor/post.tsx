import React, { useState, useEffect } from 'react';
import { ScrollView, TextInput, TouchableOpacity, Alert, Image as RNImage, Modal, FlatList, Platform } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useLocalSearchParams } from 'expo-router';
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

const fetchOffer = async (offerId: string) => {
    const response = await api.get(`/offers/${offerId}`);
    return response.data;
};

const createOffer = async (formData: FormData) => {
    const response = await api.post('/offers', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

const updateOffer = async ({ offerId, data }: { offerId: string; data: any }) => {
    const response = await api.patch(`/offers/${offerId}`, data);
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
    const { editId } = useLocalSearchParams<{ editId?: string }>();
    const isEditMode = !!editId;

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
    const [existingImage, setExistingImage] = useState<string | null>(null);
    const [isActive, setIsActive] = useState(true);

    // Modal state
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showCityModal, setShowCityModal] = useState(false);
    const [showTypeModal, setShowTypeModal] = useState(false);

    // Fetch offer data for edit mode
    const { data: offerData, isLoading: isLoadingOffer } = useQuery({
        queryKey: ['offer', editId],
        queryFn: () => fetchOffer(editId!),
        enabled: isEditMode,
    });

    // Populate form when offer data is loaded
    useEffect(() => {
        if (offerData) {
            setTitle(offerData.title || '');
            setDescription(offerData.description || '');
            setOfferType(offerData.type || 'discount');
            setCategoryId(offerData.category?.id || offerData.categoryId || '');
            setCityId(offerData.city?.id || offerData.cityId || null);
            setDiscountPercentage(offerData.discountPercentage?.toString() || '');
            setCouponCode(offerData.couponCode || '');
            setVoucherValue(offerData.voucherValue?.toString() || '');
            setExistingImage(offerData.image || null);
            setIsActive(offerData.isActive ?? true);
        }
    }, [offerData]);

    // Queries
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });

    const { data: cities = [] } = useQuery({
        queryKey: ['cities'],
        queryFn: fetchCities,
    });

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: createOffer,
        onSuccess: (data) => {
            console.log('Offer created successfully:', data);
            queryClient.invalidateQueries({ queryKey: ['offers'] });
            queryClient.invalidateQueries({ queryKey: ['vendorOffers'] });
            queryClient.invalidateQueries({ queryKey: ['vendorStats'] });

            if (isWeb) {
                window.alert('Offer created successfully!');
                router.replace('/vendor/offers');
            } else {
                Alert.alert('Success', 'Offer created successfully!', [
                    { text: 'OK', onPress: () => router.replace('/vendor/offers') }
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

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: updateOffer,
        onSuccess: (data) => {
            console.log('Offer updated successfully:', data);
            queryClient.invalidateQueries({ queryKey: ['offers'] });
            queryClient.invalidateQueries({ queryKey: ['vendorOffers'] });
            queryClient.invalidateQueries({ queryKey: ['offer', editId] });

            if (isWeb) {
                window.alert('Offer updated successfully!');
                router.replace('/vendor/offers');
            } else {
                Alert.alert('Success', 'Offer updated successfully!', [
                    { text: 'OK', onPress: () => router.replace('/vendor/offers') }
                ]);
            }
        },
        onError: (err: any) => {
            console.error('Update offer error:', err);
            const errorMessage = err.response?.data?.message || 'Failed to update offer';
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
            setExistingImage(null); // Clear existing image when new one selected
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

        if (isEditMode) {
            // Update existing offer
            const updateData: any = {
                title: title.trim(),
                description: description.trim(),
                isActive,
            };

            if (offerType === 'discount' && discountPercentage) {
                updateData.discountPercentage = parseFloat(discountPercentage);
            }
            if (offerType === 'coupon' && couponCode) {
                updateData.couponCode = couponCode.trim();
            }
            if (offerType === 'voucher' && voucherValue) {
                updateData.voucherValue = parseInt(voucherValue);
            }

            updateMutation.mutate({ offerId: editId!, data: updateData });
        } else {
            // Create new offer
            const formData = new FormData();

            formData.append('title', title.trim());
            formData.append('description', description.trim());
            formData.append('type', offerType);
            formData.append('categoryId', categoryId);

            if (cityId) {
                formData.append('cityId', cityId.toString());
            }

            if (offerType === 'discount' && discountPercentage) {
                formData.append('discountPercentage', discountPercentage);
            }
            if (offerType === 'coupon' && couponCode) {
                formData.append('couponCode', couponCode.trim());
            }
            if (offerType === 'voucher' && voucherValue) {
                formData.append('voucherValue', voucherValue);
            }

            // Image file - handle web vs native
            if (image) {
                if (isWeb) {
                    // For web, we need to fetch the blob
                    fetch(image.uri)
                        .then(res => res.blob())
                        .then(blob => {
                            const file = new File([blob], image.fileName || 'offer.jpg', { type: image.mimeType || 'image/jpeg' });
                            formData.append('file', file);
                            createMutation.mutate(formData);
                        })
                        .catch(() => {
                            createMutation.mutate(formData);
                        });
                    return;
                } else {
                    const file: any = {
                        uri: image.uri,
                        name: image.fileName || 'offer.jpg',
                        type: image.mimeType || 'image/jpeg',
                    };
                    formData.append('file', file);
                }
            }

            createMutation.mutate(formData);
        }
    };

    const selectedCategory = categories.find(c => c.id === categoryId);
    const selectedCity = cities.find(c => c.id === cityId);
    const selectedType = OFFER_TYPES.find(t => t.value === offerType);
    const isPending = createMutation.isPending || updateMutation.isPending;

    if (isEditMode && isLoadingOffer) {
        return (
            <Box flex={1} backgroundColor="mainBackground" justifyContent="center" alignItems="center">
                <Text>Loading offer...</Text>
            </Box>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 100, maxWidth: 600, alignSelf: 'center', width: '100%' }}
            style={{ backgroundColor: theme.colors.mainBackground }}
        >
            <Text variant="header" marginBottom="l">
                {isEditMode ? 'Edit Offer' : 'Create Offer'}
            </Text>

            {/* Active/Inactive Toggle (Edit mode only) */}
            {isEditMode && (
                <Box
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                    backgroundColor="white"
                    padding="m"
                    borderRadius={12}
                    marginBottom="l"
                >
                    <Text fontWeight="600">Offer Status</Text>
                    <TouchableOpacity onPress={() => setIsActive(!isActive)} activeOpacity={0.7}>
                        <Box
                            flexDirection="row"
                            alignItems="center"
                            backgroundColor={isActive ? 'cardPrimaryBackground' : 'gray'}
                            paddingHorizontal="m"
                            paddingVertical="s"
                            borderRadius={20}
                        >
                            <Box
                                width={8}
                                height={8}
                                borderRadius={4}
                                backgroundColor="white"
                                marginRight="xs"
                            />
                            <Text fontSize={14} fontWeight="600" color="textInverted">
                                {isActive ? 'Active' : 'Inactive'}
                            </Text>
                        </Box>
                    </TouchableOpacity>
                </Box>
            )}

            {/* Image Picker */}
            <Text marginBottom="s" fontWeight="600">Offer Image {!isEditMode && '(Optional)'}</Text>
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
                    ) : existingImage ? (
                        <RNImage source={{ uri: existingImage }} style={{ width: '100%', height: '100%' }} />
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

            {/* Offer Type Selector (Create mode only) */}
            {!isEditMode && (
                <>
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
                </>
            )}

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

            {/* Category Selector (Create mode only) */}
            {!isEditMode && (
                <>
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
                </>
            )}

            {/* City Selector (Create mode only) */}
            {!isEditMode && (
                <>
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
                </>
            )}

            {/* Submit Button */}
            <TouchableOpacity onPress={handleSubmit} disabled={isPending}>
                <Box
                    backgroundColor="primary"
                    padding="m"
                    borderRadius={8}
                    alignItems="center"
                    opacity={isPending ? 0.7 : 1}
                    marginTop="m"
                >
                    <Text color="textInverted" fontWeight="bold" fontSize={18}>
                        {isPending ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Offer' : 'Create Offer')}
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
