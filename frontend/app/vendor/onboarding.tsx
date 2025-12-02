import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';

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
    address: string;
    cityId: number;
}

const fetchCities = async () => {
    const response = await api.get('/location/cities');
    return response.data;
};

export default function VendorOnboardingScreen() {
    const router = useRouter();
    const { user, checkLogin } = useAuthStore();
    const [isCityModalVisible, setCityModalVisible] = useState(false);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);

    const { control, handleSubmit, formState: { errors }, setValue } = useForm<OnboardingFormData>({
        defaultValues: {
            businessName: '',
            address: '',
        },
    });

    const { data: cities, isLoading: isLoadingCities } = useQuery({
        queryKey: ['cities'],
        queryFn: fetchCities,
    });

    const onSubmit = async (data: OnboardingFormData) => {
        if (!selectedCity) {
            Alert.alert('Error', 'Please select a city');
            return;
        }

        try {
            await api.post('/vendors', {
                businessName: data.businessName,
                address: data.address,
                cityId: selectedCity.id,
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

    return (
        <Container>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <Box flexDirection="row" alignItems="center" marginBottom="l">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text variant="header" marginLeft="m">Become a Seller</Text>
                </Box>

                <Text variant="body" color="gray500" marginBottom="xl">
                    Create your business profile to start selling on Offerify.
                </Text>

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
        </Container>
    );
}
