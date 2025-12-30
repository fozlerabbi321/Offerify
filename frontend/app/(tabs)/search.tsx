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

    const getInitials = (email: string) => {
        return email.substring(0, 1).toUpperCase();
    };

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
                    borderBottomWidth={1}
                    borderBottomColor="gray200"
                >
                    <TouchableOpacity onPress={() => router.back()}>
                        <Box backgroundColor="offWhite" p="xs" borderRadius="s">
                            <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
                        </Box>
                    </TouchableOpacity>

                    <Box
                        flex={1}
                        marginLeft="m"
                        flexDirection="row"
                        alignItems="center"
                        backgroundColor="offWhite"
                        borderRadius="l"
                        paddingHorizontal="m"
                        height={46}
                        borderWidth={1}
                        borderColor="gray"
                    >
                        <Ionicons name="search-outline" size={18} color={theme.colors.grayMedium} />
                        <TextInput
                            style={{ flex: 1, marginLeft: 8, color: theme.colors.text, fontSize: 15, fontWeight: '500', height: '100%', outlineStyle: 'none' } as any}
                            placeholder="What are you looking for?"
                            placeholderTextColor={theme.colors.grayMedium}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color={theme.colors.grayMedium} />
                            </TouchableOpacity>
                        )}
                    </Box>

                    {/* Auth/Profile */}
                    <Box marginLeft="m">
                        {isAuthenticated && user ? (
                            <TouchableOpacity onPress={() => router.push('/(tabs)/account')}>
                                <Box width={38} height={38} borderRadius="full" backgroundColor="primary" alignItems="center" justifyContent="center">
                                    <Text color="textInverted" fontWeight="bold" fontSize={15}>{getInitials(user.email)}</Text>
                                </Box>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                                <Box paddingHorizontal="m" paddingVertical="s" backgroundColor="primary" borderRadius="l">
                                    <Text color="textInverted" fontWeight="bold" fontSize={13}>Login</Text>
                                </Box>
                            </TouchableOpacity>
                        )}
                    </Box>
                </Box>

                {/* Filter Bar */}
                <Box borderBottomWidth={1} borderBottomColor="gray200">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 12, gap: 10 }}>
                        {/* Type Filters */}
                        {OFFER_TYPES.map((type) => (
                            <TouchableOpacity
                                key={type.value}
                                onPress={() => setSelectedType(type.value)}
                            >
                                <Box
                                    paddingHorizontal="m"
                                    paddingVertical="s"
                                    borderRadius="l"
                                    backgroundColor={selectedType === type.value ? 'primary' : 'offWhite'}
                                    borderWidth={1}
                                    borderColor={selectedType === type.value ? 'primary' : 'gray'}
                                >
                                    <Text
                                        color={selectedType === type.value ? 'white' : 'textMuted'}
                                        fontWeight="700"
                                        fontSize={13}
                                    >
                                        {type.label}
                                    </Text>
                                </Box>
                            </TouchableOpacity>
                        ))}

                        <Box width={1} height={20} backgroundColor="gray" marginHorizontal="xs" alignSelf="center" />

                        {/* Category Filters */}
                        {(categories || []).map((cat: any) => (
                            <TouchableOpacity
                                key={cat.id}
                                onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                            >
                                <Box
                                    paddingHorizontal="m"
                                    paddingVertical="s"
                                    borderRadius="l"
                                    backgroundColor={selectedCategory === cat.id ? 'secondary' : 'offWhite'}
                                    borderWidth={1}
                                    borderColor={selectedCategory === cat.id ? 'secondary' : 'gray'}
                                >
                                    <Text
                                        color={selectedCategory === cat.id ? 'white' : 'textMuted'}
                                        fontWeight="700"
                                        fontSize={13}
                                    >
                                        {cat.name}
                                    </Text>
                                </Box>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Box>
            </Box>

            {/* Results Area - Max Width */}
            <Box width="100%" flex={1} maxWidth={1200}>
                {isLoading ? (
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
                                    {debouncedQuery || selectedCategory || selectedType !== 'all'
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
        </Box>
    );
}
