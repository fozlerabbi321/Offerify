import { Stack } from 'expo-router';
import { Platform, useWindowDimensions } from 'react-native';
import Navbar from '../../src/components/web/Navbar';
import Sidebar from '../../src/components/web/Sidebar';
import Box from '../../src/components/ui/Box';
import MobileHeader from '../../src/components/home/MobileHeader';

export default function VendorLayout() {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const isWeb = Platform.OS === 'web';

    return (
        <Box flex={1} backgroundColor="mainBackground" flexDirection={isWeb && isDesktop ? 'row' : 'column'}>
            {isWeb && isDesktop && <Sidebar />}
            <Box flex={1}>
                {isWeb && isDesktop && <Navbar />}
                {!isDesktop && <MobileHeader title="Vendor" variant="standard" />}
                <Stack
                    screenOptions={{ headerShown: false }}
                    initialRouteName="index"
                >
                    <Stack.Screen name="index" options={{ title: 'Vendor Dashboard' }} />
                    <Stack.Screen name="onboarding" options={{ title: 'Become a Seller' }} />
                    <Stack.Screen name="post" options={{ title: 'Create Offer' }} />
                    <Stack.Screen name="scan" options={{ title: 'Scan QR' }} />
                    <Stack.Screen name="shops" options={{ title: 'Manage Shops' }} />
                </Stack>
            </Box>
        </Box>
    );
}
