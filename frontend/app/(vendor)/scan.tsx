import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, Vibration, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import Box from '../../src/components/ui/Box';
import Text from '../../src/components/ui/Text';
import api from '../../src/lib/api';
import theme from '../../src/theme/theme';

const verifyRedemption = async (id: string) => {
    const response = await api.patch(`/redemptions/${id}/verify`);
    return response.data;
};

export default function ScanScreen() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    const mutation = useMutation({
        mutationFn: verifyRedemption,
        onSuccess: () => {
            Vibration.vibrate();
            Alert.alert('Success', 'Voucher verified successfully!', [
                { text: 'Scan Another', onPress: () => setScanned(false) },
                { text: 'Done', onPress: () => router.back() }
            ]);
        },
        onError: (err: any) => {
            Vibration.vibrate();
            Alert.alert('Error', err.response?.data?.message || 'Failed to verify voucher', [
                { text: 'Try Again', onPress: () => setScanned(false) },
                { text: 'Cancel', onPress: () => router.back() }
            ]);
        },
    });

    useEffect(() => {
        if (permission && !permission.granted) {
            requestPermission();
        }
    }, [permission]);

    const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
        if (scanned) return;
        setScanned(true);
        // Assuming data is the redemption ID
        mutation.mutate(data);
    };

    if (!permission) {
        return <Box flex={1} backgroundColor="mainBackground" />;
    }

    if (!permission.granted) {
        return (
            <Box flex={1} justifyContent="center" alignItems="center" backgroundColor="mainBackground" padding="m">
                <Text textAlign="center" marginBottom="m">We need your permission to show the camera</Text>
                <TouchableOpacity onPress={requestPermission}>
                    <Box padding="m" backgroundColor="primary" borderRadius={8}>
                        <Text color="textInverted">Grant Permission</Text>
                    </Box>
                </TouchableOpacity>
            </Box>
        );
    }

    return (
        <Box flex={1} backgroundColor="black">
            <CameraView
                style={StyleSheet.absoluteFillObject}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
            />
            <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                justifyContent="center"
                alignItems="center"
            >
                <Box
                    width={250}
                    height={250}
                    borderWidth={2}
                    borderColor="white"
                    borderRadius={12}
                    opacity={0.5}
                />
                <Box marginTop="l" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} padding="s" borderRadius={4}>
                    <Text color="textInverted">
                        Align QR code within frame
                    </Text>
                </Box>
            </Box>

            {mutation.isPending && (
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
                    justifyContent="center"
                    alignItems="center"
                >
                    <Text color="textInverted" fontSize={20} fontWeight="bold">Verifying...</Text>
                </Box>
            )}
        </Box>
    );
}
