import api from '../lib/api';

export interface UpdateProfileDto {
    name?: string;
    phone?: string;
    avatarUrl?: string;
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

export const userProfileService = {
    getProfile: async () => {
        return api.get('/auth/profile');
    },

    updateProfile: async (data: UpdateProfileDto) => {
        return api.patch('/auth/profile', data);
    },

    changePassword: async (data: ChangePasswordDto) => {
        return api.post('/auth/change-password', data);
    }
};
