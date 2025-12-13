import { Stack, Slot } from 'expo-router';
import { ThemeProvider } from '@shopify/restyle';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from '../src/theme/theme';
import { useAuthStore } from '../src/store/auth.store';
import { useEffect } from 'react';
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
    const checkLogin = useAuthStore((state) => state.checkLogin);

    useEffect(() => {
        checkLogin();
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="admin" />
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
