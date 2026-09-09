import React, { useContext, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { getCustomerOrdersApi } from '../../api/endpoints';
import { AuthContext } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const FILTERS = [
    { key: 'all', label: 'All Orders' },
    { key: 'pending', label: 'Pending Payment' },
    { key: 'paid', label: 'Paid' },
    // { key: 'completed', label: 'Completed' },
];

const normalizeStatus = (order) => {
    const status = String(order.paymentStatus || order.status || order.orderStatus || 'processing').toLowerCase();
    if (status.includes('pending') || status.includes('awaiting')) return 'pending';
    if (status.includes('complete') || status.includes('delivered')) return 'completed';
    return 'paid';
};

const getOrderId = (order) => order.orderId || order.id || order.orderReference || 'N/A';

const formatAmount = (order) => {
    const amount = Number(order.totalAmount ?? order.total ?? order.amount ?? 0);
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatPlacedDate = (order) => {
    const date = order.createdAt || order.placedAt || order.orderDate;
    if (!date) return 'Recently placed';
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return String(date);
    return parsedDate.toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
};

export default function OrderHistoryScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const [activeFilter, setActiveFilter] = useState('all');
    const [search, setSearch] = useState('');

    const { data: orders, isLoading } = useQuery({
        queryKey: ['orders', user?.id],
        queryFn: async () => {
            const response = await getCustomerOrdersApi(user.id);
            return Array.isArray(response.data) ? response.data : response.data?.orders || [];
        },
        enabled: !!user?.id,
    });

    const filteredOrders = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();
        return (orders || []).filter((order) => {
            const matchesFilter = activeFilter === 'all' || normalizeStatus(order) === activeFilter;
            const searchableText = `${getOrderId(order)} ${order.itemName || order.productName || ''}`.toLowerCase();
            return matchesFilter && (!normalizedSearch || searchableText.includes(normalizedSearch));
        });
    }, [activeFilter, orders, search]);

    const counts = useMemo(() => {
        const allOrders = orders || [];
        return {
            all: allOrders.length,
            pending: allOrders.filter((order) => normalizeStatus(order) === 'pending').length,
        };
    }, [orders]);

    if (isLoading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.green} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <FlatList
                data={filteredOrders}
                keyExtractor={(item, index) => String(getOrderId(item) || index)}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <>
                        <View style={styles.headerRow}>
                            <View>
                                <Text style={styles.title}>My Orders</Text>
                                <Text style={styles.subtitle}>Track and manage your farm-fresh deliveries</Text>
                            </View>
                            <View style={styles.headerActions}>
                                <Pressable accessibilityLabel="Order history" style={styles.iconButton}>
                                    <MaterialCommunityIcons name="receipt-text-outline" size={20} color={COLORS.ink} />
                                </Pressable>
                                <Pressable accessibilityLabel="Help" style={styles.iconButton}>
                                    <Feather name="help-circle" size={20} color={COLORS.ink} />
                                </Pressable>
                            </View>
                        </View>

                        <View style={styles.searchBox}>
                            <Feather name="search" size={19} color={COLORS.muted} />
                            <TextInput
                                value={search}
                                onChangeText={setSearch}
                                placeholder="Search by Order ID or item..."
                                placeholderTextColor={COLORS.muted}
                                style={styles.searchInput}
                                returnKeyType="search"
                            />
                        </View>

                        <View style={styles.filterRow}>
                            <FlatList
                                horizontal
                                data={FILTERS}
                                keyExtractor={(filter) => filter.key}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.filterContent}
                                renderItem={({ item: filter }) => {
                                    const isActive = activeFilter === filter.key;
                                    const count = filter.key === 'all' ? counts.all : filter.key === 'pending' ? counts.pending : null;
                                    return (
                                        <Pressable
                                            onPress={() => setActiveFilter(filter.key)}
                                            style={[styles.filterChip, isActive && styles.activeFilterChip]}
                                        >
                                            <Text style={[styles.filterText, isActive && styles.activeFilterText]}>{filter.label}</Text>
                                            {count !== null && (
                                                <Text style={[styles.filterCount, isActive && styles.activeFilterCount]}>{count}</Text>
                                            )}
                                        </Pressable>
                                    );
                                }}
                            />
                            <Pressable accessibilityLabel="Filter orders" style={styles.filterButton}>
                                <Feather name="sliders" size={18} color={COLORS.ink} />
                            </Pressable>
                        </View>
                    </>
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="receipt-text-remove-outline" size={38} color={COLORS.muted} />
                        <Text style={styles.emptyTitle}>No orders found</Text>
                        <Text style={styles.emptyText}>Try a different search or status filter.</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <OrderCard order={item} navigation={navigation} />
                )}
            />
        </SafeAreaView>
    );
}

function OrderCard({ order, navigation }) {
    const status = normalizeStatus(order);
    const orderId = getOrderId(order);
    const isPending = status === 'pending';
    const statusLabel = status === 'pending' ? 'PENDING PAYMENT' : status.toUpperCase();

    return (
        <View style={styles.card}>
            <View style={styles.cardTopRow}>
                <View style={styles.referenceBlock}>
                    <View style={styles.referenceLabelRow}>
                        <MaterialCommunityIcons name="cube-outline" size={16} color={COLORS.green} />
                        <Text style={styles.referenceLabel}>ORDER REFERENCE</Text>
                    </View>
                    <View style={styles.idRow}>
                        <Text numberOfLines={1} style={styles.orderId}>{orderId}</Text>
                        <Feather name="copy" size={15} color={COLORS.copy} />
                    </View>
                </View>
                <View style={[styles.statusBadge, isPending ? styles.pendingBadge : styles.completedBadge]}>
                    <View style={[styles.statusDot, isPending ? styles.pendingDot : styles.completedDot]} />
                    <Text style={[styles.statusText, isPending ? styles.pendingText : styles.completedText]}>{statusLabel}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
                <View>
                    <Text style={styles.detailLabel}>Total Payable</Text>
                    <Text style={styles.amount}>{formatAmount(order)}</Text>
                </View>
                <View style={styles.placedBlock}>
                    <Text style={styles.detailLabel}>Placed</Text>
                    <Text style={styles.placedValue}>{formatPlacedDate(order)}</Text>
                </View>
            </View>

            <View style={styles.actionsRow}>
                {isPending && (
                    <Pressable
                        style={styles.paymentButton}
                        onPress={() => navigation?.navigate('Cart', {
                            screen: 'Checkout',
                            params: { orderId, orderData: order },
                        })}
                    >
                        <Feather name="credit-card" size={15} color={COLORS.white} />
                        <Text style={styles.paymentButtonText}>Complete Payment</Text>
                    </Pressable>
                )}
                <Pressable
                    style={[styles.detailsButton, !isPending && styles.fullWidthButton]}
                    onPress={() => navigation?.navigate('OrderDetails', { orderId })}
                >
                    <Text style={styles.detailsButtonText}>Details</Text>
                    <Feather name="chevron-right" size={16} color={COLORS.ink} />
                </Pressable>
            </View>
        </View>
    );
}

const COLORS = {
    background: '#f3f6f7',
    white: '#ffffff',
    ink: '#172033',
    muted: '#8b9bad',
    green: '#006b52',
    softGreen: '#e4f3ed',
    border: '#e9eef1',
    copy: '#91a3b8',
    amber: '#dc7a00',
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
    listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
    title: { color: COLORS.ink, fontSize: 25, fontWeight: '800', letterSpacing: -0.4 },
    subtitle: { color: '#718196', fontSize: 13, marginTop: 2 },
    headerActions: { flexDirection: 'row', gap: 8 },
    iconButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#e8eef2', alignItems: 'center', justifyContent: 'center' },
    searchBox: { height: 44, backgroundColor: '#eaf0f4', borderRadius: 14, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginBottom: 14 },
    searchInput: { flex: 1, color: COLORS.ink, fontSize: 14, marginLeft: 10, paddingVertical: 0 },
    filterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    filterContent: { gap: 8, paddingRight: 8 },
    filterChip: { height: 35, paddingHorizontal: 14, borderRadius: 18, backgroundColor: '#e8eef3', flexDirection: 'row', alignItems: 'center', gap: 8 },
    activeFilterChip: { backgroundColor: COLORS.green },
    filterText: { color: '#405069', fontSize: 13, fontWeight: '600' },
    activeFilterText: { color: COLORS.white },
    filterCount: { minWidth: 19, height: 19, paddingHorizontal: 5, borderRadius: 10, backgroundColor: '#fff0d8', color: COLORS.amber, textAlign: 'center', lineHeight: 19, fontSize: 11, fontWeight: '800' },
    activeFilterCount: { backgroundColor: '#2d836d', color: COLORS.white },
    filterButton: { width: 38, height: 38, borderRadius: 11, backgroundColor: '#e8eef3', alignItems: 'center', justifyContent: 'center' },
    card: { backgroundColor: COLORS.white, borderRadius: 20, padding: 18, marginBottom: 13, shadowColor: '#173b2e', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
    cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    referenceBlock: { flex: 1, paddingRight: 10 },
    referenceLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 9 },
    referenceLabel: { color: '#91a4bb', fontSize: 12, fontWeight: '800', letterSpacing: 0.2 },
    idRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    orderId: { color: COLORS.ink, fontSize: 13, fontWeight: '700', maxWidth: 175 },
    statusBadge: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 6 },
    pendingBadge: { backgroundColor: '#fffaf0', borderColor: '#f4d993' },
    completedBadge: { backgroundColor: COLORS.softGreen, borderColor: '#b9dfd0' },
    statusDot: { width: 7, height: 7, borderRadius: 4 },
    pendingDot: { backgroundColor: '#f0a41c' },
    completedDot: { backgroundColor: COLORS.green },
    statusText: { fontSize: 10, fontWeight: '800' },
    pendingText: { color: COLORS.amber },
    completedText: { color: COLORS.green },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 17 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
    detailLabel: { color: '#60718a', fontSize: 12, marginBottom: 5 },
    amount: { color: COLORS.ink, fontSize: 21, fontWeight: '800' },
    placedBlock: { alignItems: 'flex-end' },
    placedValue: { color: '#405069', fontSize: 13, fontWeight: '600' },
    actionsRow: { flexDirection: 'row', gap: 9 },
    paymentButton: { flex: 1, height: 38, borderRadius: 13, backgroundColor: COLORS.green, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
    paymentButtonText: { color: COLORS.white, fontSize: 13, fontWeight: '800' },
    detailsButton: { minWidth: 96, height: 38, borderRadius: 13, backgroundColor: '#eef3f7', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
    fullWidthButton: { flex: 1 },
    detailsButtonText: { color: '#405069', fontSize: 13, fontWeight: '700' },
    emptyState: { alignItems: 'center', paddingTop: 55 },
    emptyTitle: { color: COLORS.ink, fontSize: 16, fontWeight: '800', marginTop: 12 },
    emptyText: { color: COLORS.muted, fontSize: 13, marginTop: 5 },
});