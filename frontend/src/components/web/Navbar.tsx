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
import Logo from '../ui/Logo';

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
            position="relative"
        >
            {/* Left Section - Logo */}
            <TouchableOpacity onPress={() => router.push('/')}>
                <Logo variant="full" size="m" />
            </TouchableOpacity>
            {/* Search Box - Centered */}
            <TouchableOpacity
                onPress={() => router.push('/(tabs)/search')}
                style={{ width: '100%', maxWidth: 500 }}
            >
                <Box
                    height={40}
                    backgroundColor="offWhite"
                    borderRadius={8}
                    flexDirection="row"
                    alignItems="center"
                    paddingHorizontal="m"
                    borderWidth={1}
                    borderColor="gray"
                >
                    <Ionicons name="search" size={18} color={theme.colors.grayMedium} />
                    <Text color="grayMedium" marginLeft="s" fontSize={14}>Search offers...</Text>
                </Box>
            </TouchableOpacity>

            {/* Right Section - Location & User */}
            <Box
                flexDirection="row"
                alignItems="center"
                gap="m"
            >
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
