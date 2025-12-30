import { createTheme } from '@shopify/restyle';

const palette = {
    purpleLight: '#8C6FF7',
    purplePrimary: '#5A31F4',
    purpleDark: '#3F22AB',

    greenLight: '#56DCBA',
    greenPrimary: '#0ECD9D',
    greenDark: '#0A906E',

    error: '#FF0000',

    black: '#0B0B0B',
    white: '#FFFFFF',
    offWhite: '#F0F2F3',
    gray: '#E1E1E1',
    gray200: '#EEEEEE',
    gray400: '#BDBDBD',
    gray500: '#9E9E9E',
    grayMedium: '#888888',
    darkGray: '#333333',
    transparent: 'transparent',
    modalBackground: 'rgba(0,0,0,0.5)',

    secondaryLight: '#E0F2F1',
    errorLight: '#FFEBEE',

    // New Accent Colors for Categories & UI
    accent1: '#FFEDEC', // Soft Red/Pink
    accent2: '#EBF6FF', // Soft Blue
    accent3: '#FFF8E1', // Soft Amber
    accent4: '#F3E5F5', // Soft Purple
    accent5: '#E8F5E9', // Soft Green
};

const generateNumericKeys = (limit: number) => {
    const keys: Record<string, number> = {};
    for (let i = 0; i <= limit; i += 2) {
        keys[i.toString()] = i;
    }
    // Add some common odd numbers if needed
    [1, 3, 5, 15, 25, 35].forEach(num => {
        keys[num.toString()] = num;
    });
    return keys;
};

const theme = createTheme({
    colors: {
        mainBackground: palette.offWhite,
        cardPrimaryBackground: palette.purplePrimary,
        cardBackground: palette.white,
        text: palette.black,
        textInverted: palette.white,
        textMuted: palette.grayMedium,
        primary: palette.purplePrimary,
        secondary: palette.greenPrimary,
        success: palette.greenPrimary,
        neutral: palette.gray200,

        // Accent Colors mapped to semantic keys if needed or just use palette
        ...palette,
    },
    spacing: {
        none: 0,
        xxs: 2,
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 40,
        xxl: 64,
        ...generateNumericKeys(80),
    },
    borderRadii: {
        none: 0,
        xs: 4,
        s: 8,
        m: 12,
        l: 16,
        xl: 24,
        full: 9999,
        ...generateNumericKeys(60),
    },
    breakpoints: {
        phone: 0,
        tablet: 768,
    },
    textVariants: {
        header: {
            fontWeight: 'bold',
            fontSize: 32,
            lineHeight: 40,
            color: 'text',
        },
        subheader: {
            fontWeight: '600',
            fontSize: 22,
            lineHeight: 28,
            color: 'text',
        },
        sectionTitle: {
            fontWeight: '700',
            fontSize: 18,
            lineHeight: 24,
            color: 'text',
        },
        body: {
            fontSize: 16,
            lineHeight: 24,
            color: 'text',
        },
        caption: {
            fontSize: 12,
            lineHeight: 16,
            color: 'grayMedium',
        },
        tiny: {
            fontSize: 10,
            lineHeight: 12,
            fontWeight: '600',
            color: 'grayMedium',
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
