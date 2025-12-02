import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@shopify/restyle';
import theme from '../../../theme/theme';
import OfferCard from '../OfferCard';

const mockOffer = {
    id: '1',
    title: 'Test Offer',
    description: 'Test Description',
    image: 'https://example.com/image.jpg',
    discountPercentage: 20,
    type: 'discount' as const,
};

describe('OfferCard', () => {
    it('renders correctly with offer details', () => {
        const { getByText } = render(
            <ThemeProvider theme={theme}>
                <OfferCard offer={mockOffer} />
            </ThemeProvider>
        );

        expect(getByText('Test Offer')).toBeTruthy();
        expect(getByText('Test Description')).toBeTruthy();
        expect(getByText('20% OFF')).toBeTruthy();
    });

    it('renders without discount badge if no discountPercentage', () => {
        const offerWithoutDiscount = { ...mockOffer, discountPercentage: undefined };
        const { queryByText } = render(
            <ThemeProvider theme={theme}>
                <OfferCard offer={offerWithoutDiscount} />
            </ThemeProvider>
        );

        expect(queryByText('% OFF')).toBeNull();
    });
});
