import React from 'react';
import { Modal, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Box from '../ui/Box';
import Text from '../ui/Text';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../../theme/theme';

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    categories: any[];
    selectedCategory: string | null;
    onSelectCategory: (id: string | null) => void;
    cities: any[];
    selectedCity: number | null;
    onSelectCity: (id: number | null) => void;
    vendors: any[];
    selectedVendor: string | null;
    onSelectVendor: (id: string | null) => void;
    isVendorsLoading: boolean;
    onApply: () => void;
    onReset: () => void;
}

const SearchFilterModal = ({
    visible,
    onClose,
    categories,
    selectedCategory,
    onSelectCategory,
    cities,
    selectedCity,
    onSelectCity,
    vendors,
    selectedVendor,
    onSelectVendor,
    isVendorsLoading,
    onApply,
    onReset
}: FilterModalProps) => {
    const theme = useTheme<Theme>();

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <Box flex={1} backgroundColor="modalBackground" justifyContent="flex-end">
                <Box
                    backgroundColor="cardBackground"
                    borderTopLeftRadius="xl"
                    borderTopRightRadius="xl"
                    maxHeight="90%"
                    padding="m"
                >
                    {/* Header */}
                    <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
                        <Box>
                            <Text variant="subheader">Filters</Text>
                            <Text variant="caption" color="grayMedium">Refine your search results</Text>
                        </Box>
                        <TouchableOpacity onPress={onClose}>
                            <Box padding="s" borderRadius="full" backgroundColor="offWhite">
                                <Ionicons name="close" size={24} color={theme.colors.text} />
                            </Box>
                        </TouchableOpacity>
                    </Box>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Categories */}
                        <Box marginBottom="l">
                            <Text fontWeight="bold" marginBottom="s" fontSize={16}>Category</Text>
                            <Box flexDirection="row" flexWrap="wrap" gap="s">
                                <TouchableOpacity onPress={() => onSelectCategory(null)}>
                                    <Box
                                        paddingHorizontal="m"
                                        paddingVertical="s"
                                        borderRadius="l"
                                        borderWidth={selectedCategory === null ? 1.5 : 1}
                                        borderColor={selectedCategory === null ? 'primary' : 'gray'}
                                        backgroundColor={selectedCategory === null ? 'primary' : 'transparent'}
                                    >
                                        <Text color={selectedCategory === null ? 'white' : 'text'} fontWeight={selectedCategory === null ? '600' : '400'}>All Categories</Text>
                                    </Box>
                                </TouchableOpacity>
                                {categories.map((cat) => (
                                    <TouchableOpacity key={cat.id} onPress={() => onSelectCategory(cat.id)}>
                                        <Box
                                            paddingHorizontal="m"
                                            paddingVertical="s"
                                            borderRadius="l"
                                            borderWidth={selectedCategory === cat.id ? 1.5 : 1}
                                            borderColor={selectedCategory === cat.id ? 'primary' : 'gray'}
                                            backgroundColor={selectedCategory === cat.id ? 'primary' : 'transparent'}
                                        >
                                            <Text color={selectedCategory === cat.id ? 'white' : 'text'} fontWeight={selectedCategory === cat.id ? '600' : '400'}>{cat.name}</Text>
                                        </Box>
                                    </TouchableOpacity>
                                ))}
                            </Box>
                        </Box>

                        {/* City Filter */}
                        <Box marginBottom="l">
                            <Text fontWeight="bold" marginBottom="s" fontSize={16}>Location (City)</Text>
                            <Box flexDirection="row" flexWrap="wrap" gap="s">
                                <TouchableOpacity onPress={() => onSelectCity(null)}>
                                    <Box
                                        paddingHorizontal="m"
                                        paddingVertical="s"
                                        borderRadius="l"
                                        borderWidth={selectedCity === null ? 1.5 : 1}
                                        borderColor={selectedCity === null ? 'primary' : 'gray'}
                                        backgroundColor={selectedCity === null ? 'primary' : 'transparent'}
                                    >
                                        <Text color={selectedCity === null ? 'white' : 'text'} fontWeight={selectedCity === null ? '600' : '400'}>Current/All</Text>
                                    </Box>
                                </TouchableOpacity>
                                {cities.map((city) => (
                                    <TouchableOpacity key={city.id} onPress={() => onSelectCity(city.id)}>
                                        <Box
                                            paddingHorizontal="m"
                                            paddingVertical="s"
                                            borderRadius="l"
                                            borderWidth={selectedCity === city.id ? 1.5 : 1}
                                            borderColor={selectedCity === city.id ? 'primary' : 'gray'}
                                            backgroundColor={selectedCity === city.id ? 'primary' : 'transparent'}
                                        >
                                            <Text color={selectedCity === city.id ? 'white' : 'text'} fontWeight={selectedCity === city.id ? '600' : '400'}>{city.name}</Text>
                                        </Box>
                                    </TouchableOpacity>
                                ))}
                            </Box>
                        </Box>

                        {/* Vendor Filter */}
                        <Box marginBottom="l">
                            <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="s">
                                <Text fontWeight="bold" fontSize={16}>Vendor / Shop</Text>
                                {isVendorsLoading && <ActivityIndicator size="small" color={theme.colors.primary} />}
                            </Box>
                            <Box flexDirection="row" flexWrap="wrap" gap="s">
                                <TouchableOpacity onPress={() => onSelectVendor(null)}>
                                    <Box
                                        paddingHorizontal="m"
                                        paddingVertical="s"
                                        borderRadius="l"
                                        borderWidth={selectedVendor === null ? 1.5 : 1}
                                        borderColor={selectedVendor === null ? 'primary' : 'gray'}
                                        backgroundColor={selectedVendor === null ? 'primary' : 'transparent'}
                                    >
                                        <Text color={selectedVendor === null ? 'white' : 'text'} fontWeight={selectedVendor === null ? '600' : '400'}>All Vendors</Text>
                                    </Box>
                                </TouchableOpacity>
                                {vendors.map((vendor) => (
                                    <TouchableOpacity key={vendor.id} onPress={() => onSelectVendor(vendor.id)}>
                                        <Box
                                            paddingHorizontal="m"
                                            paddingVertical="s"
                                            borderRadius="l"
                                            borderWidth={selectedVendor === vendor.id ? 1.5 : 1}
                                            borderColor={selectedVendor === vendor.id ? 'primary' : 'gray'}
                                            backgroundColor={selectedVendor === vendor.id ? 'primary' : 'transparent'}
                                        >
                                            <Text color={selectedVendor === vendor.id ? 'white' : 'text'} fontWeight={selectedVendor === vendor.id ? '600' : '400'}>{vendor.businessName}</Text>
                                        </Box>
                                    </TouchableOpacity>
                                ))}
                                {!isVendorsLoading && vendors.length === 0 && selectedCity && (
                                    <Text color="grayMedium" italic fontSize={12} marginTop="xs">No vendors found in this city.</Text>
                                )}
                            </Box>
                        </Box>

                        <Box paddingBottom="xxl" />
                    </ScrollView>

                    {/* Actions */}
                    <Box flexDirection="row" gap="m" marginTop="m" paddingBottom={Platform.OS === 'ios' ? 'm' : 's'}>
                        <TouchableOpacity style={{ flex: 1 }} onPress={onReset}>
                            <Box paddingVertical="m" borderRadius="l" borderWidth={1} borderColor="gray" alignItems="center">
                                <Text fontWeight="600">Reset</Text>
                            </Box>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1 }} onPress={onApply}>
                            <Box paddingVertical="m" borderRadius="l" backgroundColor="primary" alignItems="center">
                                <Text fontWeight="600" color="white">Apply Filters</Text>
                            </Box>
                        </TouchableOpacity>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
};

export default SearchFilterModal;
