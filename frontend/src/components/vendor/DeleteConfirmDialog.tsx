import React from 'react';
import { Modal, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import Box from '../ui/Box';
import Text from '../ui/Text';
import { Theme } from '../../theme/theme';

interface DeleteConfirmDialogProps {
    visible: boolean;
    offerTitle: string;
    isDeleting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
    visible,
    offerTitle,
    isDeleting,
    onConfirm,
    onCancel,
}) => {
    const theme = useTheme<Theme>();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <Box
                flex={1}
                justifyContent="center"
                alignItems="center"
                style={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                }}
                padding="l"
            >
                <Box
                    backgroundColor="white"
                    borderRadius={20}
                    padding="l"
                    width="100%"
                    maxWidth={400}
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.3,
                        shadowRadius: 20,
                        elevation: 10,
                    }}
                >
                    {/* Icon */}
                    <Box alignItems="center" marginBottom="m">
                        <Box
                            width={80}
                            height={80}
                            borderRadius={40}
                            backgroundColor="offWhite"
                            justifyContent="center"
                            alignItems="center"
                            style={{
                                borderWidth: 3,
                                borderColor: theme.colors.error,
                            }}
                        >
                            <Ionicons name="trash-outline" size={40} color={theme.colors.error} />
                        </Box>
                    </Box>

                    {/* Title */}
                    <Text
                        variant="subheader"
                        fontSize={20}
                        textAlign="center"
                        marginBottom="s"
                    >
                        Delete Offer?
                    </Text>

                    {/* Warning Message */}
                    <Box
                        backgroundColor="offWhite"
                        padding="m"
                        borderRadius={12}
                        marginBottom="m"
                        style={{
                            borderLeftWidth: 4,
                            borderLeftColor: theme.colors.error,
                        }}
                    >
                        <Text fontSize={14} color="text" textAlign="center">
                            You are about to delete{' '}
                            <Text fontWeight="700">"{offerTitle}"</Text>
                        </Text>
                        <Text fontSize={13} color="darkGray" textAlign="center" marginTop="s">
                            This action cannot be undone
                        </Text>
                    </Box>

                    {/* Action Buttons */}
                    <Box flexDirection="row" gap="m">
                        <TouchableOpacity
                            onPress={onCancel}
                            style={{ flex: 1 }}
                            disabled={isDeleting}
                            activeOpacity={0.7}
                        >
                            <Box
                                backgroundColor="offWhite"
                                paddingVertical="m"
                                borderRadius={12}
                                alignItems="center"
                                style={{
                                    borderWidth: 1,
                                    borderColor: theme.colors.gray,
                                    opacity: isDeleting ? 0.5 : 1,
                                }}
                            >
                                <Text fontSize={16} fontWeight="600" color="text">
                                    Cancel
                                </Text>
                            </Box>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onConfirm}
                            style={{ flex: 1 }}
                            disabled={isDeleting}
                            activeOpacity={0.7}
                        >
                            <Box
                                backgroundColor="error"
                                paddingVertical="m"
                                borderRadius={12}
                                alignItems="center"
                                flexDirection="row"
                                justifyContent="center"
                                opacity={isDeleting ? 0.7 : 1}
                            >
                                {isDeleting && (
                                    <Box marginRight="xs">
                                        <Text color="textInverted">⏳</Text>
                                    </Box>
                                )}
                                <Text fontSize={16} fontWeight="700" color="textInverted">
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </Text>
                            </Box>
                        </TouchableOpacity>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
};

export default DeleteConfirmDialog;
