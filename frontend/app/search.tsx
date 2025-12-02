import React, { useState, useEffect } from 'react';
import { FlatList, TextInput, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../src/theme/theme';
import Box from '../src/components/ui/Box';
import Text from '../src/components/ui/Text';
import api from '../src/lib/api';
import OfferCard from '../src/components/home/OfferCard';
import { useLocationStore } from '../src/store/location.store';
import ResponsiveGrid from '../src/components/ui/ResponsiveGrid';
import { ScrollView } from 'react-native';

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

const fetchSearchResults = async (query: string, cityId: number | null) => {
    if (!query) return [];
    // Assuming backend supports ?search=... or we filter on frontend for now if not
    // Ideally: GET /offers?search=query&cityId=...
    // If backend doesn't support search param yet, we might need to fetch all and filter (inefficient but works for prototype)
    // Let's assume we pass a 'search' param. If backend ignores it, we'll get all offers, which is okay for now.
    const response = await api.get('/offers', { params: { cityId, search: query } });
    return response.data;
};

export default function SearchScreen() {
    const theme = useTheme<Theme>();
    const router = useRouter();
    const { cityId } = useLocationStore();
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedQuery = useDebounce(searchQuery, 500);

    const { data: results, isLoading } = useQuery({
        queryKey: ['search', debouncedQuery, cityId],
        queryFn: () => fetchSearchResults(debouncedQuery, cityId),
        enabled: !!debouncedQuery,
    });

    return (
        <Box flex={1} backgroundColor="mainBackground">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <Box flexDirection="row" alignItems="center" padding="m" paddingTop="l" borderBottomWidth={1} borderBottomColor="gray">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Box
                    flex={1}
                    marginLeft="m"
                    flexDirection="row"
                    alignItems="center"
                    backgroundColor="offWhite"
                    borderRadius={12}
                    paddingHorizontal="m"
                    height={48}
                    borderWidth={1}
                    borderColor="gray"
                >
                    <Ionicons name="search" size={20} color={theme.colors.grayMedium} />
                    <TextInput
                        style={{ flex: 1, marginLeft: 8, color: theme.colors.text, height: '100%', outlineStyle: 'none' } as any}
                        placeholder="Search offers..."
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
            </Box>

            {/* Results */}
            {isLoading ? (
                <Box flex={1} justifyContent="center" alignItems="center">
                    <Text>Searching...</Text>
                </Box>
            ) : (
                <ScrollView contentContainerStyle={{ padding: 16 }}>
                    {(!results || results.length === 0) ? (
                        debouncedQuery ? (
                            <Box flex={1} justifyContent="center" alignItems="center" marginTop="xl">
                                <Text color="gray">No results found.</Text>
                            </Box>
                        ) : (
                            <Box flex={1} justifyContent="center" alignItems="center" marginTop="xl">
                                <Text color="gray">Type to search offers nearby.</Text>
                            </Box>
                        )
                    ) : (
                        <ResponsiveGrid
                            data={results}
                            renderItem={(item) => <OfferCard offer={item} />}
                            itemMinWidth={300}
                            gap={16}
                        />
                    )}
                </ScrollView>
            )}
        </Box>
    );
}
