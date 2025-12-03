import React, { useState, useEffect } from 'react';
import { FlatList, TextInput, TouchableOpacity } from 'react-native';
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
    const response = await api.get('/offers', { params: { cityId, search: query } });
    return response.data;
};

export default function SearchScreen() {
    const theme = useTheme<Theme>();
    const router = useRouter();
    const { cityId } = useLocationStore();
    const { user, isAuthenticated } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedQuery = useDebounce(searchQuery, 500);

    const { data: results, isLoading } = useQuery({
        queryKey: ['search', debouncedQuery, cityId],
        queryFn: () => fetchSearchResults(debouncedQuery, cityId),
        enabled: !!debouncedQuery,
    });

    const getInitials = (email: string) => {
        return email.substring(0, 1).toUpperCase();
    };

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

                {/* Login/Profile Avatar */}
                {isAuthenticated && user ? (
                    <TouchableOpacity onPress={() => router.push('/(tabs)/account')} style={{ marginLeft: 12 }}>
                        <Box
                            width={40}
                            height={40}
                            borderRadius={20}
                            backgroundColor="primary"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Text color="textInverted" fontWeight="bold" fontSize={16}>
                                {getInitials(user.email)}
                            </Text>
                        </Box>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={{ marginLeft: 12 }}>
                        <Box
                            paddingHorizontal="m"
                            paddingVertical="s"
                            backgroundColor="primary"
                            borderRadius={8}
                        >
                            <Text color="textInverted" fontWeight="600" fontSize={14}>Login</Text>
                        </Box>
                    </TouchableOpacity>
                )}
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
