import React from 'react';
import { TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Container from '../../src/components/ui/Container';
import Text from '../../src/components/ui/Text';
import Box from '../../src/components/ui/Box';
import { useAuthStore } from '../../src/store/auth.store';
import theme from '../../src/theme/theme';
import AuthWrapper from '../../src/components/auth/AuthWrapper';

interface MenuItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    color?: string;
    isDanger?: boolean;
}

const MenuItem = ({ icon, label, onPress, color, isDanger }: MenuItemProps) => (
    <TouchableOpacity onPress={onPress}>
        <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            paddingVertical="m"
            borderBottomWidth={1}
            borderBottomColor="gray200"
        >
            <Box flexDirection="row" alignItems="center">
                <Box
                    width={32}
                    height={32}
                    borderRadius={8}
                    backgroundColor={isDanger ? 'errorLight' : 'secondaryLight'}
                    alignItems="center"
                    justifyContent="center"
                    marginRight="m"
                >
                    <Ionicons
                        name={icon}
                        size={18}
                        color={isDanger ? theme.colors.error : (color || theme.colors.text)}
                    />
                </Box>
                <Text variant="body" color={isDanger ? 'error' : 'text'}>{label}</Text>
            </Box>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.gray400} />
        </Box>
    </TouchableOpacity>
);

export default function AccountScreen() {
    return (
        <AuthWrapper>
            <AccountScreenContent />
        </AuthWrapper>
    );
}

function AccountScreenContent() {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    if (!user) return null; // Should not reach here due to AuthWrapper

    const getInitials = (nameOrEmail: string) => {
        return nameOrEmail
            ? nameOrEmail.substring(0, 2).toUpperCase()
            : 'U';
    };

    return (
        <Container>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Header Section */}
                <Box alignItems="center" paddingVertical="xl" borderBottomWidth={1} borderBottomColor="gray200">
                    <Box
                        width={80}
                        height={80}
                        borderRadius={40}
                        backgroundColor="primary"
                        alignItems="center"
                        justifyContent="center"
                        marginBottom="m"
                        overflow="hidden"
                    >
                        {user.avatarUrl ? (
                            <Image
                                source={{ uri: user.avatarUrl }}
                                style={{ width: 80, height: 80 }}
                                resizeMode="cover"
                            />
                        ) : (
                            <Text variant="header" color="textInverted" fontSize={32}>
                                {getInitials(user.name || user.email)}
                            </Text>
                        )}
                    </Box>
                    <Text variant="header">{user.name || user.email.split('@')[0]}</Text>
                    <Text variant="body" color="gray500">{user.email}</Text>
                    <Box
                        backgroundColor={user.role === 'VENDOR' ? 'purpleLight' : 'secondaryLight'}
                        paddingHorizontal="m"
                        paddingVertical="xs"
                        borderRadius={16}
                        marginTop="s"
                    >
                        <Text
                            variant="caption"
                            color={user.role === 'VENDOR' ? 'purpleDark' : 'secondary'}
                            fontWeight="bold"
                        >
                            {user.role}
                        </Text>
                    </Box>
                </Box>

                {/* Vendor Action Section - Only show on native mobile */}
                {Platform.OS !== 'web' && (
                    <Box padding="m">
                        {user.role === 'CUSTOMER' ? (
                            <TouchableOpacity onPress={() => router.push('/vendor/onboarding')}>
                                <Box
                                    padding="m"
                                    backgroundColor="secondary"
                                    borderRadius={12}
                                    flexDirection="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    style={{ shadowColor: theme.colors.secondary, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
                                >
                                    <Box>
                                        <Text color="textInverted" fontWeight="bold" fontSize={16}>Become a Seller</Text>
                                        <Text color="textInverted" fontSize={12} opacity={0.9}>Start selling your offers today</Text>
                                    </Box>
                                    <Ionicons name="arrow-forward-circle" size={32} color="white" />
                                </Box>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => router.push('/vendor')}>
                                <Box
                                    padding="m"
                                    backgroundColor="primary"
                                    borderRadius={12}
                                    flexDirection="row"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Ionicons name="storefront" size={20} color="white" style={{ marginRight: 8 }} />
                                    <Text color="textInverted" fontWeight="bold">Switch to Vendor Dashboard</Text>
                                </Box>
                            </TouchableOpacity>
                        )}
                    </Box>
                )}

                {/* Menu Actions */}
                <Box paddingHorizontal="m" marginTop="s">
                    <Text variant="subheader" marginBottom="s">General</Text>
                    <MenuItem
                        icon="person-outline"
                        label="My Profile"
                        onPress={() => router.push('/profile')}
                    />
                    <MenuItem
                        icon="heart-outline"
                        label="My Saved Items"
                        onPress={() => console.log('Saved Items')}
                    />
                    <MenuItem
                        icon="wallet-outline"
                        label="Wallet"
                        onPress={() => console.log('Wallet')}
                    />
                    <MenuItem
                        icon="storefront-outline"
                        label="Offerify Vendor"
                        onPress={() => {
                            if (user.role === 'VENDOR') {
                                router.push('/vendor');
                            } else {
                                router.push('/vendor/onboarding');
                            }
                        }}
                    />
                    <MenuItem
                        icon="settings-outline"
                        label="Settings"
                        onPress={() => console.log('Settings')}
                    />
                </Box>

                <Box paddingHorizontal="m" marginTop="l">
                    <Text variant="subheader" marginBottom="s">Support</Text>
                    <MenuItem
                        icon="help-circle-outline"
                        label="Help & Support"
                        onPress={() => console.log('Help')}
                    />
                    <MenuItem
                        icon="log-out-outline"
                        label="Logout"
                        onPress={logout}
                        isDanger
                    />
                </Box>
            </ScrollView>
        </Container>
    );
}
