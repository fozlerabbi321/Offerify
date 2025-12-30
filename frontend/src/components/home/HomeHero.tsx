import React from 'react';
import { ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import Box from '../ui/Box';
import Text from '../ui/Text';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_WIDTH = SCREEN_WIDTH - 32;

interface HomeHeroProps {
    offers: any[];
}

const HomeHero = ({ offers }: HomeHeroProps) => {
    const router = useRouter();

    if (!offers || offers.length === 0) return null;

    return (
        <Box marginVertical="m">
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                snapToInterval={CAROUSEL_WIDTH + 16}
                decelerationRate="fast"
            >
                {offers.map((offer) => (
                    <TouchableOpacity
                        key={offer.id}
                        activeOpacity={0.95}
                        onPress={() => router.push(`/offer/${offer.id}`)}
                    >
                        <Box
                            width={CAROUSEL_WIDTH as any}
                            height={200}
                            marginRight="m"
                            borderRadius="l"
                            overflow="hidden"
                            backgroundColor="gray"
                            position="relative"
                        >
                            <Image
                                source={{ uri: offer.image }}
                                style={{ width: '100%', height: '100%' }}
                                contentFit="cover"
                            />
                            {/* Gradient Overlay Placeholder */}
                            <Box
                                position="absolute"
                                bottom={0}
                                left={0}
                                right={0}
                                height="60%"
                                padding="m"
                                justifyContent="flex-end"
                                style={{
                                    backgroundColor: 'rgba(0,0,0,0.4)',
                                }}
                            >
                                <Box
                                    alignSelf="flex-start"
                                    backgroundColor="secondary"
                                    paddingHorizontal="s"
                                    paddingVertical="xs"
                                    borderRadius="s"
                                    marginBottom="xs"
                                >
                                    <Text variant="tiny" color="white" fontWeight="bold">
                                        FEATURED
                                    </Text>
                                </Box>
                                <Text variant="subheader" color="white" numberOfLines={1}>
                                    {offer.title}
                                </Text>
                                <Text variant="caption" color="white" opacity={0.8} numberOfLines={1}>
                                    {offer.description}
                                </Text>
                            </Box>
                        </Box>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </Box>
    );
};

export default HomeHero;
