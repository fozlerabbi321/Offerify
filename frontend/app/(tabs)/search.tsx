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
import SearchSuggestions from '../../src/components/home/SearchSuggestions';
import { useSearchStore } from '../../src/store/search.store';

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

export default function SearchScreen() {
    const theme = useTheme<Theme>();
    const router = useRouter();
    const { cityId } = useLocationStore();
    const { user, isAuthenticated } = useAuthStore();
    const { query, setQuery, setSuggestions } = useSearchStore();
    const [selectedType, setSelectedType] = useState('all');

    // Active filters (used for query)
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [activeCityId, setActiveCityId] = useState<number | null>(null);
    const [activeVendorId, setActiveVendorId] = useState<string | null>(null);

    // Pending filters (used in modal)
    const [pendingCategory, setPendingCategory] = useState<string | null>(null);
    const [pendingCityId, setPendingCityId] = useState<number | null>(null);
    const [pendingVendorId, setPendingVendorId] = useState<string | null>(null);

    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const debouncedQuery = useDebounce(query, 300);

    const handleSelectCityPending = (id: number | null) => {
        if (id !== pendingCityId) {
            setPendingVendorId(null);
        }
        setPendingCityId(id);
    };

    const handleApplyFilters = () => {
        setActiveCategory(pendingCategory);
        setActiveCityId(pendingCityId);
        setActiveVendorId(pendingVendorId);
        setFilterModalVisible(false);
    };

    const handleResetFilters = () => {
        setPendingCategory(null);
        setPendingCityId(null);
        setPendingVendorId(null);
        setActiveCategory(null);
        setActiveCityId(null);
        setActiveVendorId(null);
        setSelectedType('all');
        setFilterModalVisible(false);
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
        queryKey: ['vendors', pendingCityId],
        queryFn: async () => {
            const params: any = {};
            if (pendingCityId) params.cityId = pendingCityId;
            const res = await api.get('/vendors', { params });
            return res.data;
        }
    });

    const { data: results, isLoading } = useQuery({
        queryKey: ['search', debouncedQuery, cityId, selectedType, activeCategory, activeCityId, activeVendorId],
        queryFn: async () => {
            const params: any = { cityId, search: debouncedQuery };
            if (selectedType !== 'all') params.type = selectedType;
            if (activeCategory) params.categoryId = activeCategory;
            if (activeCityId) params.cityId = activeCityId;
            if (activeVendorId) params.vendorId = activeVendorId;
            const response = await api.get('/offers', { params });
            return response.data;
        },
        enabled: !!debouncedQuery || !!activeCategory || selectedType !== 'all' || !!activeCityId || !!activeVendorId,
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
                    <TouchableOpacity onPress={() => {
                        setPendingCategory(activeCategory);
                        setPendingCityId(activeCityId);
                        setPendingVendorId(activeVendorId);
                        setFilterModalVisible(true);
                    }}>
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
                            {(activeCategory || activeCityId || activeVendorId) && (
                                <Box width={6} height={6} borderRadius={3} backgroundColor="primary" />
                            )}
                            <Text fontWeight="600" fontSize={14}>Filters</Text>
                        </Box>
                    </TouchableOpacity>
                </Box>
            </Box>

            {/* Results Area */}
            <Box flex={1} width="100%" position="relative">
                {/* Search Suggestions Overlay */}
                <SearchSuggestions />

                {!query && !activeCategory && selectedType === 'all' && !activeCityId && !activeVendorId ? (
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
                selectedCategory={pendingCategory}
                onSelectCategory={setPendingCategory}
                cities={cities || []}
                selectedCity={pendingCityId}
                onSelectCity={handleSelectCityPending}
                vendors={vendors || []}
                selectedVendor={pendingVendorId}
                onSelectVendor={setPendingVendorId}
                isVendorsLoading={isVendorsLoading}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
            />
        </Box>
    );
}
