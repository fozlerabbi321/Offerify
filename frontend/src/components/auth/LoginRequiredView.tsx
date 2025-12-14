import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Text from '../ui/Text';

interface LoginRequiredViewProps {
    onLoginPress?: () => void;
    onBackPress?: () => void;
    showBackButton?: boolean;
}

export default function LoginRequiredView({
    onLoginPress,
    onBackPress,
    showBackButton = true
}: LoginRequiredViewProps) {
    const router = useRouter();

    const handleLogin = () => {
        if (onLoginPress) {
            onLoginPress();
        } else {
            router.push('/(auth)/login');
        }
    };

    const handleBack = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            if (router.canGoBack()) {
                router.back();
            } else {
                router.push('/');
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Ionicons name="lock-closed-outline" size={64} color="#5A31F4" />
                <Text style={styles.title}>Login Required</Text>
                <Text style={styles.subtitle}>
                    Please sign in to access this feature.
                </Text>
                <Pressable
                    style={styles.loginButton}
                    onPress={handleLogin}
                >
                    <Text style={styles.loginButtonText}>Sign In</Text>
                </Pressable>
                {showBackButton && (
                    <Pressable
                        style={styles.backButton}
                        onPress={handleBack}
                    >
                        <Text style={styles.backButtonText}>Back to Home</Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
        padding: 24,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
        maxWidth: 400,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A2E',
        marginTop: 20,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    loginButton: {
        backgroundColor: '#5A31F4',
        paddingHorizontal: 48,
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 12,
        width: '100%',
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    backButton: {
        paddingVertical: 12,
    },
    backButtonText: {
        color: '#888',
        fontSize: 14,
    },
});
