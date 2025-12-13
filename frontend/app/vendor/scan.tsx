import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Vibration, TouchableOpacity, Animated, Easing } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import Box from '../../src/components/ui/Box';
import Text from '../../src/components/ui/Text';
import api from '../../src/lib/api';
import theme from '../../src/theme/theme';

type ScanStatus = 'scanning' | 'verifying' | 'success' | 'error';

const verifyRedemption = async (id: string) => {
    const response = await api.patch(`/redemptions/${id}/verify`);
    return response.data;
};

export default function ScanScreen() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [status, setStatus] = useState<ScanStatus>('scanning');
    const [errorMessage, setErrorMessage] = useState('');

    // Animation values
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const animateResult = () => {
        scaleAnim.setValue(0);
        opacityAnim.setValue(0);

        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 5,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 200,
                easing: Easing.ease,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const mutation = useMutation({
        mutationFn: verifyRedemption,
        onMutate: () => {
            setStatus('verifying');
        },
        onSuccess: () => {
            Vibration.vibrate([0, 100, 50, 100]);
            setStatus('success');
            animateResult();
        },
        onError: (err: any) => {
            Vibration.vibrate([0, 200, 100, 200]);
            setStatus('error');
            setErrorMessage(err.response?.data?.message || 'Failed to verify voucher');
            animateResult();
        },
    });

    useEffect(() => {
        if (permission && !permission.granted) {
            requestPermission();
        }
    }, [permission]);

    const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
        if (scanned || status !== 'scanning') return;
        setScanned(true);
        mutation.mutate(data);
    };

    const handleScanAnother = () => {
        setScanned(false);
        setStatus('scanning');
        setErrorMessage('');
        scaleAnim.setValue(0);
        opacityAnim.setValue(0);
    };

    const handleDone = () => {
        router.back();
    };

    if (!permission) {
        return <Box flex={1} backgroundColor="mainBackground" />;
    }

    if (!permission.granted) {
        return (
            <Box flex={1} justifyContent="center" alignItems="center" backgroundColor="mainBackground" padding="m">
                <Ionicons name="camera-outline" size={64} color={theme.colors.textMuted} />
                <Text textAlign="center" marginTop="m" marginBottom="m">
                    We need camera permission to scan QR codes
                </Text>
                <TouchableOpacity onPress={requestPermission}>
                    <Box padding="m" backgroundColor="primary" borderRadius={8}>
                        <Text color="textInverted" fontWeight="bold">Grant Permission</Text>
                    </Box>
                </TouchableOpacity>
            </Box>
        );
    }

    return (
        <Box flex={1} backgroundColor="black">
            <CameraView
                style={StyleSheet.absoluteFillObject}
                onBarcodeScanned={status === 'scanning' ? handleBarCodeScanned : undefined}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
            />

            {/* Scanning Frame Overlay */}
            {status === 'scanning' && (
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
                        borderWidth={3}
                        borderColor="white"
                        borderRadius={16}
                        style={{ borderStyle: 'dashed' }}
                    />
                    <Box marginTop="l" style={styles.statusBadge} padding="s" borderRadius={8}>
                        <Text color="textInverted" fontWeight="bold">
                            Align QR code within frame
                        </Text>
                    </Box>
                </Box>
            )}

            {/* Verifying Overlay */}
            {status === 'verifying' && (
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    style={styles.overlay}
                    justifyContent="center"
                    alignItems="center"
                >
                    <Box
                        width={120}
                        height={120}
                        borderRadius={60}
                        backgroundColor="cardBackground"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Ionicons name="sync" size={48} color={theme.colors.primary} />
                    </Box>
                    <Text color="textInverted" fontSize={20} fontWeight="bold" marginTop="l">
                        Verifying...
                    </Text>
                </Box>
            )}

            {/* Success Overlay */}
            {status === 'success' && (
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    style={styles.overlay}
                    justifyContent="center"
                    alignItems="center"
                >
                    <Animated.View
                        style={[
                            styles.resultCircle,
                            styles.successCircle,
                            {
                                transform: [{ scale: scaleAnim }],
                                opacity: opacityAnim,
                            },
                        ]}
                    >
                        <Ionicons name="checkmark" size={64} color="white" />
                    </Animated.View>
                    <Animated.View style={{ opacity: opacityAnim }}>
                        <Text color="textInverted" fontSize={24} fontWeight="bold" marginTop="l">
                            Verified!
                        </Text>
                        <Text color="textInverted" fontSize={14} marginTop="s" textAlign="center">
                            Voucher successfully redeemed
                        </Text>
                    </Animated.View>

                    <Box flexDirection="row" marginTop="xl">
                        <TouchableOpacity onPress={handleScanAnother} style={styles.actionButton}>
                            <Box
                                backgroundColor="primary"
                                paddingVertical="m"
                                paddingHorizontal="l"
                                borderRadius={8}
                                flexDirection="row"
                                alignItems="center"
                            >
                                <Ionicons name="scan-outline" size={20} color="white" />
                                <Text color="textInverted" fontWeight="bold" marginLeft="s">Scan Another</Text>
                            </Box>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDone} style={[styles.actionButton, { marginLeft: 12 }]}>
                            <Box
                                backgroundColor="cardBackground"
                                paddingVertical="m"
                                paddingHorizontal="l"
                                borderRadius={8}
                            >
                                <Text fontWeight="bold">Done</Text>
                            </Box>
                        </TouchableOpacity>
                    </Box>
                </Box>
            )}

            {/* Error Overlay */}
            {status === 'error' && (
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    style={styles.overlay}
                    justifyContent="center"
                    alignItems="center"
                >
                    <Animated.View
                        style={[
                            styles.resultCircle,
                            styles.errorCircle,
                            {
                                transform: [{ scale: scaleAnim }],
                                opacity: opacityAnim,
                            },
                        ]}
                    >
                        <Ionicons name="close" size={64} color="white" />
                    </Animated.View>
                    <Animated.View style={{ opacity: opacityAnim }}>
                        <Text color="textInverted" fontSize={24} fontWeight="bold" marginTop="l">
                            Error
                        </Text>
                        <Text color="textInverted" fontSize={14} marginTop="s" textAlign="center" style={{ maxWidth: 280 }}>
                            {errorMessage}
                        </Text>
                    </Animated.View>

                    <Box flexDirection="row" marginTop="xl">
                        <TouchableOpacity onPress={handleScanAnother} style={styles.actionButton}>
                            <Box
                                backgroundColor="primary"
                                paddingVertical="m"
                                paddingHorizontal="l"
                                borderRadius={8}
                                flexDirection="row"
                                alignItems="center"
                            >
                                <Ionicons name="refresh-outline" size={20} color="white" />
                                <Text color="textInverted" fontWeight="bold" marginLeft="s">Try Again</Text>
                            </Box>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDone} style={[styles.actionButton, { marginLeft: 12 }]}>
                            <Box
                                backgroundColor="cardBackground"
                                paddingVertical="m"
                                paddingHorizontal="l"
                                borderRadius={8}
                            >
                                <Text fontWeight="bold">Cancel</Text>
                            </Box>
                        </TouchableOpacity>
                    </Box>
                </Box>
            )}

            {/* Back Button */}
            <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
            >
                <Box
                    width={44}
                    height={44}
                    borderRadius={22}
                    backgroundColor="cardBackground"
                    justifyContent="center"
                    alignItems="center"
                    style={styles.shadow}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </Box>
            </TouchableOpacity>
        </Box>
    );
}

const styles = StyleSheet.create({
    overlay: {
        backgroundColor: 'rgba(0,0,0,0.85)',
    },
    statusBadge: {
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    resultCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    successCircle: {
        backgroundColor: '#22C55E',
    },
    errorCircle: {
        backgroundColor: '#EF4444',
    },
    actionButton: {
        // Button wrapper
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 16,
    },
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
});
