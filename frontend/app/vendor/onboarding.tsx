import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Modal, FlatList, Alert, TextInput as RNTextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';

import Container from '../../src/components/ui/Container';
import Text from '../../src/components/ui/Text';
import Box from '../../src/components/ui/Box';
import Input from '../../src/components/ui/Input';
import api from '../../src/lib/api';
import theme from '../../src/theme/theme';
import { useAuthStore } from '../../src/store/auth.store';
import OfferMapPreview from '../../src/components/OfferMapPreview';

interface City {
    id: number;
    name: string;
    centerPoint: {
        type: 'Point';
        coordinates: [number, number]; // [long, lat]
    };
}

interface OnboardingFormData {
    businessName: string;
    phone: string;
    description: string;
    address: string;
    businessHours: string;
    category: string;
    cityId: number;
}

const CATEGORIES = [
    'Restaurant',
    'Retail Store',
    'Grocery',
    'Fashion & Apparel',
    'Electronics',
    'Health & Beauty',
    'Home & Garden',
    'Sports & Fitness',
    'Entertainment',
    'Services',
    'Other'
];

const fetchCities = async () => {
    const response = await api.get('/location/cities');
    return response.data;
};

export default function VendorOnboardingScreen() {
    const router = useRouter();
    const { user, checkLogin } = useAuthStore();
    const [isCityModalVisible, setCityModalVisible] = useState(false);
    const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [logoUri, setLogoUri] = useState<string | null>(null);

    const { control, handleSubmit, formState: { errors }, setValue } = useForm<OnboardingFormData>({
        defaultValues: {
            businessName: '',
            phone: '',
            description: '',
            address: '',
            businessHours: '',
            category: '',
        },
    });

    const { data: cities, isLoading: isLoadingCities } = useQuery({
        queryKey: ['cities'],
        queryFn: fetchCities,
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
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setLogoUri(result.assets[0].uri);
        }
    };

    const onSubmit = async (data: OnboardingFormData) => {
        if (!selectedCity) {
            Alert.alert('Error', 'Please select a city');
            return;
        }
        if (!selectedCategory) {
            Alert.alert('Error', 'Please select a category');
            return;
        }

        try {
            // For now, send only what backend accepts
            // Backend DTO expects: businessName, operatingCityId, address, latitude, longitude
            await api.post('/vendors', {
                businessName: data.businessName,
                address: data.address,
                operatingCityId: selectedCity.id,
                latitude: selectedCity.centerPoint.coordinates[1],
                longitude: selectedCity.centerPoint.coordinates[0],
                // Additional fields stored locally for future backend update:
                // phone: data.phone,
                // description: data.description,
                // businessHours: data.businessHours,
                // category: selectedCategory,
                // logo: logoUri
            });

            // Refresh user profile to get the new role
            checkLogin();

            Alert.alert('Success', 'Your vendor profile has been created!', [
                {
                    text: 'Go to Dashboard',
                    onPress: () => router.replace('/(vendor)'),
                },
            ]);
        } catch (error: any) {
            console.error('Onboarding error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to create vendor profile');
        }
    };

    const handleSelectCity = (city: City) => {
        setSelectedCity(city);
        setValue('cityId', city.id);
        setCityModalVisible(false);
    };

    const handleSelectCategory = (category: string) => {
        setSelectedCategory(category);
        setValue('category', category);
        setCategoryModalVisible(false);
    };

    return (
        <Container>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
                <Box flexDirection="row" alignItems="center" marginBottom="l">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text variant="header" marginLeft="m">Become a Seller</Text>
                </Box>

                <Text variant="body" color="gray500" marginBottom="xl">
                    Create your business profile to start selling on Offerify.
                </Text>

                {/* Logo Upload */}
                <Box marginBottom="l" alignItems="center">
                    <Text variant="subheader" marginBottom="s" fontSize={16}>Business Logo</Text>
                    <TouchableOpacity onPress={pickImage}>
                        <Box
                            width={120}
                            height={120}
                            borderRadius={60}
                            backgroundColor="offWhite"
                            borderWidth={2}
                            borderColor="gray200"
                            alignItems="center"
                            justifyContent="center"
                            style={{ overflow: 'hidden' }}
                        >
                            {logoUri ? (
                                <img src={logoUri} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Logo" />
                            ) : (
                                <Ionicons name="camera" size={40} color={theme.colors.grayMedium} />
                            )}
                        </Box>
                    </TouchableOpacity>
                    <Text variant="caption" color="gray500" marginTop="s">Tap to upload logo</Text>
                </Box>

                {/* Business Name */}
                <Box marginBottom="m">
                    <Controller
                        control={control}
                        rules={{ required: 'Business Name is required' }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label="Business Name"
                                placeholder="Enter your business name"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                error={errors.businessName?.message}
                            />
                        )}
                        name="businessName"
                    />
                </Box>

                {/* Phone Number */}
                <Box marginBottom="m">
                    <Controller
                        control={control}
                        rules={{
                            required: 'Phone number is required',
                            pattern: {
                                value: /^[0-9+\-\s()]+$/,
                                message: 'Invalid phone number'
                            }
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label="Phone Number"
                                placeholder="+1 (555) 123-4567"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                error={errors.phone?.message}
                                keyboardType="phone-pad"
                            />
                        )}
                        name="phone"
                    />
                </Box>

                {/* Business Description */}
                <Box marginBottom="m">
                    <Controller
                        control={control}
                        rules={{
                            required: 'Business description is required',
                            minLength: {
                                value: 20,
                                message: 'Description must be at least 20 characters'
                            }
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Box>
                                <Text variant="subheader" marginBottom="s" fontSize={16}>Business Description</Text>
                                <Box
                                    backgroundColor="white"
                                    borderWidth={1}
                                    borderColor={errors.description ? 'error' : 'gray200'}
                                    borderRadius={8}
                                    padding="m"
                                >
                                    <RNTextInput
                                        style={{
                                            height: 100,
                                            textAlignVertical: 'top',
                                            color: theme.colors.text,
                                            fontSize: 16,
                                            outlineStyle: 'none'
                                        } as any}
                                        placeholder="Describe your business, products, or services..."
                                        placeholderTextColor={theme.colors.grayMedium}
                                        multiline
                                        numberOfLines={4}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                </Box>
                                {errors.description && (
                                    <Text color="error" variant="caption" marginTop="xs">
                                        {errors.description.message}
                                    </Text>
                                )}
                            </Box>
                        )}
                        name="description"
                    />
                </Box>

                {/* Category */}
                <Box marginBottom="m">
                    <Text variant="subheader" marginBottom="s" fontSize={16}>Business Category</Text>
                    <TouchableOpacity onPress={() => setCategoryModalVisible(true)}>
                        <Box
                            padding="m"
                            borderWidth={1}
                            borderColor="gray200"
                            borderRadius={8}
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                            backgroundColor="white"
                        >
                            <Text color={selectedCategory ? 'text' : 'gray400'}>
                                {selectedCategory || 'Select category'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color={theme.colors.gray400} />
                        </Box>
                    </TouchableOpacity>
                </Box>

                {/* Address */}
                <Box marginBottom="m">
                    <Controller
                        control={control}
                        rules={{ required: 'Address is required' }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label="Address"
                                placeholder="Enter your business address"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                error={errors.address?.message}
                            />
                        )}
                        name="address"
                    />
                </Box>

                {/* Business Hours */}
                <Box marginBottom="m">
                    <Controller
                        control={control}
                        rules={{ required: 'Business hours are required' }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label="Business Hours"
                                placeholder="e.g., Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                error={errors.businessHours?.message}
                            />
                        )}
                        name="businessHours"
                    />
                </Box>

                {/* City */}
                <Box marginBottom="l">
                    <Text variant="subheader" marginBottom="s" fontSize={16}>City</Text>
                    <TouchableOpacity onPress={() => setCityModalVisible(true)}>
                        <Box
                            padding="m"
                            borderWidth={1}
                            borderColor="gray200"
                            borderRadius={8}
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                            backgroundColor="white"
                        >
                            <Text color={selectedCity ? 'text' : 'gray400'}>
                                {selectedCity ? selectedCity.name : 'Select your city'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color={theme.colors.gray400} />
                        </Box>
                    </TouchableOpacity>
                </Box>

                {selectedCity && (
                    <Box marginBottom="l">
                        <Text variant="subheader" marginBottom="s" fontSize={16}>Location Preview</Text>
                        <OfferMapPreview
                            latitude={selectedCity.centerPoint.coordinates[1]}
                            longitude={selectedCity.centerPoint.coordinates[0]}
                        />
                        <Text variant="caption" color="gray500" marginTop="s">
                            Your offers will be visible to users in {selectedCity.name}.
                        </Text>
                    </Box>
                )}

                <TouchableOpacity onPress={handleSubmit(onSubmit)}>
                    <Box
                        padding="m"
                        backgroundColor="primary"
                        borderRadius={12}
                        alignItems="center"
                        marginTop="m"
                    >
                        <Text color="textInverted" fontWeight="bold" fontSize={16}>Create Business Profile</Text>
                    </Box>
                </TouchableOpacity>
            </ScrollView>

            {/* City Modal */}
            <Modal
                visible={isCityModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setCityModalVisible(false)}
            >
                <Box flex={1} padding="m" backgroundColor="mainBackground">
                    <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
                        <Text variant="subheader">Select City</Text>
                        <TouchableOpacity onPress={() => setCityModalVisible(false)}>
                            <Ionicons name="close" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </Box>

                    {isLoadingCities ? (
                        <Text>Loading cities...</Text>
                    ) : (
                        <FlatList
                            data={cities}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => handleSelectCity(item)}>
                                    <Box
                                        padding="m"
                                        borderBottomWidth={1}
                                        borderBottomColor="gray200"
                                        flexDirection="row"
                                        justifyContent="space-between"
                                        alignItems="center"
                                    >
                                        <Text>{item.name}</Text>
                                        {selectedCity?.id === item.id && (
                                            <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                                        )}
                                    </Box>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </Box>
            </Modal>

            {/* Category Modal */}
            <Modal
                visible={isCategoryModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setCategoryModalVisible(false)}
            >
                <Box flex={1} padding="m" backgroundColor="mainBackground">
                    <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
                        <Text variant="subheader">Select Category</Text>
                        <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                            <Ionicons name="close" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </Box>

                    <FlatList
                        data={CATEGORIES}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => handleSelectCategory(item)}>
                                <Box
                                    padding="m"
                                    borderBottomWidth={1}
                                    borderBottomColor="gray200"
                                    flexDirection="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    <Text>{item}</Text>
                                    {selectedCategory === item && (
                                        <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                                    )}
                                </Box>
                            </TouchableOpacity>
                        )}
                    />
                </Box>
            </Modal>
        </Container>
    );
}
