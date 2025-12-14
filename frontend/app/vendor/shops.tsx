import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, TextInput } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Box from '../../src/components/ui/Box';
import Text from '../../src/components/ui/Text';
import theme from '../../src/theme/theme';
import AuthWrapper from '../../src/components/auth/AuthWrapper';
import { shopsService, Shop, CreateShopDto } from '../../src/services/shops.service';
import api from '../../src/lib/api';

interface City {
    id: number;
    name: string;
}

const fetchCities = async (): Promise<City[]> => {
    const response = await api.get('/location/cities');
    return response.data;
};

export default function ManageShops() {
    return (
        <AuthWrapper>
            <ManageShopsContent />
        </AuthWrapper>
    );
}

function ManageShopsContent() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingShop, setEditingShop] = useState<Shop | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<CreateShopDto>>({
        name: '',
        cityId: 0,
        latitude: 23.7925,
        longitude: 90.4078,
        address: '',
        contactNumber: '',
        isDefault: false,
    });

    const { data: shops, isLoading: shopsLoading } = useQuery({
        queryKey: ['vendorShops'],
        queryFn: shopsService.getMyShops,
    });

    const { data: cities } = useQuery({
        queryKey: ['cities'],
        queryFn: fetchCities,
    });

    const createMutation = useMutation({
        mutationFn: shopsService.createShop,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendorShops'] });
            setShowCreateModal(false);
            resetForm();
            Alert.alert('Success', 'Shop created successfully!');
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create shop');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateShopDto> }) =>
            shopsService.updateShop(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendorShops'] });
            setEditingShop(null);
            resetForm();
            Alert.alert('Success', 'Shop updated successfully!');
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update shop');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: shopsService.deleteShop,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendorShops'] });
            Alert.alert('Success', 'Shop deleted successfully!');
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to delete shop');
        },
    });

    const resetForm = () => {
        setFormData({
            name: '',
            cityId: 0,
            latitude: 23.7925,
            longitude: 90.4078,
            address: '',
            contactNumber: '',
            isDefault: false,
        });
    };

    const handleEdit = (shop: Shop) => {
        setEditingShop(shop);
        setFormData({
            name: shop.name,
            cityId: shop.cityId,
            latitude: shop.location?.coordinates[1] || 23.7925,
            longitude: shop.location?.coordinates[0] || 90.4078,
            address: shop.address || '',
            contactNumber: shop.contactNumber || '',
            isDefault: shop.isDefault,
        });
    };

    const handleDelete = (shop: Shop) => {
        if (shop.isDefault) {
            Alert.alert('Cannot Delete', 'Cannot delete the default shop. Set another shop as default first.');
            return;
        }
        Alert.alert(
            'Delete Shop',
            `Are you sure you want to delete "${shop.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(shop.id) },
            ]
        );
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.cityId) {
            Alert.alert('Validation Error', 'Please fill in shop name and select a city');
            return;
        }

        const data: CreateShopDto = {
            name: formData.name!,
            cityId: formData.cityId!,
            latitude: formData.latitude!,
            longitude: formData.longitude!,
            address: formData.address,
            contactNumber: formData.contactNumber,
            isDefault: formData.isDefault,
        };

        if (editingShop) {
            updateMutation.mutate({ id: editingShop.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const ShopCard = ({ shop }: { shop: Shop }) => (
        <Box
            backgroundColor="cardBackground"
            padding="m"
            borderRadius={12}
            marginBottom="m"
            style={styles.shadow}
        >
            <Box flexDirection="row" justifyContent="space-between" alignItems="flex-start">
                <Box flex={1}>
                    <Box flexDirection="row" alignItems="center" marginBottom="xs">
                        <Text fontWeight="bold" fontSize={16}>{shop.name}</Text>
                        {shop.isDefault && (
                            <Box backgroundColor="primary" paddingHorizontal="s" paddingVertical="xs" borderRadius={4} marginLeft="s">
                                <Text color="textInverted" fontSize={10} fontWeight="bold">DEFAULT</Text>
                            </Box>
                        )}
                    </Box>
                    <Box flexDirection="row" alignItems="center" marginBottom="xs">
                        <Ionicons name="location-outline" size={14} color={theme.colors.textMuted} />
                        <Text color="textMuted" fontSize={12} marginLeft="xs">{shop.city?.name || 'Unknown Zone'}</Text>
                    </Box>
                    {shop.address && (
                        <Text color="textMuted" fontSize={12} numberOfLines={2}>{shop.address}</Text>
                    )}
                    {shop.contactNumber && (
                        <Box flexDirection="row" alignItems="center" marginTop="xs">
                            <Ionicons name="call-outline" size={14} color={theme.colors.textMuted} />
                            <Text color="textMuted" fontSize={12} marginLeft="xs">{shop.contactNumber}</Text>
                        </Box>
                    )}
                </Box>
                <Box flexDirection="row">
                    <TouchableOpacity onPress={() => handleEdit(shop)} style={{ padding: 8 }}>
                        <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(shop)} style={{ padding: 8 }}>
                        <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                    </TouchableOpacity>
                </Box>
            </Box>
        </Box>
    );

    const FormModal = () => (
        <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            justifyContent="center"
            alignItems="center"
            padding="m"
        >
            <Box
                backgroundColor="cardBackground"
                borderRadius={16}
                padding="l"
                width="100%"
                maxWidth={400}
            >
                <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="l">
                    <Text variant="subheader">{editingShop ? 'Edit Shop' : 'Add New Shop'}</Text>
                    <TouchableOpacity onPress={() => { setShowCreateModal(false); setEditingShop(null); resetForm(); }}>
                        <Ionicons name="close" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                </Box>

                {/* Shop Name */}
                <Text fontSize={14} fontWeight="bold" marginBottom="xs">Shop Name *</Text>
                <TextInput
                    style={styles.input}
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    placeholder="e.g., Gulshan Branch"
                    placeholderTextColor={theme.colors.textMuted}
                />

                {/* City Selection */}
                <Text fontSize={14} fontWeight="bold" marginBottom="xs" marginTop="m">Zone (City) *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                    {cities?.map((city) => (
                        <TouchableOpacity
                            key={city.id}
                            onPress={() => setFormData({ ...formData, cityId: city.id })}
                            style={[
                                styles.cityChip,
                                formData.cityId === city.id && styles.cityChipSelected,
                            ]}
                        >
                            <Text
                                fontSize={12}
                                color={formData.cityId === city.id ? 'textInverted' : 'text'}
                            >
                                {city.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Address */}
                <Text fontSize={14} fontWeight="bold" marginBottom="xs" marginTop="m">Address</Text>
                <TextInput
                    style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                    value={formData.address}
                    onChangeText={(text) => setFormData({ ...formData, address: text })}
                    placeholder="Full address"
                    placeholderTextColor={theme.colors.textMuted}
                    multiline
                />

                {/* Contact Number */}
                <Text fontSize={14} fontWeight="bold" marginBottom="xs" marginTop="m">Contact Number</Text>
                <TextInput
                    style={styles.input}
                    value={formData.contactNumber}
                    onChangeText={(text) => setFormData({ ...formData, contactNumber: text })}
                    placeholder="+8801XXXXXXXXX"
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType="phone-pad"
                />

                {/* Default Toggle */}
                <TouchableOpacity
                    onPress={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
                    style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}
                >
                    <Box
                        width={24}
                        height={24}
                        borderRadius={4}
                        borderWidth={2}
                        borderColor={formData.isDefault ? 'primary' : 'textMuted'}
                        backgroundColor={formData.isDefault ? 'primary' : 'transparent'}
                        justifyContent="center"
                        alignItems="center"
                    >
                        {formData.isDefault && <Ionicons name="checkmark" size={16} color="white" />}
                    </Box>
                    <Text marginLeft="s">Set as default shop</Text>
                </TouchableOpacity>

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    style={[styles.submitButton, (createMutation.isPending || updateMutation.isPending) && { opacity: 0.6 }]}
                >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text color="textInverted" fontWeight="bold">
                            {editingShop ? 'Update Shop' : 'Create Shop'}
                        </Text>
                    )}
                </TouchableOpacity>
            </Box>
        </Box>
    );

    return (
        <Box flex={1} backgroundColor="mainBackground">
            <ScrollView style={{ flex: 1 }}>
                <Box padding="m">
                    {/* Header */}
                    <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="l">
                        <Box flexDirection="row" alignItems="center">
                            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
                                <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                            <Text variant="header">Manage Shops</Text>
                        </Box>
                        <TouchableOpacity onPress={() => setShowCreateModal(true)}>
                            <Box flexDirection="row" alignItems="center" backgroundColor="primary" padding="s" borderRadius={8}>
                                <Ionicons name="add" size={20} color="white" />
                                <Text color="textInverted" fontWeight="bold" marginLeft="xs">Add Shop</Text>
                            </Box>
                        </TouchableOpacity>
                    </Box>

                    {/* Info Banner */}
                    <Box backgroundColor="cardPrimaryBackground" padding="m" borderRadius={12} marginBottom="l">
                        <Box flexDirection="row" alignItems="center">
                            <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
                            <Box flex={1} marginLeft="s">
                                <Text fontWeight="bold" color="primary">Multi-Shop Support</Text>
                                <Text fontSize={12} color="textMuted">
                                    Add multiple shop locations. Offers can be linked to specific shops for accurate map display.
                                </Text>
                            </Box>
                        </Box>
                    </Box>

                    {/* Shops List */}
                    {shopsLoading ? (
                        <Box padding="xl" alignItems="center">
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                        </Box>
                    ) : shops && shops.length > 0 ? (
                        shops.map((shop) => <ShopCard key={shop.id} shop={shop} />)
                    ) : (
                        <Box padding="xl" backgroundColor="cardBackground" borderRadius={12} alignItems="center">
                            <Ionicons name="storefront-outline" size={48} color={theme.colors.textMuted} />
                            <Text color="textMuted" marginTop="m">No shops yet</Text>
                            <TouchableOpacity onPress={() => setShowCreateModal(true)}>
                                <Text color="primary" marginTop="s" fontWeight="bold">Add your first shop</Text>
                            </TouchableOpacity>
                        </Box>
                    )}
                </Box>
            </ScrollView>

            {/* Create/Edit Modal */}
            {(showCreateModal || editingShop) && <FormModal />}
        </Box>
    );
}

const styles = StyleSheet.create({
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    input: {
        backgroundColor: theme.colors.inputBackground,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cityChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.neutral,
        marginRight: 8,
    },
    cityChipSelected: {
        backgroundColor: theme.colors.primary,
    },
    submitButton: {
        backgroundColor: theme.colors.primary,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
});
