import React from 'react';
import Container from '../../src/components/ui/Container';
import Text from '../../src/components/ui/Text';
import Box from '../../src/components/ui/Box';
import { useAuthStore } from '../../src/store/auth.store';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function AccountScreen() {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    return (
        <Container>
            <Box padding="m">
                <Text variant="header">Account</Text>
                {user ? (
                    <>
                        <Text variant="subheader" marginTop="m">{user.email}</Text>
                        <Text variant="body">Role: {user.role}</Text>

                        {user.role === 'CUSTOMER' && (
                            <TouchableOpacity onPress={() => console.log('Become Vendor')}>
                                <Box padding="m" backgroundColor="secondary" marginTop="m" borderRadius={8} alignItems="center">
                                    <Text color="textInverted">Become a Vendor</Text>
                                </Box>
                            </TouchableOpacity>
                        )}

                        {user.role === 'VENDOR' && (
                            <TouchableOpacity onPress={() => router.push('/(vendor)/dashboard')}>
                                <Box padding="m" backgroundColor="primary" marginTop="m" borderRadius={8} alignItems="center">
                                    <Text color="textInverted">Vendor Dashboard</Text>
                                </Box>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity onPress={logout}>
                            <Box padding="m" backgroundColor="darkGray" marginTop="xl" borderRadius={8} alignItems="center">
                                <Text color="textInverted">Logout</Text>
                            </Box>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                        <Box padding="m" backgroundColor="primary" marginTop="m" borderRadius={8} alignItems="center">
                            <Text color="textInverted">Login</Text>
                        </Box>
                    </TouchableOpacity>
                )}
            </Box>
        </Container>
    );
}
