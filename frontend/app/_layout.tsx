import { Stack } from 'expo-router';
import { ThemeProvider } from '@shopify/restyle';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from '../src/theme/theme';
import { useAuthStore } from '../src/store/auth.store';
import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
    // Inject Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
}

const queryClient = new QueryClient();

export default function RootLayout() {
    const { isAuthenticated, checkLogin } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        checkLogin();
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inVendorGroup = segments[0] === '(vendor)';
        // Add other protected groups here

        if (isAuthenticated && inAuthGroup) {
            // Redirect to home if already logged in and trying to access auth screens
            router.replace('/');
        } else if (!isAuthenticated && inVendorGroup) {
            // Redirect to login if trying to access protected routes
            router.replace('/(auth)/login');
        }
    }, [isAuthenticated, segments, isMounted]);

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(vendor)" />
                    <Stack.Screen
                        name="profile"
                        options={{
                            presentation: 'card',
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="vendor"
                        options={{
                            presentation: 'card',
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="offer"
                        options={{
                            presentation: 'card',
                            headerShown: false,
                        }}
                    />
                </Stack>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
