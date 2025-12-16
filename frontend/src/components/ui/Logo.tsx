import React from 'react';
import Box from './Box';
import Text from './Text'; // Added missing import
import { Image, ImageStyle, StyleProp } from 'react-native';

const LogoFull = require('../../../assets/images/logo-full.png');
const LogoIcon = require('../../../assets/images/logo-icon.png');

interface LogoProps {
    variant?: 'full' | 'icon';
    size?: 's' | 'm' | 'l';
    width?: number;
    height?: number;
}

const Logo = ({ variant = 'full', size = 'm', width, height }: LogoProps) => {

    // Size mappings
    const sizes = {
        s: { height: 24, width: variant === 'full' ? 100 : 24 }, // Aspect ratios approx
        m: { height: 40, width: variant === 'full' ? 160 : 40 },
        l: { height: 60, width: variant === 'full' ? 200 : 60 },
    };

    const dimensions = sizes[size];
    const finalWidth = width ?? dimensions.width;
    const finalHeight = height ?? dimensions.height;
    const source = variant === 'full' ? LogoFull : LogoIcon;

    return (
        <Box justifyContent="center" alignItems="center">
            <Image
                source={source}
                style={{
                    height: finalHeight,
                    width: finalWidth,
                    borderRadius: variant === 'icon' ? 8 : 0, // Soft clip for icon
                } as StyleProp<ImageStyle>}
                resizeMode="contain"
            />
        </Box>
    );
};

export default Logo;
