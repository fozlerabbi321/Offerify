import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, ScrollView, Platform } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { useAuthStore } from '../../src/store/auth.store';
import { Ionicons } from '@expo/vector-icons';

const SIDEBAR_WIDTH = 260;
const MOBILE_BREAKPOINT = 768;

interface MenuItem {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    path: string;
}

const menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'home-outline', path: '/admin' },
    { label: 'Vendors', icon: 'storefront-outline', path: '/admin/vendors' },
    { label: 'Users', icon: 'people-outline', path: '/admin/users' },
    { label: 'Reviews', icon: 'star-outline', path: '/admin/reviews' },
    { label: 'Pages', icon: 'document-text-outline', path: '/admin/pages' },
    { label: 'Settings', icon: 'settings-outline', path: '/admin/settings' },
];

export default function AdminLayout() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, checkLogin } = useAuthStore();
    const [isMobile, setIsMobile] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            await checkLogin();
            setIsLoading(false);
        };
        init();
    }, []);

    useEffect(() => {
        const updateLayout = () => {
            const width = Dimensions.get('window').width;
            setIsMobile(width < MOBILE_BREAKPOINT);
        };

        updateLayout();
        const subscription = Dimensions.addEventListener('change', updateLayout);
        return () => subscription?.remove();
    }, []);

    // Redirect non-admin users after loading
    useEffect(() => {
        if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
            router.replace('/(auth)/login');
        }
    }, [isLoading, isAuthenticated, user]);

    const isActive = (path: string) => {
        if (path === '/admin') {
            return pathname === '/admin' || pathname === '/admin/index';
        }
        return pathname.startsWith(path);
    };

    const handleNavigation = (path: string) => {
        router.push(path as any);
        if (isMobile) {
            setSidebarOpen(false);
        }
    };

    const handleLogout = () => {
        useAuthStore.getState().logout();
        router.replace('/');
    };

    // Loading state
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    // Block unauthenticated/non-admin access
    if (!isAuthenticated || user?.role !== 'admin') {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Access Denied</Text>
                <Text style={styles.errorSubtext}>You don't have permission to access this area.</Text>
            </View>
        );
    }

    const renderSidebar = () => (
        <View style={[styles.sidebar, isMobile && styles.sidebarMobile]}>
            {/* Logo / Title */}
            <View style={styles.logoContainer}>
                <Ionicons name="shield-checkmark" size={32} color="#5A31F4" />
                <Text style={styles.logoText}>Admin Panel</Text>
            </View>

            {/* Menu Items */}
            <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
                {menuItems.map((item) => (
                    <Pressable
                        key={item.path}
                        style={[
                            styles.menuItem,
                            isActive(item.path) && styles.menuItemActive,
                        ]}
                        onPress={() => handleNavigation(item.path)}
                    >
                        <Ionicons
                            name={item.icon}
                            size={22}
                            color={isActive(item.path) ? '#5A31F4' : '#666'}
                        />
                        <Text
                            style={[
                                styles.menuItemText,
                                isActive(item.path) && styles.menuItemTextActive,
                            ]}
                        >
                            {item.label}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* Bottom Section */}
            <View style={styles.bottomSection}>
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.email?.[0]?.toUpperCase() || 'A'}
                        </Text>
                    </View>
                    <View style={styles.userDetails}>
                        <Text style={styles.userName} numberOfLines={1}>
                            {user?.name || 'Admin'}
                        </Text>
                        <Text style={styles.userEmail} numberOfLines={1}>
                            {user?.email}
                        </Text>
                    </View>
                </View>

                <Pressable style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#E53935" />
                    <Text style={styles.logoutText}>Logout</Text>
                </Pressable>

                <Pressable
                    style={styles.backToSiteButton}
                    onPress={() => router.replace('/')}
                >
                    <Ionicons name="arrow-back-outline" size={20} color="#666" />
                    <Text style={styles.backToSiteText}>Back to Site</Text>
                </Pressable>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Mobile Header */}
            {isMobile && (
                <View style={styles.mobileHeader}>
                    <Pressable
                        style={styles.menuButton}
                        onPress={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <Ionicons name="menu" size={28} color="#333" />
                    </Pressable>
                    <Text style={styles.mobileTitle}>Admin Panel</Text>
                    <View style={{ width: 44 }} />
                </View>
            )}

            {/* Mobile Overlay */}
            {isMobile && sidebarOpen && (
                <Pressable
                    style={styles.overlay}
                    onPress={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            {(!isMobile || sidebarOpen) && renderSidebar()}

            {/* Main Content */}
            <View style={[styles.mainContent, !isMobile && { marginLeft: SIDEBAR_WIDTH }]}>
                <Slot />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
    },
    loadingText: {
        fontSize: 18,
        color: '#666',
    },
    errorText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#E53935',
        marginBottom: 8,
    },
    errorSubtext: {
        fontSize: 16,
        color: '#666',
    },
    sidebar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: SIDEBAR_WIDTH,
        backgroundColor: '#FFFFFF',
        borderRightWidth: 1,
        borderRightColor: '#E0E0E0',
        paddingTop: Platform.OS === 'web' ? 0 : 44,
        zIndex: 100,
        ...(Platform.OS === 'web' && {
            boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
        }),
    },
    sidebarMobile: {
        paddingTop: 60,
        ...(Platform.OS === 'web' && {
            boxShadow: '4px 0 16px rgba(0,0,0,0.15)',
        }),
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    logoText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 12,
    },
    menuContainer: {
        flex: 1,
        paddingTop: 16,
        paddingHorizontal: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 10,
        marginBottom: 4,
    },
    menuItemActive: {
        backgroundColor: '#F0EAFF',
    },
    menuItemText: {
        fontSize: 15,
        color: '#666',
        marginLeft: 14,
        fontWeight: '500',
    },
    menuItemTextActive: {
        color: '#5A31F4',
        fontWeight: '600',
    },
    bottomSection: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#5A31F4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    userDetails: {
        marginLeft: 12,
        flex: 1,
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    userEmail: {
        fontSize: 12,
        color: '#888',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#FFEBEE',
        borderRadius: 8,
        marginBottom: 8,
    },
    logoutText: {
        color: '#E53935',
        marginLeft: 10,
        fontWeight: '500',
    },
    backToSiteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
    },
    backToSiteText: {
        color: '#666',
        marginLeft: 10,
        fontWeight: '500',
    },
    mobileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'web' ? 16 : 48,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        zIndex: 50,
    },
    menuButton: {
        padding: 8,
    },
    mobileTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 99,
    },
    mainContent: {
        flex: 1,
    },
});
