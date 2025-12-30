import React from 'react';
import { Modal, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Box from '../ui/Box';
import Text from '../ui/Text';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../../theme/theme';

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    categories: any[];
    selectedCategory: string | null;
    onSelectCategory: (id: string | null) => void;
    onApply: () => void;
    onReset: () => void;
}

const SearchFilterModal = ({
    visible,
    onClose,
    categories,
    selectedCategory,
    onSelectCategory,
    onApply,
    onReset
}: FilterModalProps) => {
    const theme = useTheme<Theme>();

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <Box flex={1} backgroundColor="modalBackground" justifyContent="flex-end">
                <Box
                    backgroundColor="cardBackground"
                    borderTopLeftRadius="xl"
                    borderTopRightRadius="xl"
                    maxHeight="80%"
                    padding="m"
                >
                    {/* Header */}
                    <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
                        <Text variant="subheader">Filters</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </Box>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Categories */}
                        <Box marginBottom="l">
                            <Text fontWeight="bold" marginBottom="s">Category</Text>
                            <Box flexDirection="row" flexWrap="wrap" gap="s">
                                <TouchableOpacity onPress={() => onSelectCategory(null)}>
                                    <Box
                                        paddingHorizontal="m"
                                        paddingVertical="s"
                                        borderRadius="l"
                                        backgroundColor={selectedCategory === null ? 'primary' : 'offWhite'}
                                    >
                                        <Text color={selectedCategory === null ? 'white' : 'text'}>All Categories</Text>
                                    </Box>
                                </TouchableOpacity>
                                {categories.map((cat) => (
                                    <TouchableOpacity key={cat.id} onPress={() => onSelectCategory(cat.id)}>
                                        <Box
                                            paddingHorizontal="m"
                                            paddingVertical="s"
                                            borderRadius="l"
                                            backgroundColor={selectedCategory === cat.id ? 'primary' : 'offWhite'}
                                        >
                                            <Text color={selectedCategory === cat.id ? 'white' : 'text'}>{cat.name}</Text>
                                        </Box>
                                    </TouchableOpacity>
                                ))}
                            </Box>
                        </Box>

                        {/* More filters can be added here (Vendor, Location, etc.) */}
                        <Box paddingBottom="xxl">
                            <Text color="grayMedium" textAlign="center">More filters coming soon...</Text>
                        </Box>
                    </ScrollView>

                    {/* Actions */}
                    <Box flexDirection="row" gap="m" marginTop="m" paddingBottom={Platform.OS === 'ios' ? 'm' : 's'}>
                        <TouchableOpacity style={{ flex: 1 }} onPress={onReset}>
                            <Box paddingVertical="m" borderRadius="l" borderWidth={1} borderColor="gray" alignItems="center">
                                <Text fontWeight="600">Reset</Text>
                            </Box>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1 }} onPress={onApply}>
                            <Box paddingVertical="m" borderRadius="l" backgroundColor="primary" alignItems="center">
                                <Text fontWeight="600" color="white">Apply Filters</Text>
                            </Box>
                        </TouchableOpacity>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
};

export default SearchFilterModal;
