import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../src/store/auth.store';
import { userProfileService } from '../../src/services/user-profile.service';
import { imageUploadService } from '../../src/services/image-upload.service';
import Box from '../../src/components/ui/Box';
import Text from '../../src/components/ui/Text';
import theme from '../../src/theme/theme';

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, refreshUser } = useAuthStore();

    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
    const [isLoading, setIsLoading] = useState(false);

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setAvatarUrl(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            let finalAvatarUrl = user?.avatarUrl || '';

            // Only upload if a new image was selected (starts with file://)
            if (avatarUrl && (avatarUrl.startsWith('file://') || avatarUrl.startsWith('blob:'))) {
                try {
                    console.log('Uploading image...', avatarUrl);
                    const uploadResult = await imageUploadService.uploadImage(avatarUrl);
                    console.log('Upload result:', uploadResult);

                    // Extract URL from various possible response formats
                    if (typeof uploadResult === 'string') {
                        finalAvatarUrl = uploadResult;
                    } else if (uploadResult?.url) {
                        finalAvatarUrl = uploadResult.url;
                    } else if (uploadResult?.data?.url) {
                        // Handle wrapped response from ResponseInterceptor
                        finalAvatarUrl = uploadResult.data.url;
                    } else {
                        console.error('Unexpected upload response format:', uploadResult);
                        throw new Error('Invalid upload response');
                    }

                    console.log('Final avatar URL:', finalAvatarUrl);
                } catch (uploadError) {
                    console.error('Image upload failed:', uploadError);
                    Alert.alert('Error', 'Failed to upload image. Please try again.');
                    setIsLoading(false);
                    return;
                }
            } else if (avatarUrl) {
                // Use the existing avatar URL if it's already a valid URL
                finalAvatarUrl = avatarUrl;
            }

            console.log('Updating profile with:', { name, phone, avatarUrl: finalAvatarUrl });
            const result = await userProfileService.updateProfile({
                name,
                phone,
                avatarUrl: finalAvatarUrl,
            });
            console.log('Profile update result:', result);

            // Refresh user data from server
            await refreshUser();

            setIsLoading(false);

            // Navigate immediately - no alert needed
            router.push('/profile');
        } catch (error: any) {
            console.error('Update profile error:', error);
            setIsLoading(false);
            Alert.alert('Error', error?.response?.data?.message || 'Failed to update profile');
        }
    };

    return (
        <Box flex={1} backgroundColor="mainBackground">
            <Stack.Screen options={{
                headerShown: true,
                title: 'Edit Profile',
                headerRight: () => (
                    <TouchableOpacity onPress={handleSave} disabled={isLoading} style={{ marginRight: 16 }}>
                        {isLoading ? (
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                        ) : (
                            <Text color="primary" fontWeight="bold" fontSize={16}>Save</Text>
                        )}
                    </TouchableOpacity>
                ),
            }} />

            <ScrollView style={{ flex: 1 }}>
                {/* Avatar Section */}
                <Box
                    alignItems="center"
                    paddingVertical="xl"
                    backgroundColor="white"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                    }}
                >
                    <TouchableOpacity onPress={handlePickImage}>
                        <Box position="relative">
                            <Box
                                width={120}
                                height={120}
                                borderRadius={60}
                                backgroundColor="gray200"
                                overflow="hidden"
                                style={{
                                    borderWidth: 4,
                                    borderColor: theme.colors.primary,
                                }}
                            >
                                {avatarUrl ? (
                                    <Image
                                        source={{ uri: avatarUrl }}
                                        style={{ width: '100%', height: '100%' }}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <Box flex={1} justifyContent="center" alignItems="center">
                                        <Ionicons name="person" size={48} color={theme.colors.gray400} />
                                    </Box>
                                )}
                            </Box>
                            <Box
                                position="absolute"
                                bottom={0}
                                right={0}
                                backgroundColor="primary"
                                width={40}
                                height={40}
                                borderRadius={20}
                                alignItems="center"
                                justifyContent="center"
                                style={{
                                    borderWidth: 3,
                                    borderColor: theme.colors.white,
                                }}
                            >
                                <Ionicons name="camera" size={20} color="white" />
                            </Box>
                        </Box>
                    </TouchableOpacity>
                    <Text variant="caption" color="gray500" marginTop="m">
                        Tap to change profile photo
                    </Text>
                </Box>

                {/* Form Section */}
                <Box padding="m">
                    <Box marginBottom="m">
                        <Text variant="body" fontWeight="600" color="text" marginBottom="xs" marginLeft="xs">
                            Full Name
                        </Text>
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
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: 16,
                                    fontFamily: 'inherit',
                                    width: '100%',
                                    padding: 8,
                                    color: theme.colors.text,
                                }}
                            />
                        </Box>
                    </Box>

                    <Box marginBottom="m">
                        <Text variant="body" fontWeight="600" color="text" marginBottom="xs" marginLeft="xs">
                            Phone Number
                        </Text>
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
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Enter your phone number"
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: 16,
                                    fontFamily: 'inherit',
                                    width: '100%',
                                    padding: 8,
                                    color: theme.colors.text,
                                }}
                            />
                        </Box>
                    </Box>

                    <Box marginBottom="m">
                        <Text variant="body" fontWeight="600" color="text" marginBottom="xs" marginLeft="xs">
                            Email Address
                        </Text>
                        <Box
                            backgroundColor="gray200"
                            borderRadius={12}
                            paddingHorizontal="m"
                            paddingVertical="m"
                            style={{
                                borderWidth: 1,
                                borderColor: theme.colors.gray200,
                            }}
                        >
                            <Text color="gray500">{user?.email}</Text>
                        </Box>
                        <Text variant="caption" color="gray400" marginTop="xs" marginLeft="xs">
                            Email cannot be changed
                        </Text>
                    </Box>
                </Box>

                {/* Save Button - Mobile */}
                <Box paddingHorizontal="m" paddingBottom="xl">
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
                                    Save Changes
                                </Text>
                            )}
                        </Box>
                    </TouchableOpacity>
                </Box>
            </ScrollView>
        </Box>
    );
}
