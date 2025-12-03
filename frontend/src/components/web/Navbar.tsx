import React from 'react';
import Box from '../ui/Box';
import Text from '../ui/Text';
import { Link, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { useLocationStore } from '../../store/location.store';
import { useAuthStore } from '../../store/auth.store';
import LocationPickerModal from '../home/LocationPickerModal';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../../theme/theme';

const Navbar = () => {
    const theme = useTheme<Theme>();
    const { cityName } = useLocationStore();
    const { user, isAuthenticated } = useAuthStore();
    const [isLocationModalVisible, setLocationModalVisible] = useState(false);
    const router = useRouter();

    const getInitials = (email: string) => {
        return email.substring(0, 1).toUpperCase();
    };

    return (
        <Box
            height={60}
            backgroundColor="white"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            paddingHorizontal="l"
            borderBottomWidth={1}
            borderBottomColor="gray"
        >
            <Box flexDirection="row" alignItems="center">
                <Text variant="header" fontSize={24} color="primary" marginRight="xl">Offerify</Text>
            </Box>

            <Box flexDirection="row" alignItems="center" gap="m">
                <TouchableOpacity onPress={() => setLocationModalVisible(true)}>
                    <Box padding="s" backgroundColor="offWhite" borderRadius={8} flexDirection="row" alignItems="center">
                        <Ionicons name="map" size={16} color={theme.colors.primary} />
                        <Text marginLeft="s" fontWeight="600">{cityName}</Text>
                        <Ionicons name="chevron-down" size={14} color={theme.colors.darkGray} style={{ marginLeft: 4 }} />
                    </Box>
                </TouchableOpacity>

                <LocationPickerModal
                    visible={isLocationModalVisible}
                    onClose={() => setLocationModalVisible(false)}
                />

                <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
                    <Box width={200} height={40} backgroundColor="offWhite" borderRadius={8} flexDirection="row" alignItems="center" paddingHorizontal="m">
                        <Ionicons name="search" size={16} color={theme.colors.darkGray} />
                        <Text color="darkGray" marginLeft="s">Search offers...</Text>
                    </Box>
                </TouchableOpacity>

                {/* Auth Section */}
                {isAuthenticated && user ? (
                    <TouchableOpacity onPress={() => router.push('/(tabs)/account')}>
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
                    <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                        <Box
                            paddingHorizontal="l"
                            paddingVertical="s"
                            backgroundColor="primary"
                            borderRadius={8}
                        >
                            <Text color="textInverted" fontWeight="600">Login</Text>
                        </Box>
                    </TouchableOpacity>
                )}
            </Box>
        </Box>
    );
};

export default Navbar;
