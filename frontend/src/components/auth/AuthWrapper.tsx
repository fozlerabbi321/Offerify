import React, { useEffect, useState, ReactNode } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/auth.store';
import LoginRequiredView from './LoginRequiredView';

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
        return <LoginRequiredView />;
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
});
