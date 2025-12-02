import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
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

const Categories = ({ categories }: { categories: Category[] }) => {
    const theme = useTheme<Theme>();

    return (
        <Box marginBottom="l">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                {categories.map((cat, index) => (
                    <TouchableOpacity key={cat.id || index} style={{ marginRight: 16, alignItems: 'center' }}>
                        <Box
                            width={70}
                            height={70}
                            backgroundColor="white"
                            borderRadius={20}
                            justifyContent="center"
                            alignItems="center"
                            shadowColor="black"
                            shadowOffset={{ width: 0, height: 2 }}
                            shadowOpacity={0.05}
                            shadowRadius={4}
                            elevation={2}
                            marginBottom="s"
                        >
                            <Ionicons name={cat.icon as any || 'grid'} size={28} color={theme.colors.primary} />
                        </Box>
                        <Text variant="body" fontSize={12} color="darkGray">{cat.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </Box>
    );
};

export default Categories;
