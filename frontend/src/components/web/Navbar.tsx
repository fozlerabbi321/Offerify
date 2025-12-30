import React, { useState } from 'react';
import Box from '../ui/Box';
import Text from '../ui/Text';
import { useRouter, usePathname } from 'expo-router';
import { TouchableOpacity, TextInput, Platform } from 'react-native';
import { useLocationStore } from '../../store/location.store';
import { useAuthStore } from '../../store/auth.store';
import { useSearchStore } from '../../store/search.store';
import LocationPickerModal from '../home/LocationPickerModal';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../../theme/theme';

const Navbar = () => {
    const theme = useTheme<Theme>();
    const { cityName } = useLocationStore();
    const { user, isAuthenticated } = useAuthStore();
    const { query, setQuery } = useSearchStore();
    const [isLocationModalVisible, setLocationModalVisible] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const isSearchPage = pathname.includes('/search');

    const getInitials = (email: string) => {
        return email.substring(0, 1).toUpperCase();
    };

    return (
        <Box
            height={70}
            backgroundColor="white"
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            style={{
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.gray200,
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
            } as any}
        >
            <Box
                width="100%"
                maxWidth={1200}
                flexDirection="row"
                alignItems="center"
                paddingHorizontal="l"
            >
                {/* Search Box - Centered/Main */}
                <Box flex={1} flexDirection="row" alignItems="center">
                    <Box
                        flex={1}
                        maxWidth={isSearchPage ? 800 : 700}
                        height={46}
                        backgroundColor="offWhite"
                        borderRadius="l"
                        flexDirection="row"
                        alignItems="center"
                        paddingHorizontal="m"
                        borderWidth={1}
                        borderColor={isSearchPage ? 'primary' : 'gray'}
                        style={{ transition: 'all 0.2s ease' } as any}
                    >
                        <Ionicons name="search-outline" size={20} color={theme.colors.grayMedium} />
                        {isSearchPage ? (
                            <TextInput
                                style={{
                                    flex: 1,
                                    marginLeft: 8,
                                    fontSize: 16,
                                    color: theme.colors.text,
                                    outlineStyle: 'none',
                                } as any}
                                placeholder="What are you looking for?"
                                value={query}
                                onChangeText={setQuery}
                                autoFocus
                                placeholderTextColor={theme.colors.grayMedium}
                            />
                        ) : (
                            <TouchableOpacity
                                onPress={() => router.push('/(tabs)/search')}
                                style={{ flex: 1, height: '100%', justifyContent: 'center' }}
                            >
                                <Text color="grayMedium" marginLeft="s" fontSize={15}>Search for amazing deals near you...</Text>
                            </TouchableOpacity>
                        )}

                        {isSearchPage && (
                            <TouchableOpacity onPress={() => { }}>
                                <Box
                                    width={40}
                                    height={40}
                                    borderRadius="m"
                                    backgroundColor="primary"
                                    alignItems="center"
                                    justifyContent="center"
                                    marginRight={-12}
                                >
                                    <Ionicons name="search" size={20} color="white" />
                                </Box>
                            </TouchableOpacity>
                        )}
                    </Box>
                </Box>

                {/* Right Section - Location & User */}
                <Box
                    flexDirection="row"
                    alignItems="center"
                    gap="m"
                    marginLeft="l"
                >
                    {!isSearchPage && (
                        <>
                            <TouchableOpacity onPress={() => setLocationModalVisible(true)}>
                                <Box
                                    paddingHorizontal="m"
                                    paddingVertical="s"
                                    backgroundColor="accent2"
                                    borderRadius="l"
                                    flexDirection="row"
                                    alignItems="center"
                                >
                                    <Ionicons name="location" size={16} color={theme.colors.primary} />
                                    <Text marginLeft="s" fontWeight="700" color="primary">{cityName}</Text>
                                    <Ionicons name="chevron-down" size={14} color={theme.colors.primary} style={{ marginLeft: 4 }} />
                                </Box>
                            </TouchableOpacity>

                            <LocationPickerModal
                                visible={isLocationModalVisible}
                                onClose={() => setLocationModalVisible(false)}
                            />
                        </>
                    )}

                    {/* Auth Section - Always Show */}
                    {isAuthenticated && user ? (
                        <TouchableOpacity onPress={() => router.push('/(tabs)/account')}>
                            <Box
                                width={40}
                                height={40}
                                borderRadius="full"
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
                        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                            <Box
                                paddingHorizontal="l"
                                paddingVertical="s"
                                backgroundColor="primary"
                                borderRadius="l"
                            >
                                <Text color="textInverted" fontWeight="bold">Login</Text>
                            </Box>
                        </TouchableOpacity>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default Navbar;
