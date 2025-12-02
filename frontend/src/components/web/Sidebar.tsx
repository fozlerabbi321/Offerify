import React from 'react';
import Box from '../ui/Box';
import Text from '../ui/Text';
import { Link, usePathname } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../../theme/theme';

const SidebarItem = ({ href, icon, label, isActive }: { href: string, icon: any, label: string, isActive: boolean }) => {
    const theme = useTheme<Theme>();
    return (
        <Link href={href as any} asChild>
            <TouchableOpacity>
                <Box
                    flexDirection="row"
                    alignItems="center"
                    paddingVertical="m"
                    paddingHorizontal="m"
                    borderRadius={8}
                    backgroundColor={isActive ? 'primary' : 'transparent'}
                >
                    <Ionicons name={icon} size={24} color={isActive ? 'white' : theme.colors.darkGray} />
                    <Text
                        variant="body"
                        marginLeft="m"
                        color={isActive ? 'textInverted' : 'text'}
                        fontWeight={isActive ? 'bold' : 'normal'}
                    >
                        {label}
                    </Text>
                </Box>
            </TouchableOpacity>
        </Link>
    );
};

const Sidebar = () => {
    const pathname = usePathname();

    return (
        <Box
            width={250}
            height="100%"
            backgroundColor="white"
            borderRightWidth={1}
            borderRightColor="gray"
            padding="m"
        >
            <Box marginBottom="xl" paddingHorizontal="m">
                <Text variant="header" fontSize={28} color="primary">Offerify</Text>
            </Box>

            <Box gap="s">
                <SidebarItem href="/(tabs)" icon="home" label="Home" isActive={pathname === '/' || pathname === '/(tabs)'} />
                <SidebarItem href="/(tabs)/map" icon="map" label="Map" isActive={pathname === '/map'} />
                <SidebarItem href="/(tabs)/saved" icon="heart" label="Saved" isActive={pathname === '/saved'} />
                <SidebarItem href="/(tabs)/wallet" icon="wallet" label="Wallet" isActive={pathname === '/wallet'} />
                <SidebarItem href="/(tabs)/account" icon="person" label="Account" isActive={pathname === '/account'} />
            </Box>
        </Box>
    );
};

export default Sidebar;
