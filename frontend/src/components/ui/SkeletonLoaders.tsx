import React, { useEffect } from 'react';
import { StyleSheet, Animated, ViewStyle } from 'react-native';
import Box from './Box';

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: ViewStyle;
}

const Skeleton = ({ width, height, borderRadius = 8, style }: SkeletonProps) => {
    const opacity = React.useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [opacity]);

    return (
        <Animated.View
            style={[
                {
                    width: width as any,
                    height: height as any,
                    backgroundColor: '#E1E1E1',
                    borderRadius,
                    opacity,
                },
                style,
            ]}
        />
    );
};

export const CategorySkeleton = () => (
    <Box marginRight="m" alignItems="center">
        <Skeleton width={70} height={70} borderRadius={20} />
        <Box height={4} />
        <Skeleton width={50} height={12} />
    </Box>
);

export const OfferCardSkeleton = ({ width = 200 }: { width?: number | string }) => (
    <Box
        width={width as any}
        height={220}
        backgroundColor="cardBackground"
        borderRadius="l"
        overflow="hidden"
        style={{ marginBottom: 16 }}
    >
        <Skeleton width="100%" height={130} />
        <Box padding="s">
            <Box marginBottom="s">
                <Skeleton width="80%" height={16} />
            </Box>
            <Box marginBottom="s">
                <Skeleton width="60%" height={12} />
            </Box>
            <Box flexDirection="row" alignItems="center" marginTop="s">
                <Skeleton width={12} height={12} borderRadius={6} />
                <Box width={4} />
                <Skeleton width={60} height={10} />
            </Box>
        </Box>
    </Box>
);

export default Skeleton;
