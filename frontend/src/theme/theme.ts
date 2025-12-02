import { createTheme } from '@shopify/restyle';

const palette = {
    purpleLight: '#8C6FF7',
    purplePrimary: '#5A31F4',
    purpleDark: '#3F22AB',

    greenLight: '#56DCBA',
    greenPrimary: '#0ECD9D',
    greenDark: '#0A906E',

    black: '#0B0B0B',
    white: '#FFFFFF',
    offWhite: '#F0F2F3',
    gray: '#E1E1E1',
    grayMedium: '#888888',
    darkGray: '#333333',
    transparent: 'transparent',
};

const theme = createTheme({
    colors: {
        mainBackground: palette.offWhite,
        cardPrimaryBackground: palette.purplePrimary,
        text: palette.black,
        textInverted: palette.white,
        primary: palette.purplePrimary,
        secondary: palette.greenPrimary,
        ...palette,
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 40,
    },
    breakpoints: {
        phone: 0,
        tablet: 768,
    },
    textVariants: {
        header: {
            fontWeight: 'bold',
            fontSize: 34,
            color: 'text',
        },
        subheader: {
            fontWeight: '600',
            fontSize: 24,
            color: 'text',
        },
        body: {
            fontSize: 16,
            lineHeight: 24,
            color: 'text',
        },
        defaults: {
            fontSize: 16,
            lineHeight: 24,
            color: 'text',
        },
    },
});

export type Theme = typeof theme;
export default theme;
