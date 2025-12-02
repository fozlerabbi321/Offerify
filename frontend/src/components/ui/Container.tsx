import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Box from './Box';

const Container: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <Box flex={1} backgroundColor="mainBackground">
            <SafeAreaView style={{ flex: 1 }}>
                {children}
            </SafeAreaView>
        </Box>
    );
};

export default Container;
