import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import LoginRequiredView from './LoginRequiredView';

interface LoginRequiredModalProps {
    visible: boolean;
    onClose: () => void;
    onLogin?: () => void;
}

export default function LoginRequiredModal({ visible, onClose, onLogin }: LoginRequiredModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableWithoutFeedback>
                    <View style={styles.modalContent}>
                        <LoginRequiredView
                            onLoginPress={onLogin}
                            onBackPress={onClose}
                            showBackButton={true} // Reusing the back button style for "Close" essentially
                        />
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxHeight: 500,
        borderRadius: 20,
        overflow: 'hidden',
    },
});
