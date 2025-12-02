import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@shopify/restyle';
import theme from '../../../src/theme/theme';
import OfferDetailsScreen from '../[id]';

// Mock useLocalSearchParams
jest.mock('expo-router', () => ({
    useLocalSearchParams: () => ({ id: '1' }),
    Stack: {
        Screen: () => null,
    },
    useRouter: () => ({
        back: jest.fn(),
    }),
}));

// Mock react-query
jest.mock('@tanstack/react-query', () => ({
    useQuery: () => ({
        data: {
            id: '1',
            title: 'Test Offer',
            description: 'Test Description',
            image: 'https://example.com/image.jpg',
            discountPercentage: 20,
            type: 'discount',
            vendor: {
                name: 'Test Vendor',
                logo: 'https://example.com/logo.jpg',
            },
        },
        isLoading: false,
        error: null,
    }),
}));

describe('OfferDetailsScreen', () => {
    it('renders offer details correctly', () => {
        const { getByText } = render(
            <ThemeProvider theme={theme}>
                <OfferDetailsScreen />
            </ThemeProvider>
        );

        expect(getByText('Test Offer')).toBeTruthy();
        expect(getByText('Test Description')).toBeTruthy();
        expect(getByText('20% OFF')).toBeTruthy();
        expect(getByText('Test Vendor')).toBeTruthy();
    });
});
