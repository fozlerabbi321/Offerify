
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

const HeroSection = ({ offers }: { offers: any[] }) => {
    if (!offers || offers.length === 0) return null;
    return (
        <Box height={200} backgroundColor="cardPrimaryBackground" margin="m" borderRadius={16} justifyContent="center" alignItems="center" overflow="hidden">
            {/* Placeholder for Carousel */}
            <Text variant="header" color="textInverted">{offers[0]?.title}</Text>
        </Box>
    )
}

const HorizontalSection = ({ title, offers }: { title: string, offers: any[] }) => {
    if (!offers || offers.length === 0) return null;
    return (
        <Box marginBottom="l">
            <Text variant="subheader" marginLeft="m" marginBottom="s">{title}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16 }}>
                {offers.map((offer) => (
                    <Box key={offer.id} marginRight="m">
                        <OfferCard offer={offer} width={200} />
                    </Box>
                ))}
            </ScrollView>
        </Box>
    )
}

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

    const { data: smartFeed, refetch, isRefetching } = useQuery({
        queryKey: ['offers', 'smart-feed', cityId],
        queryFn: async () => {
            console.log('Fetching smart feed...');
            const res = await api.get('/offers', { params: { cityId } });
            console.log('Smart feed data:', res.data);
            return res.data;
        }
    });

    const renderItem = ({ item }: { item: any }) => (
        <Box marginHorizontal="m" marginBottom="m">
            <OfferCard offer={item} />
        </Box>
    );

    return (
        <Container>
            <FlatList
                data={[]}
                renderItem={null}
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
                ListHeaderComponent={
                    <>
                        <HeroSection offers={featuredOffers} />
                        <Categories categories={categories || []} />
                        <HorizontalSection title="Near You" offers={nearOffers} />
                        <HorizontalSection title="Trending" offers={trendingOffers} />
                        <Text variant="subheader" marginLeft="m" marginTop="l" marginBottom="m">Smart Feed</Text>
                        <Box marginHorizontal="m">
                            <ResponsiveGrid
                                data={smartFeed || []}
                                renderItem={(item) => <OfferCard offer={item} />}
                                itemMinWidth={160}
                                maxColumns={6}
                            />
                        </Box>
                    </>
                }
            />
        </Container>
    );
}

