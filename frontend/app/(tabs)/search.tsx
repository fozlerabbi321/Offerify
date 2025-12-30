import React, { useState, useEffect } from 'react';
import { TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../../src/theme/theme';
import Box from '../../src/components/ui/Box';
import Text from '../../src/components/ui/Text';
import api from '../../src/lib/api';
import OfferCard from '../../src/components/home/OfferCard';
import { useLocationStore } from '../../src/store/location.store';
import { useAuthStore } from '../../src/store/auth.store';
import ResponsiveGrid from '../../src/components/ui/ResponsiveGrid';
import { CategorySkeleton, OfferCardSkeleton } from '../../src/components/ui/SkeletonLoaders';
import SearchFilterModal from '../../src/components/home/SearchFilterModal';

const TRENDING_SEARCHES = ['Pizza', 'Coffee', 'Gym', 'Electronics', 'Dine-in'];

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

const OFFER_TYPES = [
    { label: 'All', value: 'all' },
    { label: 'Discounts', value: 'discount' },
    { label: 'Coupons', value: 'coupon' },
    { label: 'Vouchers', value: 'voucher' },
];

import { useSearchStore } from '../../src/store/search.store';

export default function SearchScreen() {
    const theme = useTheme<Theme>();
    const router = useRouter();
    const { cityId } = useLocationStore();
    const { user, isAuthenticated } = useAuthStore();
    const { query, setQuery } = useSearchStore();
    const [selectedType, setSelectedType] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
    const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const debouncedQuery = useDebounce(query, 400);

    const handleSelectCity = (id: number | null) => {
        if (id !== selectedCityId) {
            setSelectedVendorId(null);
        }
        setSelectedCityId(id);
    };

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/categories');
            return res.data;
        }
    });

    const { data: cities } = useQuery({
        queryKey: ['cities'],
        queryFn: async () => {
            const res = await api.get('/location/cities');
            return res.data;
        }
    });

    const { data: vendors, isLoading: isVendorsLoading } = useQuery({
        queryKey: ['vendors', selectedCityId],
        queryFn: async () => {
            const params: any = {};
            if (selectedCityId) params.cityId = selectedCityId;
            const res = await api.get('/vendors', { params });
            return res.data;
        }
    });

    const { data: results, isLoading } = useQuery({
        queryKey: ['search', debouncedQuery, cityId, selectedType, selectedCategory, selectedCityId, selectedVendorId],
        queryFn: async () => {
            const params: any = { cityId, search: debouncedQuery };
            if (selectedType !== 'all') params.type = selectedType;
            if (selectedCategory) params.categoryId = selectedCategory;
            if (selectedCityId) params.cityId = selectedCityId; // Override default cityId if selected in filter
            if (selectedVendorId) params.vendorId = selectedVendorId;
            const response = await api.get('/offers', { params });
            return response.data;
        },
        enabled: !!debouncedQuery || !!selectedCategory || selectedType !== 'all' || !!selectedCityId || !!selectedVendorId,
    });

    return (
        <Box flex={1} backgroundColor="mainBackground" alignItems="center">
            {/* Filter Section - Full Width White Background */}
            <Box backgroundColor="cardBackground" width="100%" borderBottomWidth={1} borderBottomColor="gray200">
                <Box
                    maxWidth={1200}
                    width="100%"
                    alignSelf="center"
                    flexDirection="row"
                    alignItems="center"
                    paddingVertical="s"
                >
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16, gap: 10, alignItems: 'center' }}
                    >
                        {OFFER_TYPES.map((type) => (
                            <TouchableOpacity
                                key={type.value}
                                onPress={() => setSelectedType(type.value)}
                            >
                                <Box
                                    paddingHorizontal="l"
                                    paddingVertical="s"
                                    borderRadius="full"
                                    backgroundColor={selectedType === type.value ? 'primary' : 'offWhite'}
                                    borderWidth={1}
                                    borderColor={selectedType === type.value ? 'primary' : 'gray'}
                                >
                                    <Text
                                        color={selectedType === type.value ? 'white' : 'text'}
                                        fontWeight="600"
                                        fontSize={14}
                                    >
                                        {type.label}
                                    </Text>
                                </Box>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Box width={1} height={24} backgroundColor="gray" marginHorizontal="s" />

                    {/* Advanced Filter Button */}
                    <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
                        <Box
                            marginRight="m"
                            paddingHorizontal="m"
                            paddingVertical="s"
                            backgroundColor="offWhite"
                            borderRadius="l"
                            borderWidth={1}
                            borderColor="gray"
                            flexDirection="row"
                            alignItems="center"
                            gap="xs"
                        >
                            <Ionicons name="options-outline" size={20} color={theme.colors.text} />
                            {(selectedCategory || selectedCityId || selectedVendorId) && (
                                <Box width={6} height={6} borderRadius={3} backgroundColor="primary" />
                            )}
                            <Text fontWeight="600" fontSize={14}>Filters</Text>
                        </Box>
                    </TouchableOpacity>
                </Box>
            </Box>

            {/* Results Area */}
            <Box flex={1} width="100%">
                {!query && !selectedCategory && selectedType === 'all' && !selectedCityId && !selectedVendorId ? (
                    <ScrollView contentContainerStyle={{ padding: 16 }}>
                        <Text variant="subheader" fontSize={18} marginBottom="m">Trending Searches</Text>
                        <Box flexDirection="row" flexWrap="wrap" gap="s">
                            {TRENDING_SEARCHES.map((item) => (
                                <TouchableOpacity key={item} onPress={() => setQuery(item)}>
                                    <Box
                                        paddingHorizontal="m"
                                        paddingVertical="s"
                                        backgroundColor="offWhite"
                                        borderRadius="l"
                                        flexDirection="row"
                                        alignItems="center"
                                        gap="xs"
                                        borderWidth={1}
                                        borderColor="gray"
                                    >
                                        <Ionicons name="trending-up" size={14} color={theme.colors.primary} />
                                        <Text fontWeight="500">{item}</Text>
                                    </Box>
                                </TouchableOpacity>
                            ))}
                        </Box>
                    </ScrollView>
                ) : isLoading ? (
                    <Box padding="m">
                        <ResponsiveGrid
                            data={[1, 2, 3, 4, 5, 6]}
                            renderItem={() => <OfferCardSkeleton />}
                            itemMinWidth={280}
                            gap={16}
                        />
                    </Box>
                ) : (
                    <ScrollView contentContainerStyle={{ padding: 16 }}>
                        {(!results || results.length === 0) ? (
                            <Box flex={1} justifyContent="center" alignItems="center" marginTop="xxl" padding="xl">
                                <Ionicons name="search-outline" size={64} color={theme.colors.gray} />
                                <Text color="textMuted" variant="subheader" marginTop="m" textAlign="center">
                                    We couldn't find any offers matching your search.
                                </Text>
                                <Text color="grayMedium" textAlign="center" marginTop="s">
                                    Try using different keywords or filters to find what you're looking for.
                                </Text>
                            </Box>
                        ) : (
                            <ResponsiveGrid
                                data={results}
                                renderItem={(item: any) => <OfferCard offer={item} />}
                                itemMinWidth={280}
                                gap={16}
                            />
                        )}
                    </ScrollView>
                )}
            </Box>

            <SearchFilterModal
                visible={isFilterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                categories={categories || []}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                cities={cities || []}
                selectedCity={selectedCityId}
                onSelectCity={handleSelectCity}
                vendors={vendors || []}
                selectedVendor={selectedVendorId}
                onSelectVendor={setSelectedVendorId}
                isVendorsLoading={isVendorsLoading}
                onApply={() => setFilterModalVisible(false)}
                onReset={() => {
                    setSelectedCategory(null);
                    setSelectedType('all');
                    setSelectedCityId(null);
                    setSelectedVendorId(null);
                }}
            />
        </Box>
    );
}
