import React, { useEffect, useState } from 'react';
import { TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../../theme/theme';
import Box from '../ui/Box';
import Text from '../ui/Text';
import { useSearchStore } from '../../store/search.store';
import { useLocationStore } from '../../store/location.store';
import api from '../../lib/api';

const SearchSuggestions = () => {
    const theme = useTheme<Theme>();
    const { query, setQuery, suggestions, setSuggestions } = useSearchStore();
    const { cityId } = useLocationStore();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.length < 2) {
                setSuggestions([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await api.get('/search/suggestions', {
                    params: { q: query, cityId }
                });
                setSuggestions(response.data);
            } catch (error) {
                console.error('Failed to fetch suggestions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [query, cityId]);

    if (query.length < 2) return null;

    if (isLoading && suggestions.length === 0) {
        return (
            <Box backgroundColor="mainBackground" padding="m" alignItems="center">
                <ActivityIndicator color={theme.colors.primary} />
            </Box>
        );
    }

    if (suggestions.length === 0 && !isLoading) return null;

    return (
        <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            backgroundColor="mainBackground"
            zIndex={100}
        >
            <ScrollView keyboardShouldPersistTaps="handled">
                <Box paddingVertical="s">
                    {suggestions.map((suggestion, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                setQuery(suggestion);
                                setSuggestions([]);
                            }}
                        >
                            <Box
                                flexDirection="row"
                                alignItems="center"
                                paddingHorizontal="m"
                                paddingVertical="m"
                                borderBottomWidth={1}
                                borderBottomColor="gray200"
                            >
                                <Ionicons name="search-outline" size={18} color={theme.colors.grayMedium} />
                                <Text marginLeft="m" color="text" fontSize={16}>{suggestion}</Text>
                                <Box flex={1} />
                                <Ionicons name="arrow-forward-outline" size={16} color={theme.colors.grayLight} />
                            </Box>
                        </TouchableOpacity>
                    ))}
                </Box>
            </ScrollView>
        </Box>
    );
};

export default SearchSuggestions;
