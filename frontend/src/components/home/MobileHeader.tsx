import React from 'react';
import Box from '../ui/Box';
import Text from '../ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { Platform, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../../theme/theme';

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
            safeAreaTop
        >
            {variant === 'home' ? (
                <>
                    {/* App Icon / Letter */}
                    <Box
                        width={32}
                        height={32}
                        borderRadius={16}
                        backgroundColor="primary"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Text variant="body" color="textInverted" fontWeight="bold" fontSize={18}>O</Text>
                    </Box>

                    {/* Location Selector */}
                    <TouchableOpacity>
                        <Box flexDirection="row" alignItems="center" backgroundColor="offWhite" paddingHorizontal="m" paddingVertical="s" borderRadius={20}>
                            <Ionicons name="map" size={16} color={theme.colors.primary} />
                            <Text variant="body" fontSize={14} marginLeft="s" fontWeight="600">Dhaka, Bangladesh</Text>
                            <Ionicons name="chevron-down" size={14} color={theme.colors.darkGray} style={{ marginLeft: 4 }} />
                        </Box>
                    </TouchableOpacity>

                    {/* Search Icon */}
                    <TouchableOpacity>
                        <Box width={36} height={36} backgroundColor="offWhite" borderRadius={18} justifyContent="center" alignItems="center">
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
                        <TouchableOpacity>
                            <Box width={36} height={36} backgroundColor="offWhite" borderRadius={18} justifyContent="center" alignItems="center">
                                <Ionicons name="search" size={20} color={theme.colors.darkGray} />
                            </Box>
                        </TouchableOpacity>
                        {/* Notification Icon */}
                        <TouchableOpacity>
                            <Box width={36} height={36} backgroundColor="offWhite" borderRadius={18} justifyContent="center" alignItems="center">
                                <Ionicons name="notifications" size={20} color={theme.colors.darkGray} />
                            </Box>
                        </TouchableOpacity>
                    </Box>
                </>
            )}
        </Box>
    );
};

export default MobileHeader;
