import React from 'react';
import Box from './Box';
import Text from './Text';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../../theme/theme';
import { Platform } from 'react-native';

interface LogoProps {
    variant?: 'full' | 'icon' | 'text';
    size?: 's' | 'm' | 'l';
    color?: keyof Theme['colors'];
    inverted?: boolean;
}

const Logo = ({ variant = 'full', size = 'm', color, inverted = false }: LogoProps) => {
    const theme = useTheme<Theme>();

    // Size mappings
    const iconSizes = {
        s: 24,
        m: 32,
        l: 48,
    };

    const textSizes = {
        s: 16,
        m: 20,
        l: 28,
    };

    const spacing = {
        s: 's',
        m: 's',
        l: 'm',
    } as const;

    const iconSize = iconSizes[size];
    const textSize = textSizes[size];
    const gap = spacing[size];

    const textColor = color ? color : (inverted ? 'textInverted' : 'primary');
    const iconBgColor = inverted ? 'white' : 'primary';
    const iconTextColor = inverted ? 'primary' : 'textInverted';

    return (
        <Box flexDirection="row" alignItems="center">
            {(variant === 'full' || variant === 'icon') && (
                <Box
                    width={iconSize}
                    height={iconSize}
                    borderRadius={iconSize / 2}
                    backgroundColor={inverted ? 'offWhite' : 'primary'}
                    justifyContent="center"
                    alignItems="center"
                    marginRight={variant === 'full' ? gap : undefined}
                >
                    <Text
                        color={inverted ? 'primary' : 'textInverted'}
                        fontWeight="bold"
                        fontSize={textSize}
                        style={{
                            fontFamily: Platform.OS === 'web' ? 'System' : undefined, // Fallback
                            includeFontPadding: false,
                            lineHeight: textSize + 2, // Slight adjustment for vertical alignment
                        }}
                    >
                        O
                    </Text>
                </Box>
            )}

            {(variant === 'full' || variant === 'text') && (
                <Text
                    variant="header"
                    color={textColor}
                    fontSize={textSize}
                    fontWeight="bold"
                    style={{
                        letterSpacing: -0.5,
                    }}
                >
                    Offerify
                </Text>
            )}
        </Box>
    );
};

export default Logo;
