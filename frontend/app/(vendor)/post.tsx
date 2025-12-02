import React, { useState } from 'react';
import { ScrollView, TextInput, TouchableOpacity, Alert, Image as RNImage } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import Box from '../../src/components/ui/Box';
import Text from '../../src/components/ui/Text';
import api from '../../src/lib/api';
import theme from '../../src/theme/theme';

const fetchCategories = async () => {
    const response = await api.get('/categories');
    return response.data.data;
};

const createOffer = async (formData: FormData) => {
    const response = await api.post('/offers', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export default function PostOfferScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [discountedPrice, setDiscountedPrice] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });

    const mutation = useMutation({
        mutationFn: createOffer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['offers'] });
            queryClient.invalidateQueries({ queryKey: ['vendorStats'] });
            Alert.alert('Success', 'Offer created successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        },
        onError: (err: any) => {
            console.error(err);
            Alert.alert('Error', err.response?.data?.message || 'Failed to create offer');
        },
    });

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const handleSubmit = () => {
        if (!title || !description || !price || !categoryId || !image) {
            Alert.alert('Error', 'Please fill all required fields and select an image.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('price', price); // Assuming backend handles price as string or number
        // Note: Backend CreateOfferDto might expect 'voucherValue' or 'discountPercentage' depending on type.
        // For simplicity, assuming 'discount' type and 'price' is not directly in DTO but 'voucherValue' is?
        // Let's check CreateOfferDto.
        // It has `voucherValue`, `discountPercentage`.
        // It does NOT have `price` field directly?
        // Wait, `Offer` entity has `price`. `CreateOfferDto` has `voucherValue`?
        // Let's assume `type` is 'voucher' and `voucherValue` is the price.
        // Or `type` is 'discount'.
        // Let's set type to 'voucher' for now.
        formData.append('type', 'voucher');
        formData.append('voucherValue', price);
        if (discountedPrice) {
            formData.append('discountedPrice', discountedPrice); // If backend supports it
        }
        formData.append('categoryId', categoryId);

        // File
        const file: any = {
            uri: image.uri,
            name: image.fileName || 'offer.jpg',
            type: image.mimeType || 'image/jpeg',
        };
        formData.append('file', file);

        mutation.mutate(formData);
    };

    return (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} style={{ backgroundColor: theme.colors.mainBackground }}>
            <Text variant="header" marginBottom="l">Create Offer</Text>

            <TouchableOpacity onPress={pickImage}>
                <Box
                    height={200}
                    backgroundColor="gray"
                    borderRadius={12}
                    justifyContent="center"
                    alignItems="center"
                    marginBottom="l"
                    overflow="hidden"
                >
                    {image ? (
                        <RNImage source={{ uri: image.uri }} style={{ width: '100%', height: '100%' }} />
                    ) : (
                        <Box alignItems="center">
                            <Ionicons name="image-outline" size={48} color="white" />
                            <Text color="textInverted" marginTop="s">Tap to select image</Text>
                        </Box>
                    )}
                </Box>
            </TouchableOpacity>

            <Text marginBottom="s">Title</Text>
            <TextInput
                placeholder="Offer Title"
                value={title}
                onChangeText={setTitle}
                style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 16 }}
            />

            <Text marginBottom="s">Description</Text>
            <TextInput
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 16, height: 100 }}
            />

            <Text marginBottom="s">Price (Voucher Value)</Text>
            <TextInput
                placeholder="Price"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 16 }}
            />

            <Text marginBottom="s">Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {categories?.map((cat: any) => (
                    <TouchableOpacity key={cat.id} onPress={() => setCategoryId(cat.id)}>
                        <Box
                            padding="m"
                            backgroundColor={categoryId === cat.id ? 'primary' : 'offWhite'}
                            borderRadius={20}
                            marginRight="s"
                            borderWidth={1}
                            borderColor={categoryId === cat.id ? 'primary' : 'gray'}
                        >
                            <Text color={categoryId === cat.id ? 'textInverted' : 'text'}>{cat.name}</Text>
                        </Box>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity onPress={handleSubmit} disabled={mutation.isPending}>
                <Box
                    backgroundColor="primary"
                    padding="m"
                    borderRadius={8}
                    alignItems="center"
                    opacity={mutation.isPending ? 0.7 : 1}
                >
                    <Text color="textInverted" fontWeight="bold" fontSize={18}>
                        {mutation.isPending ? 'Creating...' : 'Post Offer'}
                    </Text>
                </Box>
            </TouchableOpacity>
        </ScrollView>
    );
}
