import React, { useEffect, useState, ReactNode } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/auth.store';
import { Ionicons } from '@expo/vector-icons';

interface AuthWrapperProps {
    children: ReactNode;
    requireAuth?: boolean;
}

/**
 * AuthWrapper - Wraps screens that require authentication.
 * Shows login prompt for unauthenticated users instead of redirecting.
 */
export default function AuthWrapper({ children, requireAuth = true }: AuthWrapperProps) {
    const { user, isAuthenticated, checkLogin } = useAuthStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            await checkLogin();
            setIsLoading(false);
        };
        init();
    }, []);

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#5A31F4" />
            </View>
        );
    }

    if (requireAuth && !isAuthenticated) {
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
                        onPress={() => router.push('/(auth)/login')}
                    >
                        <Text style={styles.loginButtonText}>Sign In</Text>
                    </Pressable>
                    <Pressable
                        style={styles.backButton}
                        onPress={() => router.push('/')}
                    >
                        <Text style={styles.backButtonText}>Back to Home</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return <>{children}</>;
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
