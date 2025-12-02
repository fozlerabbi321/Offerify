import React from 'react';
import { Modal, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../../theme/theme';
import Box from '../ui/Box';
import Text from '../ui/Text';
import api from '../../lib/api';
import { useLocationStore } from '../../store/location.store';

interface City {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
}

interface LocationPickerModalProps {
    visible: boolean;
    onClose: () => void;
}

const fetchCities = async () => {
    const response = await api.get('/location/cities');
    return response.data;
};

const LocationPickerModal = ({ visible, onClose }: LocationPickerModalProps) => {
    const theme = useTheme<Theme>();
    const { setLocation, cityId } = useLocationStore();

    const { data: cities, isLoading, error } = useQuery({
        queryKey: ['cities'],
        queryFn: fetchCities,
        enabled: visible, // Only fetch when modal is open
    });

    const handleSelectCity = (city: City) => {
        setLocation(city.id, city.name, city.latitude, city.longitude);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <Box flex={1} backgroundColor="black" opacity={0.5} position="absolute" top={0} left={0} right={0} bottom={0} />
            <Box flex={1} justifyContent="flex-end">
                <Box
                    height="50%"
                    backgroundColor="mainBackground"
                    borderTopLeftRadius={24}
                    borderTopRightRadius={24}
                    padding="m"
                    shadowColor="black"
                    shadowOffset={{ width: 0, height: -2 }}
                    shadowOpacity={0.1}
                    shadowRadius={4}
                    elevation={5}
                >
                    <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
                        <Text variant="subheader">Select Location</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </Box>

                    {isLoading ? (
                        <Box flex={1} justifyContent="center" alignItems="center">
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                        </Box>
                    ) : error ? (
                        <Box flex={1} justifyContent="center" alignItems="center">
                            <Text color="error">Failed to load cities</Text>
                        </Box>
                    ) : (
                        <FlatList
                            data={cities}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => handleSelectCity(item)}>
                                    <Box
                                        paddingVertical="m"
                                        borderBottomWidth={1}
                                        borderBottomColor="gray"
                                        flexDirection="row"
                                        justifyContent="space-between"
                                        alignItems="center"
                                    >
                                        <Text variant="body" fontWeight={item.id === cityId ? 'bold' : 'regular'}>
                                            {item.name}
                                        </Text>
                                        {item.id === cityId && (
                                            <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                                        )}
                                    </Box>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </Box>
            </Box>
        </Modal>
    );
};

export default LocationPickerModal;
