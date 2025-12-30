import React from 'react';
import Box from '../ui/Box';
import Text from '../ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { Platform, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../../theme/theme';
import { useLocationStore } from '../../store/location.store';
import LocationPickerModal from './LocationPickerModal';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/auth.store';
import LoginRequiredModal from '../auth/LoginRequiredModal';
import Logo from '../ui/Logo';

interface MobileHeaderProps {
    title?: string;
    variant?: 'home' | 'standard';
    onBack?: () => void;
}

const MobileHeader = ({ title, variant = 'standard', onBack }: MobileHeaderProps) => {
    const theme = useTheme<Theme>();
    const isWeb = Platform.OS === 'web';
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const { cityName } = useLocationStore();
    const { isAuthenticated } = useAuthStore();
    const [isLocationModalVisible, setLocationModalVisible] = useState(false);
    const [isLoginModalVisible, setLoginModalVisible] = useState(false);
    const router = useRouter();

    if (isWeb && isDesktop) return null; // Only hide on Desktop Web

    return (
        <Box
            paddingHorizontal="m"
            paddingVertical="s"
            backgroundColor="mainBackground"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            shadowColor="black"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.05}
            shadowRadius={4}
            elevation={2}
            zIndex={100}
        >
            {variant === 'home' ? (
                <>
                    {/* App Icon / Letter - Left Side */}
                    <Box width={40}>
                        <Logo variant="icon" size="m" />
                    </Box>

                    {/* Location Selector - Centered / Wide (Matches Screenshot) */}
                    <Box flex={1} alignItems="center" marginHorizontal="xs">
                        <TouchableOpacity onPress={() => setLocationModalVisible(true)} style={{ width: '100%' }}>
                            <Box
                                flexDirection="row"
                                alignItems="center"
                                justifyContent="center"
                                backgroundColor="white"
                                paddingHorizontal="m"
                                paddingVertical="s"
                                borderRadius="l"
                                width="100%"
                                borderWidth={1}
                                borderColor="gray"
                            >
                                <Ionicons name="location" size={16} color={theme.colors.primary} />
                                <Text
                                    variant="body"
                                    fontSize={14}
                                    marginLeft="xs"
                                    fontWeight="600"
                                    color="text"
                                    numberOfLines={1}
                                >
                                    {cityName}
                                </Text>
                                <Ionicons name="chevron-down" size={14} color={theme.colors.grayMedium} style={{ marginLeft: 4 }} />
                            </Box>
                        </TouchableOpacity>
                    </Box>

                    <LocationPickerModal
                        visible={isLocationModalVisible}
                        onClose={() => setLocationModalVisible(false)}
                    />

                    {/* Search Icon - Right Side */}
                    <TouchableOpacity onPress={() => router.push('/search')}>
                        <Box width={40} height={40} backgroundColor="offWhite" borderRadius={20} justifyContent="center" alignItems="center">
                            <Ionicons name="search" size={20} color={theme.colors.darkGray} />
                        </Box>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <Box flexDirection="row" alignItems="center">
                        {/* Back Icon (Native Only) */}
                        {!isWeb && onBack && (
                            <TouchableOpacity onPress={onBack} style={{ marginRight: 8 }}>
                                <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        )}
                        <Text variant="subheader" fontSize={20}>{title}</Text>
                    </Box>

                    <Box flexDirection="row" gap="s">
                        {/* Search Icon */}
                        <TouchableOpacity onPress={() => router.push('/search')}>
                            <Box width={36} height={36} backgroundColor="offWhite" borderRadius={18} justifyContent="center" alignItems="center">
                                <Ionicons name="search" size={20} color={theme.colors.darkGray} />
                            </Box>
                        </TouchableOpacity>
                        {/* Notification Icon */}
                        <TouchableOpacity onPress={() => {
                            if (!isAuthenticated) {
                                setLoginModalVisible(true);
                            } else {
                                // TODO: Handle notification press
                            }
                        }}>
                            <Box width={36} height={36} backgroundColor="offWhite" borderRadius={18} justifyContent="center" alignItems="center">
                                <Ionicons name="notifications" size={20} color={theme.colors.darkGray} />
                            </Box>
                        </TouchableOpacity>
                    </Box>
                </>
            )
            }

            <LoginRequiredModal
                visible={isLoginModalVisible}
                onClose={() => setLoginModalVisible(false)}
                onLogin={() => {
                    setLoginModalVisible(false);
                    router.push('/(auth)/login');
                }}
            />
        </Box >
    );
};

export default MobileHeader;
