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

export default function SearchScreen() {
    const theme = useTheme<Theme>();
    const router = useRouter();
    const { cityId } = useLocationStore();
    const { user, isAuthenticated } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const debouncedQuery = useDebounce(searchQuery, 400);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/categories');
            return res.data;
        }
    });

    const { data: results, isLoading } = useQuery({
        queryKey: ['search', debouncedQuery, cityId, selectedType, selectedCategory],
        queryFn: async () => {
            const params: any = { cityId, search: debouncedQuery };
            if (selectedType !== 'all') params.type = selectedType;
            if (selectedCategory) params.categoryId = selectedCategory;
            const response = await api.get('/offers', { params });
            return response.data;
        },
        enabled: !!debouncedQuery || !!selectedCategory || selectedType !== 'all',
    });

    return (
        <Box flex={1} backgroundColor="mainBackground" alignItems="center">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header Container - Max Width */}
            <Box width="100%" maxWidth={1200} backgroundColor="cardBackground">
                <Box
                    flexDirection="row"
                    alignItems="center"
                    padding="m"
                    paddingTop="l"
                    gap="m"
                >
                    <TouchableOpacity onPress={() => router.back()}>
                        <Box backgroundColor="offWhite" p="xs" borderRadius="s">
                            <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
                        </Box>
                    </TouchableOpacity>

                    <Box
                        flex={1}
                        flexDirection="row"
                        alignItems="center"
                        backgroundColor="offWhite"
                        borderRadius="l"
                        paddingHorizontal="m"
                        height={48}
                        borderWidth={1}
                        borderColor={isFocused ? "primary" : "gray"}
                    >
                        <Ionicons name="search-outline" size={20} color={isFocused ? theme.colors.primary : theme.colors.grayMedium} />
                        <TextInput
                            style={{ flex: 1, marginLeft: 8, color: theme.colors.text, fontSize: 15, fontWeight: '500', height: '100%', outlineStyle: 'none' } as any}
                            placeholder="What are you looking for?"
                            placeholderTextColor={theme.colors.grayMedium}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            autoFocus
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color={theme.colors.grayMedium} />
                            </TouchableOpacity>
                        )}
                    </Box>

                    {/* Search Button (Primary) */}
                    <TouchableOpacity onPress={() => { /* Trigger search if needed */ }}>
                        <Box
                            width={44}
                            height={44}
                            borderRadius="l"
                            backgroundColor="primary"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Ionicons name="search" size={22} color="white" />
                        </Box>
                    </TouchableOpacity>
                </Box>

                {/* Filter Bar */}
                <Box
                    flexDirection="row"
                    alignItems="center"
                    borderBottomWidth={1}
                    borderBottomColor="gray200"
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
                            <Text fontWeight="600" fontSize={14}>Filters</Text>
                        </Box>
                    </TouchableOpacity>
                </Box>
            </Box>

            {/* Results Area - Max Width */}
            <Box width="100%" flex={1} maxWidth={1200}>
                {isFocused && searchQuery.length === 0 ? (
                    <ScrollView contentContainerStyle={{ padding: 16 }}>
                        <Text variant="subheader" fontSize={18} marginBottom="m">Trending Searches</Text>
                        <Box flexDirection="row" flexWrap="wrap" gap="s">
                            {TRENDING_SEARCHES.map((item) => (
                                <TouchableOpacity key={item} onPress={() => setSearchQuery(item)}>
                                    <Box
                                        paddingHorizontal="m"
                                        paddingVertical="s"
                                        backgroundColor="offWhite"
                                        borderRadius="l"
                                        flexDirection="row"
                                        alignItems="center"
                                        gap="xs"
                                    >
                                        <Ionicons name="trending-up" size={14} color={theme.colors.primary} />
                                        <Text fontWeight="500">{item}</Text>
                                    </Box>
                                </TouchableOpacity>
                            ))}
                        </Box>
                    </ScrollView>
                ) : isLoading ? (
                    <ResponsiveGrid
                        data={[1, 2, 3, 4, 5, 6]}
                        renderItem={() => <OfferCardSkeleton width="100%" />}
                        itemMinWidth={280}
                        gap={16}
                        style={{ padding: 16 }}
                    />
                ) : (
                    <ScrollView contentContainerStyle={{ padding: 16 }}>
                        {(!results || results.length === 0) ? (
                            <Box flex={1} justifyContent="center" alignItems="center" marginTop="xxl" padding="xl">
                                <Ionicons name="search-outline" size={64} color={theme.colors.gray} />
                                <Text color="textMuted" variant="subheader" marginTop="m" textAlign="center">
                                    {debouncedQuery || selectedType !== 'all' || selectedCategory
                                        ? "We couldn't find any offers matching your search."
                                        : "Search for amazing deals near you."}
                                </Text>
                                <Text color="grayMedium" textAlign="center" marginTop="s">
                                    Try using different keywords or filters to find what you're looking for.
                                </Text>
                            </Box>
                        ) : (
                            <ResponsiveGrid
                                data={results}
                                renderItem={(item) => <OfferCard offer={item} />}
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
                onApply={() => setFilterModalVisible(false)}
                onReset={() => {
                    setSelectedCategory(null);
                    setSelectedType('all');
                }}
            />
        </Box>
    );
}
