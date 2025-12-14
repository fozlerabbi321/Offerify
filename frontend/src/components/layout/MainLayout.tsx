import React from 'react';
import { Platform, useWindowDimensions, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@shopify/restyle';
import { Ionicons } from '@expo/vector-icons';

import Box from '../ui/Box';
import Text from '../ui/Text';
import Sidebar from '../web/Sidebar';
import Navbar from '../web/Navbar';
import { Theme } from '../../theme/theme';

interface MainLayoutProps {
    children: React.ReactNode;
    title?: string;
    showBackButton?: boolean;
}

/**
 * MainLayout Component
 * Provides consistent navigation (Sidebar/BottomNav) for pages outside the (tabs) group.
 * Use this wrapper on screens like Offer Details, Profile Edit, etc.
 */
const MainLayout = ({ children, title, showBackButton = true }: MainLayoutProps) => {
    const theme = useTheme<Theme>();
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const isWeb = Platform.OS === 'web';
    const router = useRouter();

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.push('/(tabs)');
        }
    };

    return (
        <Box flex={1} backgroundColor="mainBackground" flexDirection={isWeb && isDesktop ? 'row' : 'column'}>
            {/* Desktop: Sidebar */}
            {isWeb && isDesktop && <Sidebar />}

            <Box flex={1}>
                {/* Desktop: Top Navbar */}
                {isWeb && isDesktop && <Navbar />}

                {/* Mobile: Custom Header with Back Button */}
                {!isDesktop && (
                    <Box
                        paddingHorizontal="m"
                        paddingVertical="s"
                        backgroundColor="mainBackground"
                        flexDirection="row"
                        alignItems="center"
                        shadowColor="black"
                        shadowOffset={{ width: 0, height: 2 }}
                        shadowOpacity={0.05}
                        shadowRadius={4}
                        elevation={2}
                        zIndex={100}
                        safeAreaTop
                    >
                        {showBackButton && (
                            <TouchableOpacity onPress={handleBack} style={{ marginRight: 12 }}>
                                <Box
                                    width={36}
                                    height={36}
                                    backgroundColor="offWhite"
                                    borderRadius={18}
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
                                </Box>
                            </TouchableOpacity>
                        )}
                        {title && (
                            <Text variant="subheader" fontSize={18} numberOfLines={1} style={{ flex: 1 }}>
                                {title}
                            </Text>
                        )}
                    </Box>
                )}

                {/* Main Content */}
                <Box flex={1}>
                    {children}
                </Box>

                {/* Mobile: Bottom Tab Bar (simplified version for non-tab screens) */}
                {!isDesktop && (
                    <Box
                        flexDirection="row"
                        justifyContent="space-around"
                        alignItems="center"
                        backgroundColor="mainBackground"
                        paddingVertical="s"
                        borderTopWidth={1}
                        borderTopColor="gray"
                        safeAreaBottom
                    >
                        <TouchableOpacity onPress={() => router.push('/(tabs)')}>
                            <Box alignItems="center" padding="xs">
                                <Ionicons name="home-outline" size={24} color={theme.colors.grayMedium} />
                                <Text variant="caption" color="grayMedium">Home</Text>
                            </Box>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/map')}>
                            <Box alignItems="center" padding="xs">
                                <Ionicons name="map-outline" size={24} color={theme.colors.grayMedium} />
                                <Text variant="caption" color="grayMedium">Map</Text>
                            </Box>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/wallet')}>
                            <Box alignItems="center" padding="xs">
                                <Box
                                    width={48}
                                    height={48}
                                    borderRadius={24}
                                    backgroundColor="secondary"
                                    alignItems="center"
                                    justifyContent="center"
                                    style={{ marginBottom: -8 }}
                                >
                                    <Ionicons name="add" size={28} color="white" />
                                </Box>
                            </Box>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/saved')}>
                            <Box alignItems="center" padding="xs">
                                <Ionicons name="heart-outline" size={24} color={theme.colors.grayMedium} />
                                <Text variant="caption" color="grayMedium">Saved</Text>
                            </Box>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/account')}>
                            <Box alignItems="center" padding="xs">
                                <Ionicons name="person-outline" size={24} color={theme.colors.grayMedium} />
                                <Text variant="caption" color="grayMedium">Account</Text>
                            </Box>
                        </TouchableOpacity>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default MainLayout;
