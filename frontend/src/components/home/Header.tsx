import React from 'react';
import Box from '../ui/Box';
import Text from '../ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../../theme/theme';

const Header = () => {
    const theme = useTheme<Theme>();
    const isWeb = Platform.OS === 'web';

    if (isWeb) return null; // Web has its own Navbar

    return (
        <Box
            paddingHorizontal="m"
            paddingVertical="s"
            backgroundColor="mainBackground"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            shadowColor="black"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.05}
            shadowRadius={4}
            elevation={2}
            zIndex={100}
        >
            <Box flexDirection="row" alignItems="center">
                <Ionicons name="location" size={20} color={theme.colors.primary} />
                <Text variant="subheader" fontSize={16} marginLeft="s">Dhaka, Bangladesh</Text>
                <Ionicons name="chevron-down" size={16} color={theme.colors.darkGray} style={{ marginLeft: 4 }} />
            </Box>

            <Box width={40} height={40} backgroundColor="offWhite" borderRadius={20} justifyContent="center" alignItems="center">
                <Ionicons name="search" size={20} color={theme.colors.darkGray} />
            </Box>
        </Box>
    );
};

export default Header;
