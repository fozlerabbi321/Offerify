import React, { useState } from 'react';
import { FlatList, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import QRCode from 'react-native-qrcode-svg';

import Box from '../../src/components/ui/Box';
import Text from '../../src/components/ui/Text';
import api from '../../src/lib/api';
import theme from '../../src/theme/theme';
import AuthWrapper from '../../src/components/auth/AuthWrapper';

const fetchRedemptions = async () => {
    // Assuming this endpoint exists or will be created
    const response = await api.get('/redemptions/me');
    return response.data;
};

export default function WalletScreen() {
    return (
        <AuthWrapper>
            <WalletScreenContent />
        </AuthWrapper>
    );
}

function WalletScreenContent() {
    const { data: redemptions, isLoading } = useQuery({
        queryKey: ['wallet'],
        queryFn: fetchRedemptions,
    });

    const [selectedRedemption, setSelectedRedemption] = useState<any>(null);

    const renderItem = ({ item }: { item: any }) => {
        const offer = item.offer;
        return (
            <TouchableOpacity onPress={() => setSelectedRedemption(item)}>
                <Box
                    flexDirection="row"
                    padding="m"
                    backgroundColor="mainBackground"
                    marginBottom="s"
                    borderRadius={8}
                    borderWidth={1}
                    borderColor="gray"
                >
                    <Image
                        source={{ uri: offer.image || 'https://via.placeholder.com/100' }}
                        style={{ width: 60, height: 60, borderRadius: 8 }}
                        contentFit="cover"
                    />
                    <Box marginLeft="m" flex={1} justifyContent="center">
                        <Text variant="body" fontWeight="bold">
                            {offer.title}
                        </Text>
                        <Text variant="body" fontSize={12} color="gray">
                            Status: {item.status}
                        </Text>
                        <Text variant="body" fontSize={12} color="primary">
                            Tap to show QR
                        </Text>
                    </Box>
                </Box>
            </TouchableOpacity>
        );
    };

    return (
        <Box flex={1} backgroundColor="mainBackground" padding="m">
            <Text variant="header" marginBottom="m">My Wallet</Text>
            {isLoading ? (
                <Text>Loading...</Text>
            ) : (
                <FlatList
                    data={redemptions}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={<Text>No vouchers yet.</Text>}
                />
            )}

            <Modal
                visible={!!selectedRedemption}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setSelectedRedemption(null)}
            >
                <Box flex={1} justifyContent="center" alignItems="center" backgroundColor="black" opacity={0.9}>
                    <Box
                        width={300}
                        padding="l"
                        backgroundColor="mainBackground"
                        borderRadius={16}
                        alignItems="center"
                    >
                        <Text variant="subheader" marginBottom="l">Scan to Redeem</Text>
                        {selectedRedemption && (
                            <QRCode
                                value={selectedRedemption.id}
                                size={200}
                            />
                        )}
                        <Text variant="body" marginTop="m" color="gray">
                            {selectedRedemption?.offer?.title}
                        </Text>
                        <TouchableOpacity onPress={() => setSelectedRedemption(null)}>
                            <Box marginTop="l" padding="m" backgroundColor="primary" borderRadius={8}>
                                <Text color="textInverted" fontWeight="bold">Close</Text>
                            </Box>
                        </TouchableOpacity>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
}
