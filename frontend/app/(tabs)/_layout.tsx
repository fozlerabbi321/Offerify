import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../../src/theme/theme';
import { Platform, useWindowDimensions, TouchableOpacity } from 'react-native';
import Navbar from '../../src/components/web/Navbar';
import Sidebar from '../../src/components/web/Sidebar';
import MobileHeader from '../../src/components/home/MobileHeader';
import Box from '../../src/components/ui/Box';
import { useAuthStore } from '../../src/store/auth.store';

export default function TabLayout() {
    const theme = useTheme<Theme>();
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const isWeb = Platform.OS === 'web';
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();

    const handleCreatePress = () => {
        if (!isAuthenticated) {
            router.push('/(auth)/login');
        } else if (user?.role?.toUpperCase() === 'VENDOR') {
            router.push('/vendor/post');
        } else {
            router.push('/vendor/onboarding');
        }
    };

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
                    tabBarInactiveTintColor: theme.colors.black,
                    tabBarStyle: {
                        backgroundColor: theme.colors.mainBackground,
                        borderTopColor: theme.colors.gray,
                        // Hide tab bar on Desktop Web, show on Mobile Web and Native
                        display: isWeb && isDesktop ? 'none' : 'flex',
                        height: 60,
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
                        name="wallet"
                        options={{
                            title: '',
                            tabBarIcon: ({ color, focused }) => (
                                <TouchableOpacity
                                    onPress={handleCreatePress}
                                    style={{
                                        position: 'absolute',
                                        top: -15,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Box
                                        width={56}
                                        height={56}
                                        borderRadius={28}
                                        backgroundColor="secondary"
                                        alignItems="center"
                                        justifyContent="center"
                                        style={{
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.3,
                                            shadowRadius: 6,
                                            elevation: 8,
                                        }}
                                    >
                                        <Ionicons name="add" size={32} color="white" />
                                    </Box>
                                </TouchableOpacity>
                            ),
                            tabBarButton: () => (
                                <TouchableOpacity
                                    onPress={handleCreatePress}
                                    style={{
                                        flex: 1,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Box
                                        width={56}
                                        height={56}
                                        borderRadius={28}
                                        backgroundColor="secondary"
                                        alignItems="center"
                                        justifyContent="center"
                                        style={{
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.3,
                                            shadowRadius: 6,
                                            elevation: 8,
                                            marginBottom: 20,
                                        }}
                                    >
                                        <Ionicons name="add" size={32} color="white" />
                                    </Box>
                                </TouchableOpacity>
                            ),
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
                        name="account"
                        options={{
                            title: 'Account',
                            tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />
                        }}
                    />
                    {/* Hidden tab - accessible via header search icon */}
                    <Tabs.Screen
                        name="search"
                        options={{
                            href: null, // Hide from tab bar
                        }}
                    />
                </Tabs>
            </Box>
        </Box>
    );
}
