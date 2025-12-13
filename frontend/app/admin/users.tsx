import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator, Image, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAdminUsers, useToggleBan, User } from '../../src/api/admin';

export default function UsersScreen() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const { data, isLoading, refetch } = useAdminUsers({ page, limit: 10, search: search || undefined });
    const toggleBan = useToggleBan();

    const handleToggleBan = async (userId: string) => {
        await toggleBan.mutateAsync(userId);
    };

    const handleSearch = () => {
        setPage(1);
        refetch();
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return '#5A31F4';
            case 'vendor': return '#10B981';
            default: return '#6B7280';
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>User Management</Text>
                    <Text style={styles.subtitle}>View and manage all platform users</Text>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputWrapper}>
                        <Ionicons name="search" size={20} color="#888" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by name or email..."
                            placeholderTextColor="#888"
                            value={search}
                            onChangeText={setSearch}
                            onSubmitEditing={handleSearch}
                        />
                    </View>
                    <Pressable style={styles.searchButton} onPress={handleSearch}>
                        <Text style={styles.searchButtonText}>Search</Text>
                    </Pressable>
                </View>

                {/* Loading */}
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#5A31F4" />
                    </View>
                ) : (
                    <>
                        {/* Results Info */}
                        <View style={styles.resultsInfo}>
                            <Text style={styles.resultsText}>
                                Showing {data?.items.length || 0} of {data?.meta.total || 0} users
                            </Text>
                        </View>

                        {/* User List */}
                        <View style={styles.tableContainer}>
                            {/* Table Header */}
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderText, { flex: 2 }]}>User</Text>
                                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Role</Text>
                                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Status</Text>
                                <Text style={[styles.tableHeaderText, { width: 80 }]}>Action</Text>
                            </View>

                            {/* Table Rows */}
                            {data?.items.map((user: User) => (
                                <View key={user.id} style={styles.tableRow}>
                                    <View style={[styles.userInfo, { flex: 2 }]}>
                                        <View style={styles.avatar}>
                                            {user.avatarUrl ? (
                                                <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
                                            ) : (
                                                <Text style={styles.avatarText}>
                                                    {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                                </Text>
                                            )}
                                        </View>
                                        <View style={styles.userDetails}>
                                            <Text style={styles.userName} numberOfLines={1}>
                                                {user.name || 'No name'}
                                            </Text>
                                            <Text style={styles.userEmail} numberOfLines={1}>
                                                {user.email}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(user.role) + '20' }]}>
                                            <Text style={[styles.roleText, { color: getRoleBadgeColor(user.role) }]}>
                                                {user.role}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <View style={[styles.statusBadge, user.isBanned ? styles.bannedBadge : styles.activeBadge]}>
                                            <Text style={[styles.statusText, user.isBanned ? styles.bannedText : styles.activeText]}>
                                                {user.isBanned ? 'Banned' : 'Active'}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{ width: 80, alignItems: 'center' }}>
                                        <Switch
                                            value={!user.isBanned}
                                            onValueChange={() => handleToggleBan(user.id)}
                                            disabled={user.role === 'admin'}
                                            trackColor={{ false: '#E53935', true: '#10B981' }}
                                            thumbColor="#FFF"
                                        />
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Pagination */}
                        {data?.meta && data.meta.totalPages > 1 && (
                            <View style={styles.pagination}>
                                <Pressable
                                    style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
                                    onPress={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                >
                                    <Ionicons name="chevron-back" size={20} color={page === 1 ? '#CCC' : '#5A31F4'} />
                                </Pressable>
                                <Text style={styles.pageInfo}>
                                    Page {page} of {data.meta.totalPages}
                                </Text>
                                <Pressable
                                    style={[styles.pageButton, page === data.meta.totalPages && styles.pageButtonDisabled]}
                                    onPress={() => setPage(Math.min(data.meta.totalPages, page + 1))}
                                    disabled={page === data.meta.totalPages}
                                >
                                    <Ionicons name="chevron-forward" size={20} color={page === data.meta.totalPages ? '#CCC' : '#5A31F4'} />
                                </Pressable>
                            </View>
                        )}
                    </>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    content: {
        padding: 24,
        maxWidth: 1200,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1A1A2E',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 24,
        gap: 12,
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    searchInput: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 12,
        fontSize: 15,
        color: '#333',
    },
    searchButton: {
        backgroundColor: '#5A31F4',
        paddingHorizontal: 24,
        borderRadius: 12,
        justifyContent: 'center',
    },
    searchButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 15,
    },
    loadingContainer: {
        padding: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultsInfo: {
        marginBottom: 16,
    },
    resultsText: {
        color: '#666',
        fontSize: 14,
    },
    tableContainer: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    tableHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#F8F9FA',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    tableHeaderText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#5A31F4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    avatarImage: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    avatarText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A2E',
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 13,
        color: '#888',
    },
    roleBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    activeBadge: {
        backgroundColor: '#D1FAE5',
    },
    bannedBadge: {
        backgroundColor: '#FEE2E2',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    activeText: {
        color: '#10B981',
    },
    bannedText: {
        color: '#E53935',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        gap: 16,
    },
    pageButton: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    pageButtonDisabled: {
        opacity: 0.5,
    },
    pageInfo: {
        fontSize: 14,
        color: '#666',
    },
});
