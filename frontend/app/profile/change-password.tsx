import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { userProfileService } from '../../src/services/user-profile.service';
import Box from '../../src/components/ui/Box';
import Text from '../../src/components/ui/Text';
import theme from '../../src/theme/theme';

export default function ChangePasswordScreen() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSave = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            await userProfileService.changePassword({
                currentPassword,
                newPassword
            });

            setIsLoading(false);

            // Navigate immediately - no alert needed
            router.push('/profile');
        } catch (error: any) {
            console.error('Change password error:', error);
            setIsLoading(false);
            Alert.alert('Error', error?.response?.data?.message || 'Failed to update password');
        }
    };

    return (
        <Box flex={1} backgroundColor="mainBackground">
            <Stack.Screen options={{
                headerShown: true,
                title: 'Change Password',
            }} />

            <ScrollView style={{ flex: 1 }}>
                <Box
                    backgroundColor="secondaryLight"
                    padding="m"
                    marginHorizontal="m"
                    marginTop="m"
                    borderRadius={12}
                    flexDirection="row"
                    alignItems="center"
                >
                    <Ionicons name="information-circle" size={24} color={theme.colors.primary} style={{ marginRight: 12 }} />
                    <Box flex={1}>
                        <Text variant="caption" color="primary">
                            Enter your current password and a new password to update your login credentials.
                        </Text>
                    </Box>
                </Box>

                <Box padding="m">
                    {/* Current Password */}
                    <Box marginBottom="m">
                        <Text variant="body" fontWeight="600" color="text" marginBottom="xs" marginLeft="xs">
                            Current Password
                        </Text>
                        <Box position="relative">
                            <Box
                                backgroundColor="white"
                                borderRadius={12}
                                paddingHorizontal="m"
                                paddingVertical="s"
                                style={{
                                    borderWidth: 1,
                                    borderColor: theme.colors.gray200,
                                }}
                            >
                                <input
                                    type={showCurrent ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                    style={{
                                        border: 'none',
                                        outline: 'none',
                                        fontSize: 16,
                                        fontFamily: 'inherit',
                                        width: '100%',
                                        padding: 8,
                                        paddingRight: 40,
                                        color: theme.colors.text,
                                    }}
                                />
                            </Box>
                            <TouchableOpacity
                                onPress={() => setShowCurrent(!showCurrent)}
                                style={{ position: 'absolute', right: 12, top: 16 }}
                            >
                                <Ionicons
                                    name={showCurrent ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color={theme.colors.gray400}
                                />
                            </TouchableOpacity>
                        </Box>
                    </Box>

                    {/* New Password */}
                    <Box marginBottom="m">
                        <Text variant="body" fontWeight="600" color="text" marginBottom="xs" marginLeft="xs">
                            New Password
                        </Text>
                        <Box position="relative">
                            <Box
                                backgroundColor="white"
                                borderRadius={12}
                                paddingHorizontal="m"
                                paddingVertical="s"
                                style={{
                                    borderWidth: 1,
                                    borderColor: theme.colors.gray200,
                                }}
                            >
                                <input
                                    type={showNew ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password (min 6 characters)"
                                    style={{
                                        border: 'none',
                                        outline: 'none',
                                        fontSize: 16,
                                        fontFamily: 'inherit',
                                        width: '100%',
                                        padding: 8,
                                        paddingRight: 40,
                                        color: theme.colors.text,
                                    }}
                                />
                            </Box>
                            <TouchableOpacity
                                onPress={() => setShowNew(!showNew)}
                                style={{ position: 'absolute', right: 12, top: 16 }}
                            >
                                <Ionicons
                                    name={showNew ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color={theme.colors.gray400}
                                />
                            </TouchableOpacity>
                        </Box>
                    </Box>

                    {/* Confirm New Password */}
                    <Box marginBottom="m">
                        <Text variant="body" fontWeight="600" color="text" marginBottom="xs" marginLeft="xs">
                            Confirm New Password
                        </Text>
                        <Box position="relative">
                            <Box
                                backgroundColor="white"
                                borderRadius={12}
                                paddingHorizontal="m"
                                paddingVertical="s"
                                style={{
                                    borderWidth: 1,
                                    borderColor: theme.colors.gray200,
                                }}
                            >
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter new password"
                                    style={{
                                        border: 'none',
                                        outline: 'none',
                                        fontSize: 16,
                                        fontFamily: 'inherit',
                                        width: '100%',
                                        padding: 8,
                                        paddingRight: 40,
                                        color: theme.colors.text,
                                    }}
                                />
                            </Box>
                            <TouchableOpacity
                                onPress={() => setShowConfirm(!showConfirm)}
                                style={{ position: 'absolute', right: 12, top: 16 }}
                            >
                                <Ionicons
                                    name={showConfirm ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color={theme.colors.gray400}
                                />
                            </TouchableOpacity>
                        </Box>
                    </Box>

                    {/* Password Requirements */}
                    <Box
                        backgroundColor="secondaryLight"
                        padding="m"
                        borderRadius={12}
                        marginBottom="xl"
                    >
                        <Text variant="caption" color="secondary" fontWeight="bold" marginBottom="xs">
                            Password Requirements:
                        </Text>
                        <PasswordRequirement met={newPassword.length >= 6} text="At least 6 characters" />
                        <PasswordRequirement met={newPassword === confirmPassword && newPassword.length > 0} text="Passwords match" />
                    </Box>

                    {/* Update Button */}
                    <TouchableOpacity onPress={handleSave} disabled={isLoading}>
                        <Box
                            backgroundColor="primary"
                            paddingVertical="m"
                            borderRadius={12}
                            alignItems="center"
                            style={{
                                shadowColor: theme.colors.primary,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                            }}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text color="textInverted" fontWeight="bold" fontSize={16}>
                                    Update Password
                                </Text>
                            )}
                        </Box>
                    </TouchableOpacity>
                </Box>
            </ScrollView>
        </Box>
    );
}

function PasswordRequirement({ met, text }: { met: boolean, text: string }) {
    return (
        <Box flexDirection="row" alignItems="center" marginTop="xs">
            <Ionicons
                name={met ? "checkmark-circle" : "close-circle"}
                size={16}
                color={met ? theme.colors.greenPrimary : theme.colors.gray400}
                style={{ marginRight: 8 }}
            />
            <Text variant="caption" color={met ? "greenPrimary" : "gray500"}>
                {text}
            </Text>
        </Box>
    );
}
