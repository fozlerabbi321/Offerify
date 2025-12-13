import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { vendorProfileService } from '../../../src/services/vendor-profile.service';
import Box from '../../../src/components/ui/Box';
import Text from '../../../src/components/ui/Text';
import theme from '../../../src/theme/theme';

interface VendorProfile {
    id: string;
    businessName: string;
    description: string;
    logoUrl: string;
    coverImageUrl: string;
    contactPhone: string;
    location: {
        type: string;
        coordinates: number[];
    };
    ratingAvg: number;
    reviewCount: number;
    followerCount: number;
}

export default function VendorProfileScreen() {
    const router = useRouter();
    const [profile, setProfile] = useState<VendorProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await vendorProfileService.getMyProfile();
            setProfile(data as any);
        } catch (error) {
            console.error('Failed to load vendor profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Box flex={1} backgroundColor="mainBackground" justifyContent="center" alignItems="center">
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </Box>
        );
    }

    if (!profile) {
        return (
            <Box flex={1} backgroundColor="mainBackground" justifyContent="center" alignItems="center" padding="m">
                <Text variant="body" color="gray500" marginBottom="m">Could not load profile</Text>
                <TouchableOpacity onPress={loadProfile}>
                    <Box backgroundColor="primary" paddingHorizontal="m" paddingVertical="s" borderRadius={8}>
                        <Text color="textInverted" fontWeight="bold">Retry</Text>
                    </Box>
                </TouchableOpacity>
            </Box>
        );
    }

    return (
        <Box flex={1} backgroundColor="mainBackground">
            <Stack.Screen options={{
                headerShown: true,
                title: 'Vendor Profile',
                headerBackTitle: 'Back',
            }} />

            <ScrollView style={{ flex: 1 }}>
                {/* Cover Image Header */}
                <Box
                    height={220}
                    backgroundColor="primary"
                    position="relative"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 12,
                    }}
                >
                    {profile.coverImageUrl ? (
                        <Image
                            source={{ uri: profile.coverImageUrl }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                        />
                    ) : (
                        <Box flex={1} justifyContent="center" alignItems="center">
                            <Ionicons name="image-outline" size={64} color="white" opacity={0.3} />
                        </Box>
                    )}

                    {/* Edit Button */}
                    <TouchableOpacity
                        onPress={() => router.push('/vendor/profile/edit')}
                        style={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                        }}
                    >
                        <Box
                            backgroundColor="white"
                            width={40}
                            height={40}
                            borderRadius={20}
                            justifyContent="center"
                            alignItems="center"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.2,
                                shadowRadius: 4,
                            }}
                        >
                            <Ionicons name="pencil" size={20} color={theme.colors.primary} />
                        </Box>
                    </TouchableOpacity>
                </Box>

                {/* Profile Info Section */}
                <Box paddingHorizontal="m" style={{ marginTop: -40 }}>
                    {/* Logo and Stats Row */}
                    <Box flexDirection="row" justifyContent="space-between" alignItems="flex-end" marginBottom="m">
                        {/* Logo */}
                        <Box
                            width={100}
                            height={100}
                            borderRadius={20}
                            backgroundColor="white"
                            padding="xs"
                            style={{
                                borderWidth: 4,
                                borderColor: theme.colors.white,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.15,
                                shadowRadius: 8,
                            }}
                        >
                            <Box flex={1} backgroundColor="gray200" borderRadius={16} overflow="hidden" justifyContent="center" alignItems="center">
                                {profile.logoUrl ? (
                                    <Image
                                        source={{ uri: profile.logoUrl }}
                                        style={{ width: '100%', height: '100%' }}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <Text variant="header" fontSize={36} color="gray400">
                                        {profile.businessName?.charAt(0) || 'V'}
                                    </Text>
                                )}
                            </Box>
                        </Box>

                        {/* Stats */}
                        <Box flexDirection="row" gap="l" marginBottom="xs">
                            <StatItem label="Followers" value={profile.followerCount || 0} />
                            <StatItem
                                label="Rating"
                                value={profile.ratingAvg?.toFixed(1) || '0.0'}
                                icon="star"
                            />
                        </Box>
                    </Box>

                    {/* Business Name */}
                    <Text variant="header" fontSize={26} marginBottom="xs">
                        {profile.businessName}
                    </Text>

                    {/* Location */}
                    {profile.location && profile.location.coordinates && (
                        <Box flexDirection="row" alignItems="center" marginBottom="m">
                            <Ionicons name="location-sharp" size={16} color={theme.colors.gray500} />
                            <Text variant="caption" color="gray500" marginLeft="xs">
                                Lat: {profile.location.coordinates[1].toFixed(4)}, Long: {profile.location.coordinates[0].toFixed(4)}
                            </Text>
                        </Box>
                    )}

                    {/* Divider */}
                    <Box height={1} backgroundColor="gray200" marginVertical="m" />

                    {/* About Section */}
                    <Box marginBottom="l">
                        <Text variant="subheader" fontSize={18} marginBottom="m">
                            About
                        </Text>
                        <Box
                            backgroundColor="white"
                            borderRadius={12}
                            padding="m"
                            style={{
                                ...(Platform.OS === 'web' && {
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                }),
                            }}
                        >
                            <Text variant="body" color="text" lineHeight={24}>
                                {profile.description || 'No description provided.'}
                            </Text>
                        </Box>
                    </Box>

                    {/* Contact Info Section */}
                    <Box marginBottom="xl">
                        <Text variant="subheader" fontSize={18} marginBottom="m">
                            Contact Information
                        </Text>
                        <Box
                            backgroundColor="white"
                            borderRadius={12}
                            padding="m"
                            flexDirection="row"
                            alignItems="center"
                            style={{
                                ...(Platform.OS === 'web' && {
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                }),
                            }}
                        >
                            <Box
                                width={40}
                                height={40}
                                borderRadius={20}
                                backgroundColor="secondaryLight"
                                justifyContent="center"
                                alignItems="center"
                                marginRight="m"
                            >
                                <Ionicons name="call" size={20} color={theme.colors.secondary} />
                            </Box>
                            <Box flex={1}>
                                <Text variant="caption" color="gray500" marginBottom="xs">
                                    Phone Number
                                </Text>
                                <Text variant="body" fontWeight="600">
                                    {profile.contactPhone || 'Not set'}
                                </Text>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </ScrollView>
        </Box>
    );
}

// Helper Component for Stats
function StatItem({ label, value, icon }: { label: string, value: string | number, icon?: string }) {
    return (
        <Box alignItems="center">
            <Box flexDirection="row" alignItems="center" marginBottom="xs">
                {icon && <Ionicons name={icon as any} size={16} color={theme.colors.secondary} style={{ marginRight: 4 }} />}
                <Text variant="body" fontWeight="bold" fontSize={18} color="text">
                    {value}
                </Text>
            </Box>
            <Text variant="caption" color="gray500" fontSize={11}>
                {label}
            </Text>
        </Box>
    );
}
