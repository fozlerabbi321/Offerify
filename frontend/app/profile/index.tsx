import React, { useEffect } from 'react';
import { ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/auth.store';
import Box from '../../src/components/ui/Box';
import Text from '../../src/components/ui/Text';
import theme from '../../src/theme/theme';

export default function ProfileDetailsScreen() {
    const router = useRouter();
    const { user, refreshUser } = useAuthStore();

    useEffect(() => {
        refreshUser();
    }, []);

    const getInitials = (name: string) => {
        return name
            ? name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .substring(0, 2)
            : 'U';
    };

    return (
        <Box flex={1} backgroundColor="mainBackground">
            <Stack.Screen options={{
                headerShown: true,
                title: 'My Profile',
                headerBackTitle: 'Back'
            }} />

            <ScrollView style={{ flex: 1 }}>
                {/* Header Section with Gradient Background */}
                <Box
                    paddingVertical="xl"
                    paddingHorizontal="m"
                    backgroundColor="primary"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                    }}
                >
                    <Box alignItems="center">
                        <Box
                            width={100}
                            height={100}
                            borderRadius={50}
                            backgroundColor="white"
                            alignItems="center"
                            justifyContent="center"
                            marginBottom="m"
                            overflow="hidden"
                            style={{
                                borderWidth: 4,
                                borderColor: theme.colors.white,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.2,
                                shadowRadius: 4,
                            }}
                        >
                            {user?.avatarUrl ? (
                                <Image
                                    source={{ uri: user.avatarUrl }}
                                    style={{ width: '100%', height: '100%' }}
                                    resizeMode="cover"
                                />
                            ) : (
                                <Text variant="header" fontSize={36} color="primary">
                                    {getInitials(user?.name || user?.email || '')}
                                </Text>
                            )}
                        </Box>

                        <Text variant="header" fontSize={24} color="textInverted" marginBottom="xs">
                            {user?.name || user?.email?.split('@')[0] || 'User'}
                        </Text>
                        <Text variant="body" color="textInverted" opacity={0.9} marginBottom="s">
                            {user?.email}
                        </Text>

                        <Box
                            backgroundColor="white"
                            paddingHorizontal="m"
                            paddingVertical="xs"
                            borderRadius={20}
                        >
                            <Text
                                variant="caption"
                                color={user?.role === 'VENDOR' ? 'purpleDark' : 'secondary'}
                                fontWeight="bold"
                            >
                                {user?.role?.toUpperCase()}
                            </Text>
                        </Box>
                    </Box>
                </Box>

                {/* Action Buttons */}
                <Box paddingHorizontal="m" paddingTop="m" flexDirection="row" gap="s">
                    <TouchableOpacity
                        onPress={() => router.push('/profile/edit')}
                        style={{ flex: 1 }}
                    >
                        <Box
                            backgroundColor="primary"
                            paddingVertical="m"
                            borderRadius={12}
                            alignItems="center"
                            flexDirection="row"
                            justifyContent="center"
                            style={{
                                shadowColor: theme.colors.primary,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                            }}
                        >
                            <Ionicons name="create-outline" size={20} color="white" style={{ marginRight: 8 }} />
                            <Text color="textInverted" fontWeight="bold">Edit Profile</Text>
                        </Box>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/profile/change-password')}
                        style={{ flex: 1 }}
                    >
                        <Box
                            backgroundColor="white"
                            paddingVertical="m"
                            borderRadius={12}
                            alignItems="center"
                            flexDirection="row"
                            justifyContent="center"
                            style={{
                                borderWidth: 2,
                                borderColor: theme.colors.primary,
                            }}
                        >
                            <Ionicons name="lock-closed-outline" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                            <Text color="primary" fontWeight="bold">Password</Text>
                        </Box>
                    </TouchableOpacity>
                </Box>

                {/* Personal Information Card */}
                <Box padding="m">
                    <Text variant="subheader" marginBottom="m" color="text">
                        Personal Information
                    </Text>

                    <Box
                        backgroundColor="white"
                        borderRadius={16}
                        padding="m"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 8,
                            ...(Platform.OS === 'web' && {
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            }),
                        }}
                    >
                        <InfoRow
                            icon="person-outline"
                            label="Full Name"
                            value={user?.name || 'Not set'}
                        />
                        <Box height={1} backgroundColor="gray200" marginVertical="m" />

                        <InfoRow
                            icon="mail-outline"
                            label="Email Address"
                            value={user?.email || ''}
                        />
                        <Box height={1} backgroundColor="gray200" marginVertical="m" />

                        <InfoRow
                            icon="call-outline"
                            label="Phone Number"
                            value={user?.phone || 'Not set'}
                        />
                    </Box>
                </Box>

                {/* Account Stats Card */}
                <Box paddingHorizontal="m" marginBottom="xl">
                    <Text variant="subheader" marginBottom="m" color="text">
                        Account Overview
                    </Text>

                    <Box
                        backgroundColor="secondaryLight"
                        borderRadius={16}
                        padding="m"
                        flexDirection="row"
                        justifyContent="space-around"
                    >
                        <StatItem label="Member Since" value="2024" />
                        <Box width={1} backgroundColor="secondary" opacity={0.3} />
                        <StatItem label="Account Type" value={user?.role || 'Customer'} />
                    </Box>
                </Box>
            </ScrollView>
        </Box>
    );
}

// Helper Component for Info Rows
function InfoRow({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <Box flexDirection="row" alignItems="center">
            <Box
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor="secondaryLight"
                alignItems="center"
                justifyContent="center"
                marginRight="m"
            >
                <Ionicons name={icon} size={20} color={theme.colors.primary} />
            </Box>
            <Box flex={1}>
                <Text variant="caption" color="gray500" marginBottom="xs">
                    {label}
                </Text>
                <Text variant="body" color="text" fontWeight="600">
                    {value}
                </Text>
            </Box>
        </Box>
    );
}

// Helper Component for Stats
function StatItem({ label, value }: { label: string, value: string }) {
    return (
        <Box flex={1} alignItems="center">
            <Text variant="caption" color="secondary" marginBottom="xs">
                {label}
            </Text>
            <Text variant="body" color="secondary" fontWeight="bold">
                {value}
            </Text>
        </Box>
    );
}
