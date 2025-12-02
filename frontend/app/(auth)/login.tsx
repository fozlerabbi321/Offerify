import React, { useState } from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../../src/theme/theme';
import Box from '../../src/components/ui/Box';
import Text from '../../src/components/ui/Text';
import Input from '../../src/components/ui/Input';
import api from '../../src/lib/api';
import { useAuthStore } from '../../src/store/auth.store';

interface LoginFormData {
    email: string;
    password: string;
}

const LoginScreen = () => {
    const router = useRouter();
    const theme = useTheme<Theme>();
    const login = useAuthStore((state) => state.login);
    const [loading, setLoading] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/login', data);

            // The response.data is already unwrapped by the interceptor if it follows the standard format
            // But let's be safe and check what we get. 
            // Based on api.ts interceptor: response.data = response.data.data

            const { user, access_token } = response.data;

            if (user && access_token) {
                login(user, access_token);
                router.replace('/');
            } else {
                // Fallback if structure is different or interceptor didn't trigger as expected
                // This might happen if the backend returns { accessToken, ... } directly without 'data' wrapper
                // But assuming standard format based on api.ts
                Alert.alert('Login Failed', 'Invalid response from server');
            }

        } catch (error: any) {
            console.error('Login error:', error);
            const message = error.response?.data?.message || 'Something went wrong';
            Alert.alert('Login Failed', Array.isArray(message) ? message.join('\n') : message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box flex={1} backgroundColor="mainBackground" justifyContent="center" padding="l">
            <Box
                width="100%"
                maxWidth={400}
                alignSelf="center"
            >
                <Text variant="header" textAlign="center" marginBottom="xl">
                    Welcome Back
                </Text>

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
                    rules={{ required: 'Password is required' }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            label="Password"
                            placeholder="Enter your password"
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
                            {loading ? 'Logging in...' : 'Login'}
                        </Text>
                    </Box>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                    <Box marginTop="l" alignItems="center">
                        <Text variant="body" color="grayMedium">
                            Don't have an account? <Text color="primary" fontWeight="bold">Sign Up</Text>
                        </Text>
                    </Box>
                </TouchableOpacity>
            </Box>
        </Box>
    );
};

export default LoginScreen;
