import React, { useState, useEffect } from 'react';
import { Modal, ScrollView, TextInput, TouchableOpacity, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import Box from '../ui/Box';
import Text from '../ui/Text';
import { Theme } from '../../theme/theme';
import api from '../../lib/api';

interface EditOfferModalProps {
    visible: boolean;
    offerId: string | null;
    onClose: () => void;
}

interface UpdateOfferDto {
    title?: string;
    description?: string;
    discountPercentage?: number;
    couponCode?: string;
    voucherValue?: number;
    isActive?: boolean;
}

const inputStyle = {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
    fontSize: 16,
};

const fetchOffer = async (offerId: string) => {
    const response = await api.get(`/offers/${offerId}`);
    return response.data;
};

const updateOffer = async ({ offerId, data }: { offerId: string; data: UpdateOfferDto }) => {
    const response = await api.patch(`/offers/${offerId}`, data);
    return response.data;
};

const EditOfferModal: React.FC<EditOfferModalProps> = ({ visible, offerId, onClose }) => {
    const theme = useTheme<Theme>();
    const queryClient = useQueryClient();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [discountPercentage, setDiscountPercentage] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [voucherValue, setVoucherValue] = useState('');
    const [isActive, setIsActive] = useState(true);

    const { data: offer } = useQuery({
        queryKey: ['offer', offerId],
        queryFn: () => fetchOffer(offerId!),
        enabled: !!offerId && visible,
    });

    useEffect(() => {
        if (offer) {
            setTitle(offer.title || '');
            setDescription(offer.description || '');
            setDiscountPercentage(offer.discountPercentage?.toString() || '');
            setCouponCode(offer.couponCode || '');
            setVoucherValue(offer.voucherValue?.toString() || '');
            setIsActive(offer.isActive ?? true);
        }
    }, [offer]);

    const mutation = useMutation({
        mutationFn: updateOffer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendorOffers'] });
            queryClient.invalidateQueries({ queryKey: ['offer', offerId] });

            if (Platform.OS === 'web') {
                window.alert('Offer updated successfully!');
            } else {
                Alert.alert('Success', 'Offer updated successfully!');
            }
            onClose();
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || 'Failed to update offer';
            if (Platform.OS === 'web') {
                window.alert(`Error: ${errorMessage}`);
            } else {
                Alert.alert('Error', errorMessage);
            }
        },
    });

    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a title');
            return;
        }
        if (!description.trim()) {
            Alert.alert('Error', 'Please enter a description');
            return;
        }

        const updateData: UpdateOfferDto = {
            title: title.trim(),
            description: description.trim(),
            isActive,
        };

        // Add type-specific fields
        if (offer?.type === 'discount' && discountPercentage) {
            updateData.discountPercentage = parseFloat(discountPercentage);
        }
        if (offer?.type === 'coupon' && couponCode) {
            updateData.couponCode = couponCode.trim();
        }
        if (offer?.type === 'voucher' && voucherValue) {
            updateData.voucherValue = parseInt(voucherValue);
        }

        mutation.mutate({ offerId: offerId!, data: updateData });
    };

    if (!offer) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <Box flex={1} backgroundColor="mainBackground">
                {/* Header */}
                <Box
                    backgroundColor="white"
                    paddingHorizontal="m"
                    paddingTop={Platform.OS === 'ios' ? 'xl' : 'm'}
                    paddingBottom="m"
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                    }}
                >
                    <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                        <Box
                            width={40}
                            height={40}
                            borderRadius={20}
                            backgroundColor="offWhite"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Ionicons name="close" size={24} color={theme.colors.text} />
                        </Box>
                    </TouchableOpacity>
                    <Text variant="subheader">Edit Offer</Text>
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={mutation.isPending}
                        activeOpacity={0.7}
                    >
                        <Box
                            paddingHorizontal="m"
                            paddingVertical="s"
                            backgroundColor="primary"
                            borderRadius={8}
                            opacity={mutation.isPending ? 0.7 : 1}
                        >
                            <Text fontSize={14} fontWeight="600" color="textInverted">
                                {mutation.isPending ? 'Saving...' : 'Save'}
                            </Text>
                        </Box>
                    </TouchableOpacity>
                </Box>

                <ScrollView
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Active Toggle */}
                    <Box
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="space-between"
                        backgroundColor="white"
                        padding="m"
                        borderRadius={12}
                        marginBottom="m"
                    >
                        <Text fontWeight="600">Offer Status</Text>
                        <TouchableOpacity
                            onPress={() => setIsActive(!isActive)}
                            activeOpacity={0.7}
                        >
                            <Box
                                flexDirection="row"
                                alignItems="center"
                                backgroundColor={isActive ? 'cardPrimaryBackground' : 'gray'}
                                paddingHorizontal="m"
                                paddingVertical="s"
                                borderRadius={20}
                            >
                                <Box
                                    width={8}
                                    height={8}
                                    borderRadius={4}
                                    backgroundColor="white"
                                    marginRight="xs"
                                />
                                <Text fontSize={14} fontWeight="600" color="textInverted">
                                    {isActive ? 'Active' : 'Inactive'}
                                </Text>
                            </Box>
                        </TouchableOpacity>
                    </Box>

                    {/* Title */}
                    <Text marginBottom="s" fontWeight="600">
                        Title <Text color="error">*</Text>
                    </Text>
                    <TextInput
                        placeholder="e.g., 50% Off Whopper"
                        value={title}
                        onChangeText={setTitle}
                        style={inputStyle}
                        placeholderTextColor="#999"
                    />

                    {/* Description */}
                    <Text marginBottom="s" fontWeight="600">
                        Description <Text color="error">*</Text>
                    </Text>
                    <TextInput
                        placeholder="Describe your offer..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        style={{ ...inputStyle, height: 100, textAlignVertical: 'top' }}
                        placeholderTextColor="#999"
                    />

                    {/* Type-specific fields */}
                    {offer.type === 'discount' && (
                        <>
                            <Text marginBottom="s" fontWeight="600">
                                Discount Percentage
                            </Text>
                            <Box flexDirection="row" alignItems="center" marginBottom="m">
                                <TextInput
                                    placeholder="e.g., 20"
                                    value={discountPercentage}
                                    onChangeText={setDiscountPercentage}
                                    keyboardType="numeric"
                                    style={{ ...inputStyle, flex: 1, marginBottom: 0, marginRight: 8 }}
                                    placeholderTextColor="#999"
                                />
                                <Text fontSize={18} fontWeight="600">%</Text>
                            </Box>
                        </>
                    )}

                    {offer.type === 'coupon' && (
                        <>
                            <Text marginBottom="s" fontWeight="600">
                                Coupon Code
                            </Text>
                            <TextInput
                                placeholder="e.g., FRIES24"
                                value={couponCode}
                                onChangeText={(text) => setCouponCode(text.toUpperCase())}
                                autoCapitalize="characters"
                                style={inputStyle}
                                placeholderTextColor="#999"
                            />
                        </>
                    )}

                    {offer.type === 'voucher' && (
                        <>
                            <Text marginBottom="s" fontWeight="600">
                                Voucher Value
                            </Text>
                            <Box flexDirection="row" alignItems="center" marginBottom="m">
                                <Text fontSize={18} fontWeight="600" marginRight="s">৳</Text>
                                <TextInput
                                    placeholder="e.g., 500"
                                    value={voucherValue}
                                    onChangeText={setVoucherValue}
                                    keyboardType="numeric"
                                    style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                                    placeholderTextColor="#999"
                                />
                            </Box>
                        </>
                    )}

                    {/* Info Box */}
                    <Box
                        backgroundColor="offWhite"
                        padding="m"
                        borderRadius={12}
                        flexDirection="row"
                        marginTop="m"
                    >
                        <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
                        <Text fontSize={13} color="darkGray" marginLeft="s" flex={1}>
                            Changes will be saved immediately and reflect on the customer app
                        </Text>
                    </Box>
                </ScrollView>
            </Box>
        </Modal>
    );
};

export default EditOfferModal;
