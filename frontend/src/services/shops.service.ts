import api from '../lib/api';

export interface Shop {
    id: string;
    name: string;
    vendorId: string;
    cityId: number;
    city?: {
        id: number;
        name: string;
    };
    location?: {
        type: string;
        coordinates: [number, number]; // [longitude, latitude]
    };
    address?: string;
    contactNumber?: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateShopDto {
    name: string;
    cityId: number;
    latitude: number;
    longitude: number;
    address?: string;
    contactNumber?: string;
    isDefault?: boolean;
}

export interface UpdateShopDto {
    name?: string;
    cityId?: number;
    latitude?: number;
    longitude?: number;
    address?: string;
    contactNumber?: string;
    isDefault?: boolean;
}

export const shopsService = {
    /**
     * Get all shops for the logged-in vendor
     */
    getMyShops: async (): Promise<Shop[]> => {
        const response = await api.get('/vendor/shops');
        return response.data;
    },

    /**
     * Get a specific shop by ID
     */
    getShop: async (id: string): Promise<Shop> => {
        const response = await api.get(`/vendor/shops/${id}`);
        return response.data;
    },

    /**
     * Create a new shop
     */
    createShop: async (data: CreateShopDto): Promise<Shop> => {
        const response = await api.post('/vendor/shops', data);
        return response.data;
    },

    /**
     * Update a shop
     */
    updateShop: async (id: string, data: UpdateShopDto): Promise<Shop> => {
        const response = await api.patch(`/vendor/shops/${id}`, data);
        return response.data;
    },

    /**
     * Delete a shop
     */
    deleteShop: async (id: string): Promise<void> => {
        await api.delete(`/vendor/shops/${id}`);
    },
};
