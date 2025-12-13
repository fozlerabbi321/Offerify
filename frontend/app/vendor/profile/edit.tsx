import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { vendorProfileService } from '../../../src/services/vendor-profile.service';
import { imageUploadService } from '../../../src/services/image-upload.service';
import Box from '../../../src/components/ui/Box';
import Text from '../../../src/components/ui/Text';
import theme from '../../../src/theme/theme';

export default function EditVendorProfileScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [businessName, setBusinessName] = useState('');
    const [description, setDescription] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data: any = await vendorProfileService.getMyProfile();
            if (data) {
                setBusinessName(data.businessName || '');
                setDescription(data.description || '');
                setContactPhone(data.contactPhone || '');
                setLogoUrl(data.logoUrl || '');
                setCoverImageUrl(data.coverImageUrl || '');
                if (data.location?.coordinates) {
                    setLongitude(String(data.location.coordinates[0]));
                    setLatitude(String(data.location.coordinates[1]));
                }
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePickImage = async (type: 'logo' | 'cover') => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: type === 'logo' ? [1, 1] : [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            if (type === 'logo') setLogoUrl(result.assets[0].uri);
            else setCoverImageUrl(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            let finalLogoUrl = logoUrl;
            let finalCoverUrl = coverImageUrl;

            // Upload logo if needed
            if (logoUrl && (logoUrl.startsWith('file://') || logoUrl.startsWith('blob:'))) {
                const uploadResult = await imageUploadService.uploadImage(logoUrl);
                if (typeof uploadResult === 'string') {
                    finalLogoUrl = uploadResult;
                } else if (uploadResult?.url) {
                    finalLogoUrl = uploadResult.url;
                } else if (uploadResult?.data?.url) {
                    finalLogoUrl = uploadResult.data.url;
                }
            }

            // Upload cover if needed
            if (coverImageUrl && (coverImageUrl.startsWith('file://') || coverImageUrl.startsWith('blob:'))) {
                const uploadResult = await imageUploadService.uploadImage(coverImageUrl);
                if (typeof uploadResult === 'string') {
                    finalCoverUrl = uploadResult;
                } else if (uploadResult?.url) {
                    finalCoverUrl = uploadResult.url;
                } else if (uploadResult?.data?.url) {
                    finalCoverUrl = uploadResult.data.url;
                }
            }

            await vendorProfileService.updateProfile({
                businessName,
                description,
                contactPhone,
                logoUrl: finalLogoUrl,
                coverImageUrl: finalCoverUrl,
                latitude: latitude ? parseFloat(latitude) : undefined,
                longitude: longitude ? parseFloat(longitude) : undefined,
            });

            setIsSaving(false);
            router.push('/vendor/profile');
        } catch (error: any) {
            console.error('Update error:', error);
            setIsSaving(false);
            Alert.alert('Error', error?.response?.data?.message || 'Failed to update profile');
        }
    };

    if (isLoading) {
        return (
            <Box flex={1} backgroundColor="mainBackground" justifyContent="center" alignItems="center">
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </Box>
        );
    }

    return (
        <Box flex={1} backgroundColor="mainBackground">
            <Stack.Screen options={{
                headerShown: true,
                title: 'Edit Vendor Profile',
                headerRight: () => (
                    <TouchableOpacity onPress={handleSave} disabled={isSaving} style={{ marginRight: 16 }}>
                        {isSaving ? (
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                        ) : (
                            <Text color="primary" fontWeight="bold" fontSize={16}>Save</Text>
                        )}
                    </TouchableOpacity>
                ),
            }} />

            <ScrollView style={{ flex: 1 }}>
                {/* Cover Image Section */}
                <Box
                    backgroundColor="primary"
                    paddingVertical="xl"
                    paddingHorizontal="m"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                    }}
                >
                    <Text variant="body" fontWeight="600" color="textInverted" marginBottom="s">
                        Cover Image
                    </Text>
                    <TouchableOpacity onPress={() => handlePickImage('cover')}>
                        <Box
                            height={160}
                            backgroundColor="white"
                            borderRadius={12}
                            overflow="hidden"
                            justifyContent="center"
                            alignItems="center"
                        >
                            {coverImageUrl ? (
                                <Image
                                    source={{ uri: coverImageUrl }}
                                    style={{ width: '100%', height: '100%' }}
                                    resizeMode="cover"
                                />
                            ) : (
                                <Ionicons name="image" size={48} color={theme.colors.gray400} />
                            )}
                            <Box
                                position="absolute"
                                bottom={8}
                                right={8}
                                backgroundColor="white"
                                paddingHorizontal="s"
                                paddingVertical="xs"
                                borderRadius={20}
                                flexDirection="row"
                                alignItems="center"
                            >
                                <Ionicons name="camera" size={16} color={theme.colors.primary} />
                                <Text fontSize={12} fontWeight="bold" color="primary" marginLeft="xs">
                                    Change
                                </Text>
                            </Box>
                        </Box>
                    </TouchableOpacity>
                </Box>

                {/* Form Section */}
                <Box padding="m">
                    {/* Logo Upload */}
                    <Box alignItems="center" marginBottom="m" style={{ marginTop: -50 }}>
                        <TouchableOpacity onPress={() => handlePickImage('logo')}>
                            <Box
                                width={100}
                                height={100}
                                borderRadius={20}
                                backgroundColor="white"
                                padding="xs"
                                style={{
                                    borderWidth: 4,
                                    borderColor: theme.colors.white,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 8,
                                }}
                            >
                                <Box flex={1} backgroundColor="gray200" borderRadius={16} overflow="hidden" justifyContent="center" alignItems="center">
                                    {logoUrl ? (
                                        <Image
                                            source={{ uri: logoUrl }}
                                            style={{ width: '100%', height: '100%' }}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <Ionicons name="storefront" size={40} color={theme.colors.gray400} />
                                    )}
                                    <Box
                                        position="absolute"
                                        width={30}
                                        height={30}
                                        borderRadius={15}
                                        backgroundColor="primary"
                                        justifyContent="center"
                                        alignItems="center"
                                        bottom={-5}
                                        right={-5}
                                        style={{
                                            borderWidth: 3,
                                            borderColor: theme.colors.white,
                                        }}
                                    >
                                        <Ionicons name="camera" size={16} color="white" />
                                    </Box>
                                </Box>
                            </Box>
                        </TouchableOpacity>
                        <Text variant="caption" color="gray500" marginTop="s">
                            Tap to change logo
                        </Text>
                    </Box>

                    {/* Business Name */}
                    <Box marginBottom="m">
                        <Text variant="body" fontWeight="600" color="text" marginBottom="xs" marginLeft="xs">
                            Business Name
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
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                placeholder="e.g. Tasty Burgers"
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

                    {/* Description */}
                    <Box marginBottom="m">
                        <Text variant="body" fontWeight="600" color="text" marginBottom="xs" marginLeft="xs">
                            Description
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
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your business..."
                                rows={4}
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: 16,
                                    fontFamily: 'inherit',
                                    width: '100%',
                                    padding: 8,
                                    color: theme.colors.text,
                                    resize: 'vertical',
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Contact Phone */}
                    <Box marginBottom="m">
                        <Text variant="body" fontWeight="600" color="text" marginBottom="xs" marginLeft="xs">
                            Contact Phone
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
                                value={contactPhone}
                                onChange={(e) => setContactPhone(e.target.value)}
                                placeholder="+88..."
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

                    {/* Location Coordinates */}
                    <Box marginBottom="xl">
                        <Text variant="body" fontWeight="600" color="text" marginBottom="xs" marginLeft="xs">
                            Location Coordinates
                        </Text>
                        <Box flexDirection="row" gap="s">
                            <Box flex={1}>
                                <Text variant="caption" color="gray500" marginBottom="xs">Latitude</Text>
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
                                        type="number"
                                        value={latitude}
                                        onChange={(e) => setLatitude(e.target.value)}
                                        placeholder="0.0000"
                                        step="0.0001"
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
                            <Box flex={1}>
                                <Text variant="caption" color="gray500" marginBottom="xs">Longitude</Text>
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
                                        type="number"
                                        value={longitude}
                                        onChange={(e) => setLongitude(e.target.value)}
                                        placeholder="0.0000"
                                        step="0.0001"
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
                        </Box>
                        <Text variant="caption" color="gray400" marginTop="s" marginLeft="xs">
                            * Enter coordinates manually. Map picker coming soon.
                        </Text>
                    </Box>

                    {/* Save Button - Mobile */}
                    <TouchableOpacity onPress={handleSave} disabled={isSaving}>
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
                            {isSaving ? (
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
