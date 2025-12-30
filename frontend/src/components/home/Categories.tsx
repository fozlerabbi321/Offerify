import React from 'react';
import { ScrollView, TouchableOpacity, Image } from 'react-native';
import Box from '../ui/Box';
import Text from '../ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../../theme/theme';

interface Category {
    id: string;
    name: string;
    icon: string;
}

const CATEGORY_COLORS = ['accent1', 'accent2', 'accent3', 'accent4', 'accent5'] as const;

const Categories = ({ categories }: { categories: Category[] }) => {
    const theme = useTheme<Theme>();

    return (
        <Box marginBottom="l">
            <Box paddingHorizontal="m" marginBottom="s">
                <Text variant="sectionTitle">Explore Categories</Text>
            </Box>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                decelerationRate="fast"
            >
                {categories.map((cat, index) => {
                    const isImageUrl = cat.icon?.startsWith('http');
                    const bgColor = theme.colors[CATEGORY_COLORS[index % CATEGORY_COLORS.length]];

                    return (
                        <TouchableOpacity key={cat.id || index} style={{ marginRight: 20, alignItems: 'center' }}>
                            <Box
                                width={75}
                                height={75}
                                backgroundColor="cardBackground"
                                borderRadius="l"
                                justifyContent="center"
                                alignItems="center"
                                style={{
                                    backgroundColor: bgColor,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 10,
                                    elevation: 2,
                                }}
                                marginBottom="xs"
                                overflow="hidden"
                            >
                                {isImageUrl ? (
                                    <Image
                                        source={{ uri: cat.icon }}
                                        style={{ width: '100%', height: '100%' }}
                                    />
                                ) : (
                                    <Ionicons name={cat.icon as any || 'grid'} size={32} color={theme.colors.primary} />
                                )}
                            </Box>
                            <Text variant="tiny" fontWeight="700" color="darkGray">{cat.name}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </Box>
    );
};

export default Categories;
