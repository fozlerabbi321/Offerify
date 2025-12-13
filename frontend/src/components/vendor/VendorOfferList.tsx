import React, { useState } from 'react';
import { FlatList, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import Box from '../ui/Box';
import Text from '../ui/Text';
import VendorOfferCard from './VendorOfferCard';
import { Theme } from '../../theme/theme';

interface VendorOffer {
    id: string;
    title: string;
    description: string;
    type: 'discount' | 'coupon' | 'voucher';
    discountPercentage?: number;
    couponCode?: string;
    voucherValue?: number;
    image?: string;
    isActive: boolean;
    views: number;
    createdAt: string;
}

interface VendorOfferListProps {
    offers: VendorOffer[];
    isLoading: boolean;
    onRefresh: () => void;
    onView: (offer: VendorOffer) => void;
    onEdit: (offer: VendorOffer) => void;
    onDelete: (offer: VendorOffer) => void;
}

type FilterTab = 'all' | 'active' | 'inactive';

const VendorOfferList: React.FC<VendorOfferListProps> = ({
    offers,
    isLoading,
    onRefresh,
    onView,
    onEdit,
    onDelete,
}) => {
    const theme = useTheme<Theme>();
    const [activeTab, setActiveTab] = useState<FilterTab>('all');

    const filteredOffers = offers.filter((offer) => {
        if (activeTab === 'all') return true;
        if (activeTab === 'active') return offer.isActive;
        if (activeTab === 'inactive') return !offer.isActive;
        return true;
    });

    const tabs: { key: FilterTab; label: string; icon: string }[] = [
        { key: 'all', label: 'All', icon: 'grid-outline' },
        { key: 'active', label: 'Active', icon: 'checkmark-circle-outline' },
        { key: 'inactive', label: 'Inactive', icon: 'pause-circle-outline' },
    ];

    const renderTab = (tab: { key: FilterTab; label: string; icon: string }) => {
        const isActive = activeTab === tab.key;
        return (
            <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={{ flex: 1 }}
                activeOpacity={0.7}
            >
                <Box
                    backgroundColor={isActive ? 'primary' : 'offWhite'}
                    paddingVertical="s"
                    borderRadius={12}
                    alignItems="center"
                    flexDirection="row"
                    justifyContent="center"
                    style={{
                        marginHorizontal: 4,
                    }}
                >
                    <Ionicons
                        name={tab.icon as any}
                        size={18}
                        color={isActive ? 'white' : theme.colors.darkGray}
                    />
                    <Text
                        fontSize={14}
                        fontWeight={isActive ? '700' : '600'}
                        color={isActive ? 'textInverted' : 'darkGray'}
                        marginLeft="xs"
                    >
                        {tab.label}
                    </Text>
                </Box>
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <Box flex={1} justifyContent="center" alignItems="center" paddingVertical="xl">
            <Box
                backgroundColor="offWhite"
                width={120}
                height={120}
                borderRadius={60}
                justifyContent="center"
                alignItems="center"
                marginBottom="l"
            >
                <Ionicons
                    name={activeTab === 'all' ? 'add-circle-outline' : 'search-outline'}
                    size={56}
                    color={theme.colors.darkGray}
                />
            </Box>
            <Text variant="subheader" fontSize={18} marginBottom="s" textAlign="center">
                {activeTab === 'all' ? 'No offers yet' : `No ${activeTab} offers`}
            </Text>
            <Text fontSize={14} color="darkGray" textAlign="center" paddingHorizontal="l">
                {activeTab === 'all'
                    ? 'Create your first offer to attract customers'
                    : `You don't have any ${activeTab} offers at the moment`}
            </Text>
        </Box>
    );

    return (
        <Box flex={1}>
            {/* Filter Tabs */}
            <Box
                flexDirection="row"
                paddingHorizontal="m"
                paddingVertical="s"
                backgroundColor="mainBackground"
                gap="xs"
            >
                {tabs.map(renderTab)}
            </Box>

            {/* Offers List */}
            <FlatList
                data={filteredOffers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <VendorOfferCard
                        offer={item}
                        onView={() => onView(item)}
                        onEdit={() => onEdit(item)}
                        onDelete={() => onDelete(item)}
                    />
                )}
                contentContainerStyle={{
                    padding: 16,
                    paddingBottom: 100,
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary}
                        colors={[theme.colors.primary]}
                    />
                }
                ListEmptyComponent={renderEmpty}
                showsVerticalScrollIndicator={false}
            />
        </Box>
    );
};

export default VendorOfferList;
