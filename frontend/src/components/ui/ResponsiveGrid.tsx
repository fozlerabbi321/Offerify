import React from 'react';
import { View, useWindowDimensions, StyleSheet } from 'react-native';

interface ResponsiveGridProps {
    data: any[];
    renderItem: (item: any) => React.ReactNode;
    itemMinWidth?: number;
    gap?: number;
    maxColumns?: number;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({ data, renderItem, itemMinWidth = 300, gap = 16, maxColumns = 4 }) => {
    const { width } = useWindowDimensions();

    // Calculate number of columns based on container width (approximated by window width for now)
    // Subtracting some padding (e.g. 32px for container padding)
    const availableWidth = width - 32;
    const calculatedColumns = Math.max(1, Math.floor(availableWidth / itemMinWidth));
    const numColumns = Math.min(calculatedColumns, maxColumns);
    const itemWidth = (availableWidth - (gap * (numColumns - 1))) / numColumns;

    return (
        <View style={[styles.container, { gap }]}>
            {data.map((item, index) => (
                <View key={index} style={{ width: numColumns > 1 ? itemWidth : '100%' }}>
                    {renderItem(item)}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
});

export default ResponsiveGrid;
