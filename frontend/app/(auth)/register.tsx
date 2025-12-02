import React, { useState } from 'react';
import { TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../../src/theme/theme';
import Box from '../../src/components/ui/Box';
import Text from '../../src/components/ui/Text';
import Input from '../../src/components/ui/Input';
import api from '../../src/lib/api';
import { useAuthStore } from '../../src/store/auth.store';

interface RegisterFormData {
    name: string;
    email: string;
    password: string;
}

const RegisterScreen = () => {
    const router = useRouter();
    const theme = useTheme<Theme>();
    const login = useAuthStore((state) => state.login);
    const [loading, setLoading] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        defaultValues: {
            name: '',
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: RegisterFormData) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/register', data);

            // Assuming the register endpoint returns the user and token immediately
            const { user, access_token } = response.data;

            if (user && access_token) {
                login(user, access_token);
                Alert.alert('Success', 'Account created successfully!', [
                    { text: 'OK', onPress: () => router.replace('/') }
                ]);
            } else {
                // If backend doesn't return token on register, redirect to login
                Alert.alert('Success', 'Account created! Please login.', [
                    { text: 'OK', onPress: () => router.replace('/(auth)/login') }
                ]);
            }

        } catch (error: any) {
            console.error('Register error:', error);
            const message = error.response?.data?.message || 'Something went wrong';
            Alert.alert('Registration Failed', Array.isArray(message) ? message.join('\n') : message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box flex={1} backgroundColor="mainBackground">
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: theme.spacing.l }}>
                <Box
                    width="100%"
                    maxWidth={400}
                    alignSelf="center"
                >
                    <Text variant="header" textAlign="center" marginBottom="xl">
                        Create Account
                    </Text>

                    <Controller
                        control={control}
                        rules={{ required: 'Name is required' }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label="Name"
                                placeholder="Enter your full name"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                error={errors.name?.message}
                            />
                        )}
                        name="name"
                    />

                    <Controller
                        control={control}
                        rules={{
                            required: 'Email is required',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address',
                            },
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label="Email"
                                placeholder="Enter your email"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                error={errors.email?.message}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        )}
                        name="email"
                    />

                    <Controller
                        control={control}
                        rules={{
                            required: 'Password is required',
                            minLength: {
                                value: 6,
                                message: 'Password must be at least 6 characters',
                            },
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label="Password"
                                placeholder="Choose a password"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                error={errors.password?.message}
                                secureTextEntry
                            />
                        )}
                        name="password"
                    />

                    <TouchableOpacity
                        onPress={handleSubmit(onSubmit)}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <Box
                            backgroundColor="primary"
                            paddingVertical="m"
                            borderRadius={8}
                            alignItems="center"
                            marginTop="m"
                            opacity={loading ? 0.7 : 1}
                        >
                            <Text variant="body" color="textInverted" fontWeight="bold">
                                {loading ? 'Creating Account...' : 'Sign Up'}
                            </Text>
                        </Box>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                        <Box marginTop="l" alignItems="center">
                            <Text variant="body" color="grayMedium">
                                Already have an account? <Text color="primary" fontWeight="bold">Login</Text>
                            </Text>
                        </Box>
                    </TouchableOpacity>
                </Box>
            </ScrollView>
        </Box>
    );
};

export default RegisterScreen;
