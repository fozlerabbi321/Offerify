import api from '../lib/api';

export interface UpdateVendorDto {
    businessName?: string;
    description?: string;
    contactPhone?: string;
    logoUrl?: string;
    coverImageUrl?: string;
    latitude?: number;
    longitude?: number;
}

export const vendorProfileService = {
    getMyProfile: async () => {
        return api.get('/vendors/me');
    },

    updateProfile: async (data: UpdateVendorDto) => {
        return api.patch('/vendors/me', data);
    },

    getPublicProfile: async (id: string) => {
        return api.get(`/vendors/${id}`);
    }
};
