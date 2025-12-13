import React from 'react';
import { ScrollView, TouchableOpacity, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Box from '../../src/components/ui/Box';
import Text from '../../src/components/ui/Text';
import api from '../../src/lib/api';
import theme from '../../src/theme/theme';

interface VendorStats {
    totalViews: number;
    totalRedemptions: number;
    activeOffers: number;
    ratingAvg: number;
    reviewCount: number;
}

interface Offer {
    id: string;
    title: string;
    type: string;
    imageUrl?: string;
}

interface Review {
    id: string;
    rating: number;
    comment?: string;
    user?: { name: string };
    createdAt: string;
}

const fetchStats = async (): Promise<VendorStats> => {
    const response = await api.get('/vendors/stats');
    return response.data.data;
};

const fetchRecentOffers = async (): Promise<Offer[]> => {
    const response = await api.get('/offers/my-offers');
    const offers = response.data.data || response.data || [];
    return offers.slice(0, 5);
};

const fetchRecentReviews = async (): Promise<Review[]> => {
    const response = await api.get('/vendors/reviews/recent');
    return response.data.data || response.data || [];
};

// Skeleton Loading Component
const SkeletonCard = ({ width = '48%' }: { width?: string | number }) => (
    <Box
        width={width as any}
        height={80}
        backgroundColor="cardBackground"
        borderRadius={12}
        marginBottom="m"
        style={styles.skeletonPulse}
    />
);

const StatCard = ({ label, value, color }: { label: string; value: number | string; color: string }) => (
    <Box
        width="48%"
        backgroundColor={color as any}
        padding="m"
        borderRadius={12}
        marginBottom="m"
    >
        <Text color="textInverted" fontSize={14}>{label}</Text>
        <Text color="textInverted" fontSize={24} fontWeight="bold">
            {value}
        </Text>
    </Box>
);

const OfferCard = ({ offer, onPress }: { offer: Offer; onPress: () => void }) => (
    <TouchableOpacity onPress={onPress}>
        <Box
            width={140}
            marginRight="s"
            backgroundColor="cardBackground"
            borderRadius={12}
            overflow="hidden"
            style={styles.shadow}
        >
            <Box height={80} backgroundColor="neutral">
                {offer.imageUrl ? (
                    <Box flex={1} justifyContent="center" alignItems="center">
                        <Ionicons name="image-outline" size={32} color={theme.colors.textMuted} />
                    </Box>
                ) : (
                    <Box flex={1} justifyContent="center" alignItems="center">
                        <Ionicons name="pricetag-outline" size={32} color={theme.colors.textMuted} />
                    </Box>
                )}
            </Box>
            <Box padding="s">
                <Text fontSize={12} fontWeight="bold" numberOfLines={1}>{offer.title}</Text>
                <Text fontSize={10} color="textMuted" textTransform="capitalize">{offer.type}</Text>
            </Box>
        </Box>
    </TouchableOpacity>
);

const ReviewCard = ({ review }: { review: Review }) => (
    <Box
        backgroundColor="cardBackground"
        padding="m"
        borderRadius={12}
        marginBottom="s"
        style={styles.shadow}
    >
        <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="xs">
            <Text fontWeight="bold">{review.user?.name || 'Anonymous'}</Text>
            <Box flexDirection="row" alignItems="center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                        key={star}
                        name={star <= review.rating ? 'star' : 'star-outline'}
                        size={14}
                        color={star <= review.rating ? '#FFD700' : theme.colors.textMuted}
                    />
                ))}
            </Box>
        </Box>
        {review.comment && (
            <Text fontSize={14} color="textMuted" numberOfLines={2}>{review.comment}</Text>
        )}
    </Box>
);

export default function VendorDashboard() {
    const router = useRouter();

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['vendorStats'],
        queryFn: fetchStats,
        refetchOnMount: true,
    });

    const { data: recentOffers, isLoading: offersLoading } = useQuery({
        queryKey: ['vendorRecentOffers'],
        queryFn: fetchRecentOffers,
        refetchOnMount: true,
    });

    const { data: recentReviews, isLoading: reviewsLoading } = useQuery({
        queryKey: ['vendorRecentReviews'],
        queryFn: fetchRecentReviews,
        refetchOnMount: true,
    });

    return (
        <ScrollView style={{ flex: 1, backgroundColor: theme.colors.mainBackground }}>
            <Box padding="m">
                {/* Header */}
                <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="l">
                    <Text variant="header">Dashboard</Text>
                    <TouchableOpacity onPress={() => router.push('/vendor/post')}>
                        <Box flexDirection="row" alignItems="center" backgroundColor="primary" padding="s" borderRadius={8}>
                            <Ionicons name="add" size={24} color="white" />
                            <Text color="textInverted" fontWeight="bold" marginLeft="xs">New Offer</Text>
                        </Box>
                    </TouchableOpacity>
                </Box>

                {/* Stats Cards */}
                {statsLoading ? (
                    <Box flexDirection="row" flexWrap="wrap" justifyContent="space-between" marginBottom="l">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </Box>
                ) : (
                    <Box flexDirection="row" flexWrap="wrap" justifyContent="space-between" marginBottom="l">
                        <StatCard label="Total Views" value={stats?.totalViews || 0} color="cardPrimaryBackground" />
                        <StatCard label="Redemptions" value={stats?.totalRedemptions || 0} color="secondary" />
                        <StatCard label="Active Offers" value={stats?.activeOffers || 0} color="purpleDark" />
                        <StatCard label="Rating" value={stats?.ratingAvg?.toFixed(1) || '0.0'} color="success" />
                    </Box>
                )}

                {/* Quick Actions */}
                <Text variant="subheader" marginBottom="m">Quick Actions</Text>
                <Box flexDirection="row" flexWrap="wrap" justifyContent="space-between" marginBottom="l">
                    <TouchableOpacity onPress={() => router.push('/vendor/offers')} style={{ width: '48%' }}>
                        <Box
                            backgroundColor="cardBackground"
                            padding="m"
                            borderRadius={12}
                            alignItems="center"
                            style={styles.shadow}
                        >
                            <Ionicons name="pricetags-outline" size={32} color={theme.colors.primary} />
                            <Text marginTop="s" fontWeight="bold">My Offers</Text>
                        </Box>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/vendor/scan')} style={{ width: '48%' }}>
                        <Box
                            backgroundColor="cardBackground"
                            padding="m"
                            borderRadius={12}
                            alignItems="center"
                            style={styles.shadow}
                        >
                            <Ionicons name="qr-code-outline" size={32} color={theme.colors.primary} />
                            <Text marginTop="s" fontWeight="bold">Scan QR</Text>
                        </Box>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/vendor/post')} style={{ width: '48%', marginTop: 12 }}>
                        <Box
                            backgroundColor="cardBackground"
                            padding="m"
                            borderRadius={12}
                            alignItems="center"
                            style={styles.shadow}
                        >
                            <Ionicons name="create-outline" size={32} color={theme.colors.primary} />
                            <Text marginTop="s" fontWeight="bold">Create Offer</Text>
                        </Box>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/vendor/profile')} style={{ width: '48%', marginTop: 12 }}>
                        <Box
                            backgroundColor="cardBackground"
                            padding="m"
                            borderRadius={12}
                            alignItems="center"
                            style={styles.shadow}
                        >
                            <Ionicons name="storefront-outline" size={32} color={theme.colors.primary} />
                            <Text marginTop="s" fontWeight="bold">My Profile</Text>
                        </Box>
                    </TouchableOpacity>
                </Box>

                {/* Recent Offers Section */}
                <Box marginBottom="l">
                    <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
                        <Text variant="subheader">Recent Offers</Text>
                        <TouchableOpacity onPress={() => router.push('/vendor/offers')}>
                            <Text color="primary" fontSize={14}>View All</Text>
                        </TouchableOpacity>
                    </Box>
                    {offersLoading ? (
                        <Box flexDirection="row">
                            <SkeletonCard width={140} />
                            <Box width={8} />
                            <SkeletonCard width={140} />
                        </Box>
                    ) : recentOffers && recentOffers.length > 0 ? (
                        <FlatList
                            horizontal
                            data={recentOffers}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <OfferCard offer={item} onPress={() => router.push(`/offer/${item.id}`)} />
                            )}
                            showsHorizontalScrollIndicator={false}
                        />
                    ) : (
                        <Box padding="m" backgroundColor="cardBackground" borderRadius={12} alignItems="center">
                            <Ionicons name="pricetags-outline" size={32} color={theme.colors.textMuted} />
                            <Text color="textMuted" marginTop="s">No offers yet</Text>
                            <TouchableOpacity onPress={() => router.push('/vendor/post')}>
                                <Text color="primary" marginTop="xs">Create your first offer</Text>
                            </TouchableOpacity>
                        </Box>
                    )}
                </Box>

                {/* Latest Reviews Section */}
                <Box marginBottom="l">
                    <Text variant="subheader" marginBottom="m">Latest Reviews</Text>
                    {reviewsLoading ? (
                        <Box>
                            <SkeletonCard width="100%" />
                            <SkeletonCard width="100%" />
                        </Box>
                    ) : recentReviews && recentReviews.length > 0 ? (
                        recentReviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))
                    ) : (
                        <Box padding="m" backgroundColor="cardBackground" borderRadius={12} alignItems="center">
                            <Ionicons name="chatbubbles-outline" size={32} color={theme.colors.textMuted} />
                            <Text color="textMuted" marginTop="s">No reviews yet</Text>
                        </Box>
                    )}
                </Box>
            </Box>
        </ScrollView>
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
    skeletonPulse: {
        opacity: 0.6,
    },
});
