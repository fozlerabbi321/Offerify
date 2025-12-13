import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// Types
export interface User {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    avatarUrl: string | null;
    role: 'customer' | 'vendor' | 'admin';
    isBanned: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Review {
    id: string;
    userId: string;
    vendorId: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    user?: {
        name: string;
        email: string;
        avatarUrl: string | null;
    };
    vendor?: {
        businessName: string;
    };
}

export interface PageContent {
    id?: string;
    slug: string;
    title: string;
    body: string;
    updatedAt?: string;
}

export interface AppSetting {
    id?: string;
    key: string;
    value: string;
}

export interface Vendor {
    id: string;
    businessName: string;
    slug: string;
    description?: string;
    contactPhone?: string;
    logoUrl?: string;
    createdAt: string;
    user?: {
        name?: string;
        email: string;
    };
    city?: {
        name: string;
    };
}

export interface PaginatedResponse<T> {
    items: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// ============================================================
// DASHBOARD STATS
// ============================================================

export const useAdminStats = () => {
    return useQuery({
        queryKey: ['admin', 'stats'],
        queryFn: async () => {
            const response = await api.get('/admin/stats');
            return response.data;
        },
    });
};

// ============================================================
// USER MANAGEMENT
// ============================================================

export const useAdminUsers = (params?: { page?: number; limit?: number; search?: string }) => {
    return useQuery({
        queryKey: ['admin', 'users', params],
        queryFn: async () => {
            const response = await api.get('/admin/users', { params });
            return response.data as PaginatedResponse<User>;
        },
    });
};

// ============================================================
// VENDOR MANAGEMENT
// ============================================================

export const useAdminVendors = (params?: { page?: number; limit?: number; search?: string }) => {
    return useQuery({
        queryKey: ['admin', 'vendors', params],
        queryFn: async () => {
            const response = await api.get('/admin/vendors', { params });
            return response.data as PaginatedResponse<Vendor>;
        },
    });
};

export const useToggleBan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userId: string) => {
            const response = await api.patch(`/admin/users/${userId}/ban`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        },
    });
};

// ============================================================
// REVIEW MODERATION
// ============================================================

export const useAdminReviews = (params?: { page?: number; limit?: number }) => {
    return useQuery({
        queryKey: ['admin', 'reviews', params],
        queryFn: async () => {
            const response = await api.get('/admin/reviews', { params });
            return response.data as PaginatedResponse<Review>;
        },
    });
};

export const useDeleteReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (reviewId: string) => {
            const response = await api.delete(`/admin/reviews/${reviewId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
        },
    });
};

// ============================================================
// CMS - PAGE CONTENT
// ============================================================

export const usePageContent = (slug: string) => {
    return useQuery({
        queryKey: ['admin', 'pages', slug],
        queryFn: async () => {
            const response = await api.get(`/admin/pages/${slug}`);
            return response.data as PageContent;
        },
    });
};

export const useUpdatePageContent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ slug, data }: { slug: string; data: { title: string; body: string } }) => {
            const response = await api.put(`/admin/pages/${slug}`, data);
            return response.data as PageContent;
        },
        onSuccess: (_, { slug }) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'pages', slug] });
        },
    });
};

// ============================================================
// GLOBAL SETTINGS
// ============================================================

export const useAdminSettings = () => {
    return useQuery({
        queryKey: ['admin', 'settings'],
        queryFn: async () => {
            const response = await api.get('/admin/settings');
            return response.data as { items: AppSetting[]; config: Record<string, string> };
        },
    });
};

export const useUpdateSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (settings: { key: string; value: string }[]) => {
            const response = await api.put('/admin/settings', { settings });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
        },
    });
};
