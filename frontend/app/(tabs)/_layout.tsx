import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../../src/theme/theme';
import { Platform } from 'react-native';
import Navbar from '../../src/components/web/Navbar';
import Box from '../../src/components/ui/Box';

export default function TabLayout() {
    const theme = useTheme<Theme>();
    const isWeb = Platform.OS === 'web';

    return (
        <Box flex={1} backgroundColor="mainBackground">
            {isWeb && <Navbar />}
            <Tabs screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.gray,
                tabBarStyle: {
                    backgroundColor: theme.colors.mainBackground,
                    borderTopColor: theme.colors.gray,
                    display: isWeb ? 'none' : 'flex',
                }
            }}>
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />
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
    );
}
