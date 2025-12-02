import React from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../../theme/theme';
import Box from './Box';
import Text from './Text';

interface InputProps extends TextInputProps {
    label: string;
    error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, ...props }) => {
    const theme = useTheme<Theme>();
    const [isFocused, setIsFocused] = React.useState(false);

    return (
        <Box marginBottom="m">
            <Text variant="body" marginBottom="s" color="text">
                {label}
            </Text>
            <Box
                height={50}
                borderRadius={8}
                borderWidth={1}
                borderColor={error ? 'primary' : isFocused ? 'primary' : 'gray'}
                justifyContent="center"
                paddingHorizontal="m"
                backgroundColor="mainBackground"
            >
                <TextInput
                    style={[styles.input, { outlineStyle: 'none' } as any]}
                    placeholderTextColor={theme.colors.grayMedium}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
            </Box>
            {error && (
                <Text variant="body" color="primary" marginTop="s" fontSize={12}>
                    {error}
                </Text>
            )}
        </Box>
    );
};

const styles = StyleSheet.create({
    input: {
        flex: 1,
        fontSize: 16,
        color: '#0B0B0B', // theme.colors.text
    },
});

export default Input;
