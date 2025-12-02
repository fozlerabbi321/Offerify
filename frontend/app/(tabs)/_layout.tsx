import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../../src/theme/theme';
import { Platform, useWindowDimensions } from 'react-native';
import Navbar from '../../src/components/web/Navbar';
import Sidebar from '../../src/components/web/Sidebar';
import MobileHeader from '../../src/components/home/MobileHeader';
import Box from '../../src/components/ui/Box';

export default function TabLayout() {
    const theme = useTheme<Theme>();
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const isWeb = Platform.OS === 'web';

    return (
        <Box flex={1} backgroundColor="mainBackground" flexDirection={isWeb && isDesktop ? 'row' : 'column'}>
            {isWeb && isDesktop && <Sidebar />}
            <Box flex={1}>
                {isWeb && isDesktop && <Navbar />}
                <Tabs screenOptions={({ route, navigation }) => ({
                    headerShown: !isDesktop, // Show header on mobile/tablet
                    header: (props) => {
                        const isHomeOrMap = route.name === 'index' || route.name === 'map';
                        return (
                            <MobileHeader
                                title={props.options.title || route.name}
                                variant={isHomeOrMap ? 'home' : 'standard'}
                                onBack={navigation.canGoBack() ? navigation.goBack : undefined}
                            />
                        );
                    },
                    tabBarActiveTintColor: theme.colors.primary,
                    tabBarInactiveTintColor: theme.colors.grayMedium,
                    tabBarStyle: {
                        backgroundColor: theme.colors.mainBackground,
                        borderTopColor: theme.colors.gray,
                        // Hide tab bar on Desktop Web, show on Mobile Web and Native
                        display: isWeb && isDesktop ? 'none' : 'flex',
                    }
                })}>
                    <Tabs.Screen
                        name="index"
                        options={{
                            title: 'Home',
                            tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />
                        }}
                    />
                    <Tabs.Screen
                        name="map"
                        options={{
                            title: 'Map',
                            tabBarIcon: ({ color }) => <Ionicons name="map" size={24} color={color} />
                        }}
                    />
                    <Tabs.Screen
                        name="saved"
                        options={{
                            title: 'Saved',
                            tabBarIcon: ({ color }) => <Ionicons name="heart" size={24} color={color} />
                        }}
                    />
                    <Tabs.Screen
                        name="wallet"
                        options={{
                            title: 'Wallet',
                            tabBarIcon: ({ color }) => <Ionicons name="wallet" size={24} color={color} />
                        }}
                    />
                    <Tabs.Screen
                        name="account"
                        options={{
                            title: 'Account',
                            tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />
                        }}
                    />
                </Tabs>
            </Box>
        </Box>
    );
}
