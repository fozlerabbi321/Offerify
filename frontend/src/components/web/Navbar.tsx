import React from 'react';
import Box from '../ui/Box';
import Text from '../ui/Text';
import { Link } from 'expo-router';
import { TouchableOpacity } from 'react-native';

const Navbar = () => {
    return (
        <Box
            height={60}
            backgroundColor="white"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            paddingHorizontal="l"
            borderBottomWidth={1}
            borderBottomColor="gray"
        >
            <Box flexDirection="row" alignItems="center">
                <Text variant="header" fontSize={24} color="primary" marginRight="xl">Offerify</Text>

                <Box flexDirection="row" gap="m">
                    <Link href="/(tabs)" asChild>
                        <TouchableOpacity>
                            <Text variant="body" fontWeight="600">Home</Text>
                        </TouchableOpacity>
                    </Link>
                    <Link href="/(tabs)/account" asChild>
                        <TouchableOpacity>
                            <Text variant="body" fontWeight="600">Account</Text>
                        </TouchableOpacity>
                    </Link>
                </Box>
            </Box>

            <Box flexDirection="row" alignItems="center" gap="m">
                <Box padding="s" backgroundColor="offWhite" borderRadius={8}>
                    <Text>Dhaka, Bangladesh</Text>
                </Box>
                <Box width={200} height={40} backgroundColor="offWhite" borderRadius={8} justifyContent="center" paddingLeft="m">
                    <Text color="darkGray">Search offers...</Text>
                </Box>
            </Box>
        </Box>
    );
};

export default Navbar;
