import React from 'react';
import { ScrollView, Dimensions, TouchableOpacity, Platform } from 'react-native';
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
    const isWeb = Platform.OS === 'web';

    if (!offers || offers.length === 0) return null;

    return (
        <Box marginVertical="m" alignItems="center">
            <Box width="100%" maxWidth={1200}>
                <ScrollView
                    horizontal
                    pagingEnabled={!isWeb}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: 16,
                        gap: 16
                    }}
                    snapToInterval={isWeb ? undefined : CAROUSEL_WIDTH + 16}
                    decelerationRate="fast"
                >
                    {offers.map((offer) => (
                        <TouchableOpacity
                            key={offer.id}
                            activeOpacity={0.95}
                            onPress={() => router.push(`/offer/${offer.id}`)}
                        >
                            <Box
                                width={isWeb ? 400 : CAROUSEL_WIDTH}
                                height={220}
                                borderRadius="l"
                                overflow="hidden"
                                backgroundColor="gray"
                                position="relative"
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 10 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 20,
                                    elevation: 8,
                                }}
                            >
                                <Image
                                    source={{ uri: offer.image }}
                                    style={{ width: '100%', height: '100%' }}
                                    contentFit="cover"
                                />
                                <Box
                                    position="absolute"
                                    bottom={0}
                                    left={0}
                                    right={0}
                                    height="70%"
                                    padding="m"
                                    justifyContent="flex-end"
                                    style={{
                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                    }}
                                >
                                    <Box
                                        alignSelf="flex-start"
                                        backgroundColor="secondary"
                                        paddingHorizontal="s"
                                        paddingVertical="xxs"
                                        borderRadius="s"
                                        marginBottom="s"
                                    >
                                        <Text variant="tiny" color="white" fontWeight="bold" style={{ textTransform: 'uppercase' }}>
                                            Featured Deal
                                        </Text>
                                    </Box>
                                    <Text variant="subheader" color="white" fontSize={20} fontWeight="800" numberOfLines={1}>
                                        {offer.title}
                                    </Text>
                                    <Text variant="caption" color="white" opacity={0.9} numberOfLines={2}>
                                        {offer.description}
                                    </Text>
                                </Box>
                            </Box>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </Box>
        </Box>
    );
};

export default HomeHero;
