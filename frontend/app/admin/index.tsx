import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdminStats } from '../../src/api/admin';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, bgColor }) => (
    <View style={[styles.statCard, { backgroundColor: bgColor }]}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
            <Ionicons name={icon} size={24} color="#FFF" />
        </View>
        <View style={styles.statContent}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
        </View>
    </View>
);

interface QuickActionProps {
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ title, description, icon, onPress }) => (
    <Pressable style={styles.actionCard} onPress={onPress}>
        <View style={styles.actionIcon}>
            <Ionicons name={icon} size={28} color="#5A31F4" />
        </View>
        <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>{title}</Text>
            <Text style={styles.actionDescription}>{description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#CCC" />
    </Pressable>
);

export default function AdminDashboard() {
    const router = useRouter();
    const { data: stats, isLoading } = useAdminStats();

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5A31F4" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Dashboard</Text>
                    <Text style={styles.subtitle}>Welcome to the Admin Panel</Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <StatCard
                        title="Total Users"
                        value={stats?.totalUsers || 0}
                        icon="people"
                        color="#5A31F4"
                        bgColor="#F0EAFF"
                    />
                    <StatCard
                        title="Total Reviews"
                        value={stats?.totalReviews || 0}
                        icon="star"
                        color="#F59E0B"
                        bgColor="#FEF3C7"
                    />
                    <StatCard
                        title="Active Vendors"
                        value={stats?.totalVendors || '-'}
                        icon="storefront"
                        color="#10B981"
                        bgColor="#D1FAE5"
                    />
                    <StatCard
                        title="Active Offers"
                        value={stats?.totalOffers || '-'}
                        icon="pricetag"
                        color="#EF4444"
                        bgColor="#FEE2E2"
                    />
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsContainer}>
                    <QuickAction
                        title="Manage Users"
                        description="View, search, and ban/unban users"
                        icon="people-outline"
                        onPress={() => router.push('/admin/users' as any)}
                    />
                    <QuickAction
                        title="Moderate Reviews"
                        description="Review and delete inappropriate content"
                        icon="star-outline"
                        onPress={() => router.push('/admin/reviews' as any)}
                    />
                    <QuickAction
                        title="Edit Pages"
                        description="Update About, Privacy, Terms pages"
                        icon="document-text-outline"
                        onPress={() => router.push('/admin/pages' as any)}
                    />
                    <QuickAction
                        title="App Settings"
                        description="Configure global app settings"
                        icon="settings-outline"
                        onPress={() => router.push('/admin/settings' as any)}
                    />
                </View>
            </View>
        </ScrollView>
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
    content: {
        padding: 24,
        maxWidth: 1200,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1A1A2E',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
        marginBottom: 32,
    },
    statCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        margin: 8,
        minWidth: 200,
        flex: 1,
        flexBasis: '45%',
    },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statContent: {
        marginLeft: 16,
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1A1A2E',
    },
    statTitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1A1A2E',
        marginBottom: 16,
    },
    actionsContainer: {
        gap: 12,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: '#F0EAFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionContent: {
        flex: 1,
        marginLeft: 16,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A2E',
        marginBottom: 4,
    },
    actionDescription: {
        fontSize: 14,
        color: '#888',
    },
});
