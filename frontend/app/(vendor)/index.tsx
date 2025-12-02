import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Box from '../../src/components/ui/Box';
import Text from '../../src/components/ui/Text';
import api from '../../src/lib/api';
import theme from '../../src/theme/theme';

const fetchStats = async () => {
    const response = await api.get('/vendors/stats');
    return response.data.data;
};

export default function VendorDashboard() {
    const router = useRouter();
    const { data: stats, isLoading } = useQuery({
        queryKey: ['vendorStats'],
        queryFn: fetchStats,
    });

    return (
        <Box flex={1} backgroundColor="mainBackground" padding="m">
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="l">
                <Box>
                    <Text variant="header">Dashboard</Text>
                    <TouchableOpacity onPress={() => router.replace('/')}>
                        <Text color="primary" fontSize={14} marginTop="xs">Switch to Buying</Text>
                    </TouchableOpacity>
                </Box>
                <TouchableOpacity onPress={() => router.push('/(vendor)/post')}>
                    <Box flexDirection="row" alignItems="center" backgroundColor="primary" padding="s" borderRadius={8}>
                        <Ionicons name="add" size={24} color="white" />
                        <Text color="textInverted" fontWeight="bold" marginLeft="xs">New Offer</Text>
                    </Box>
                </TouchableOpacity>
            </Box>

            {isLoading ? (
                <Text>Loading stats...</Text>
            ) : (
                <Box flexDirection="row" flexWrap="wrap" justifyContent="space-between" marginBottom="l">
                    <Box
                        width="48%"
                        backgroundColor="cardPrimaryBackground"
                        padding="m"
                        borderRadius={12}
                        marginBottom="m"
                    >
                        <Text color="textInverted" fontSize={14}>Total Views</Text>
                        <Text color="textInverted" fontSize={24} fontWeight="bold">
                            {stats?.totalViews || 0}
                        </Text>
                    </Box>
                    <Box
                        width="48%"
                        backgroundColor="secondary"
                        padding="m"
                        borderRadius={12}
                        marginBottom="m"
                    >
                        <Text color="textInverted" fontSize={14}>Redemptions</Text>
                        <Text color="textInverted" fontSize={24} fontWeight="bold">
                            {stats?.totalRedemptions || 0}
                        </Text>
                    </Box>
                    <Box
                        width="48%"
                        backgroundColor="purpleDark"
                        padding="m"
                        borderRadius={12}
                        marginBottom="m"
                    >
                        <Text color="textInverted" fontSize={14}>Active Offers</Text>
                        <Text color="textInverted" fontSize={24} fontWeight="bold">
                            {stats?.activeOffers || 0}
                        </Text>
                    </Box>
                </Box>
            )}

            <Text variant="subheader" marginBottom="m">Quick Actions</Text>
            <Box flexDirection="row" justifyContent="space-between">
                <TouchableOpacity onPress={() => router.push('/(vendor)/scan')} style={{ width: '48%' }}>
                    <Box
                        backgroundColor="white"
                        padding="m"
                        borderRadius={12}
                        alignItems="center"
                        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
                    >
                        <Ionicons name="qr-code-outline" size={32} color={theme.colors.primary} />
                        <Text marginTop="s" fontWeight="bold">Scan QR</Text>
                    </Box>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/(vendor)/post')} style={{ width: '48%' }}>
                    <Box
                        backgroundColor="white"
                        padding="m"
                        borderRadius={12}
                        alignItems="center"
                        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
                    >
                        <Ionicons name="create-outline" size={32} color={theme.colors.primary} />
                        <Text marginTop="s" fontWeight="bold">Create Offer</Text>
                    </Box>
                </TouchableOpacity>
            </Box>
        </Box>
    );
}
