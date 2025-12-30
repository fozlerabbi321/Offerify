
import React from 'react';
import { FlatList, ScrollView, RefreshControl } from 'react-native';
import Container from '../../src/components/ui/Container';
import Text from '../../src/components/ui/Text';
import Box from '../../src/components/ui/Box';
import { useQuery } from '@tanstack/react-query';
import api from '../../src/lib/api';
import Categories from '../../src/components/home/Categories';
import OfferCard from '../../src/components/home/OfferCard';
import { useLocationStore } from '../../src/store/location.store';
import ResponsiveGrid from '../../src/components/ui/ResponsiveGrid';
import HomeHero from '../../src/components/home/HomeHero';
import { CategorySkeleton, OfferCardSkeleton } from '../../src/components/ui/SkeletonLoaders';

const HeroSection = ({ offers }: { offers: any[] }) => {
    if (!offers || offers.length === 0) return null;
    return (
        <Box height={200} backgroundColor="cardPrimaryBackground" margin="m" borderRadius="l" justifyContent="center" alignItems="center" overflow="hidden">
            {/* Placeholder for Carousel */}
            <Text variant="header" color="textInverted">{offers[0]?.title}</Text>
        </Box>
    )
}

const HorizontalSection = ({ title, offers, loading }: { title: string, offers: any[], loading?: boolean }) => {
    if (!loading && (!offers || offers.length === 0)) return null;
    return (
        <Box marginBottom="l">
            <Box paddingHorizontal="m" marginBottom="s">
                <Text variant="sectionTitle">{title}</Text>
            </Box>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16 }}>
                {loading ? (
                    [1, 2, 3].map((i) => <OfferCardSkeleton key={i} width={200} />)
                ) : (
                    offers.map((offer) => (
                        <Box key={offer.id} marginRight="m">
                            <OfferCard offer={offer} width={200} />
                        </Box>
                    ))
                )}
            </ScrollView>
        </Box>
    );
};

export default function HomeScreen() {
    const { cityId, latitude, longitude } = useLocationStore();

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            console.log('Fetching categories...');
            const res = await api.get('/categories');
            console.log('Categories data:', res.data);
            return res.data;
        }
    });

    const { data: featuredOffers } = useQuery({
        queryKey: ['offers', 'featured', cityId],
        queryFn: async () => {
            const res = await api.get('/offers', { params: { cityId, featured: true } });
            return res.data;
        }
    });

    const { data: trendingOffers } = useQuery({
        queryKey: ['offers', 'trending', cityId],
        queryFn: async () => {
            const res = await api.get('/offers', { params: { cityId, sort: 'popularity' } });
            return res.data;
        }
    });

    const { data: nearOffers } = useQuery({
        queryKey: ['offers', 'near', cityId, latitude, longitude],
        queryFn: async () => {
            const res = await api.get('/offers', { params: { cityId, lat: latitude, long: longitude, limit: 5 } });
            return res.data;
        }
    });

    const { data: smartFeed, refetch, isRefetching, isLoading: isSmartFeedLoading } = useQuery({
        queryKey: ['offers', 'smart-feed', cityId],
        queryFn: async () => {
            const res = await api.get('/offers', { params: { cityId } });
            return res.data;
        }
    });

    const isLoading = isRefetching || isSmartFeedLoading;

    return (
        <Container>
            <FlatList
                data={[]}
                renderItem={null}
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
                ListHeaderComponent={
                    <>
                        {isLoading ? (
                            <Box padding="m">
                                <OfferCardSkeleton width="100%" />
                            </Box>
                        ) : (
                            <HomeHero offers={featuredOffers || []} />
                        )}

                        {isLoading ? (
                            <Box flexDirection="row" paddingHorizontal="m" marginBottom="l">
                                {[1, 2, 3, 4].map((i) => <CategorySkeleton key={i} />)}
                            </Box>
                        ) : (
                            <Categories categories={categories || []} />
                        )}

                        <HorizontalSection title="Near You" offers={nearOffers || []} loading={isLoading} />
                        <HorizontalSection title="Trending" offers={trendingOffers || []} loading={isLoading} />

                        <Box paddingHorizontal="m" marginTop="l" marginBottom="m">
                            <Text variant="sectionTitle">Smart Feed</Text>
                        </Box>
                        <Box marginHorizontal="m">
                            {isLoading ? (
                                <ResponsiveGrid
                                    data={[1, 2, 3, 4, 5, 6]}
                                    renderItem={() => <OfferCardSkeleton />}
                                    itemMinWidth={160}
                                    maxColumns={6}
                                />
                            ) : (
                                <ResponsiveGrid
                                    data={smartFeed || []}
                                    renderItem={(item) => <OfferCard offer={item} />}
                                    itemMinWidth={160}
                                    maxColumns={6}
                                />
                            )}
                        </Box>
                    </>
                }
            />
        </Container>
    );
}
