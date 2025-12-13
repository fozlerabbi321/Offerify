import api from '../lib/api';
import { Platform } from 'react-native';

export const imageUploadService = {
    uploadImage: async (fileUri: string, mimeType: string = 'image/jpeg'): Promise<any> => {
        const formData = new FormData();

        if (Platform.OS === 'web') {
            // Web: Convert blob URL to File object
            if (fileUri.startsWith('blob:')) {
                try {
                    const response = await fetch(fileUri);
                    const blob = await response.blob();
                    const fileName = `image_${Date.now()}.jpg`;
                    const file = new File([blob], fileName, { type: blob.type || mimeType });
                    formData.append('file', file);
                } catch (error) {
                    console.error('Failed to convert blob to file:', error);
                    throw new Error('Failed to process image');
                }
            } else {
                throw new Error('Invalid file URI for web platform');
            }
        } else {
            // React Native: Use URI-based file object
            const file = {
                uri: fileUri,
                name: fileUri.split('/').pop() || 'image.jpg',
                type: mimeType,
            };
            formData.append('file', file as any);
        }

        const response = await api.post('/media/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        // api.ts unwraps response.data, so response is the data object { url: ... }
        return typeof response === 'string' ? response : (response as any)?.url || response;
    }
};
