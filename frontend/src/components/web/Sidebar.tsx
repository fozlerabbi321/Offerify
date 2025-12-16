import React from 'react';
import Box from '../ui/Box';
import Text from '../ui/Text';
import { Link, usePathname, useRouter } from 'expo-router';
import { TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../../theme/theme';
import { useAuthStore } from '../../store/auth.store';

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
                    <Ionicons name={icon} size={20} color={isActive ? 'white' : theme.colors.darkGray} />
                    <Text
                        variant="body"
                        marginLeft="m"
                        color={isActive ? 'textInverted' : 'text'}
                        fontWeight={isActive ? '600' : 'normal'}
                        fontSize={14}
                    >
                        {label}
                    </Text>
                </Box>
            </TouchableOpacity>
        </Link>
    );
};

const VendorButton = () => {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const theme = useTheme<Theme>();

    const isVendor = user?.role?.toUpperCase() === 'VENDOR';

    const handlePress = () => {
        if (!isAuthenticated) {
            router.push('/(auth)/login');
        } else if (isVendor) {
            router.push('/vendor');
        } else {
            router.push('/vendor/onboarding');
        }
    };

    return (
        <TouchableOpacity onPress={handlePress}>
            <Box
                flexDirection="row"
                alignItems="center"
                paddingVertical="m"
                paddingHorizontal="m"
                borderRadius={8}
                backgroundColor="secondary"
            >
                <Ionicons name="storefront" size={20} color="white" />
                <Text
                    variant="body"
                    marginLeft="m"
                    color="textInverted"
                    fontWeight="600"
                    fontSize={14}
                >
                    Offerify Vendor
                </Text>
            </Box>
        </TouchableOpacity>
    );
};

const Sidebar = () => {
    const pathname = usePathname();
    const theme = useTheme<Theme>();

    return (
        <Box
            width={250}
            height="100%"
            backgroundColor="white"
            borderRightWidth={1}
            borderRightColor="gray"
        >
            <ScrollView contentContainerStyle={{ padding: 12 }}>
                {/* Brand Icon (Logo removed per design) */}
                <Box marginBottom="l" paddingHorizontal="m" paddingTop="s">
                    <Box
                        width={40}
                        height={40}
                        borderRadius={12}
                        backgroundColor="primary"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Text variant="body" color="textInverted" fontWeight="bold" fontSize={20}>O</Text>
                    </Box>
                </Box>

                {/* Main Navigation */}
                <Box gap="xs" marginBottom="m">
                    <SidebarItem href="/(tabs)" icon="home" label="Home" isActive={pathname === '/' || pathname === '/(tabs)'} />
                    <SidebarItem href="/(tabs)/map" icon="map" label="Map" isActive={pathname.includes('/map')} />
                    <SidebarItem href="/(tabs)/saved" icon="heart" label="Saved" isActive={pathname.includes('/saved')} />
                    <SidebarItem href="/(tabs)/wallet" icon="wallet" label="Wallet" isActive={pathname.includes('/wallet')} />
                </Box>

                {/* Vendor Section */}
                <Box marginBottom="m">
                    <VendorButton />
                </Box>

                {/* Divider */}
                <Box height={1} backgroundColor="gray200" marginVertical="m" />

                {/* Support Section */}
                <Box gap="xs" marginBottom="s">
                    <SidebarItem href="/support" icon="help-circle-outline" label="Support" isActive={pathname.includes('/support')} />
                    <SidebarItem href="/about" icon="information-circle-outline" label="About" isActive={pathname.includes('/about')} />
                    <SidebarItem href="/privacy" icon="shield-outline" label="Privacy Policy" isActive={pathname.includes('/privacy')} />
                    <SidebarItem href="/terms" icon="document-text-outline" label="Terms & Conditions" isActive={pathname.includes('/terms')} />
                    <SidebarItem href="/how-to-use" icon="book-outline" label="How to Use" isActive={pathname.includes('/how-to-use')} />
                    <SidebarItem href="/faq" icon="help-outline" label="FAQ" isActive={pathname.includes('/faq')} />
                </Box>
            </ScrollView>
        </Box>
    );
};

export default Sidebar;
