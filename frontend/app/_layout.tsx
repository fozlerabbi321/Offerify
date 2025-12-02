import { Stack } from 'expo-router';
import { ThemeProvider } from '@shopify/restyle';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from '../src/theme/theme';
import { useAuthStore } from '../src/store/auth.store';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';

const queryClient = new QueryClient();

export default function RootLayout() {
    const { isAuthenticated } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        const inAuthGroup = segments[0] === '(auth)';

        // Simple auth logic: if not authenticated and trying to access protected routes, redirect to login
        // For now, we allow guest access to tabs, so we don't force login unless needed
    }, [isAuthenticated, segments]);

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(vendor)" />
                </Stack>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
