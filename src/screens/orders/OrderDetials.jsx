import React from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { getOrderDetailsApi } from '../../api/endpoints';

const COLORS = {
    background: '#f3f6f7', white: '#ffffff', ink: '#172033', muted: '#718196',
    green: '#006b52', paleGreen: '#e4f3ed', blue: '#2b6ca3', border: '#e7edf1', amber: '#dc7a00',
};

const firstValue = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');
const unwrapOrder = (data) => data?.order || data?.data || data || {};
const getItems = (order) => firstValue(order.items, order.orderItems, order.products, []) || [];
const getOrderId = (order, fallback) => firstValue(order.orderId, order.id, order.orderReference, fallback, 'N/A');
const getStatus = (order) => {
    const status = String(firstValue(order.paymentStatus, order.status, order.orderStatus, 'pending')).toLowerCase();
    if (status.includes('pending') || status.includes('awaiting')) return 'pending';
    if (status.includes('complete') || status.includes('delivered')) return 'completed';
    return 'paid';
};
const getAmount = (order) => Number(firstValue(order.totalAmount, order.total, order.amount, 0)) || 0;
const money = (value) => `$${(Number(value) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const itemName = (item) => firstValue(item.productName, item.name, item.title, 'Farm-fresh item');
const itemPrice = (item) => Number(firstValue(item.totalPrice, item.lineTotal, item.price, item.unitPrice, 0)) || 0;
const itemQuantity = (item) => Number(firstValue(item.quantity, item.qty, 1)) || 1;
const itemImage = (item) => firstValue(item.imageUrl, item.image, item.productImage, 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=160');
const formatDate = (value) => {
    if (!value) return 'Today, 12:45 PM';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
};

export default function OrderDetials({ route, navigation }) {
    const orderId = route?.params?.orderId;
    const { data, isLoading, isError } = useQuery({
        queryKey: ['order', orderId],
        queryFn: async () => (await getOrderDetailsApi(orderId)).data,
        enabled: !!orderId,
    });

    if (isLoading) {
        return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color={COLORS.green} /></SafeAreaView>;
    }

    if (isError || !data) {
        return (
            <SafeAreaView style={styles.center}>
                <MaterialCommunityIcons name="receipt-text-remove-outline" size={38} color={COLORS.muted} />
                <Text style={styles.errorTitle}>Unable to load this order</Text>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}><Text style={styles.backButtonText}>Back to Orders</Text></Pressable>
            </SafeAreaView>
        );
    }

    const order = unwrapOrder(data);
    const items = getItems(order);
    const status = getStatus(order);
    const pending = status === 'pending';
    const total = getAmount(order);
    const subtotal = Number(firstValue(order.subtotal, order.itemsSubtotal, total)) || 0;
    const deliveryFee = Number(firstValue(order.deliveryFee, order.shippingFee, 0)) || 0;
    const toteDeposit = Number(firstValue(order.toteDeposit, order.ecoToteDeposit, 0)) || 0;
    const tax = Number(firstValue(order.tax, order.salesTax, Math.max(0, total - subtotal - deliveryFee - toteDeposit))) || 0;
    const address = order.deliveryAddress || order.shippingAddress || order.address || {};
    const addressLine = typeof address === 'string' ? address : firstValue(address.addressLine, address.street, address.line1, '742 Evergreen Lane');
    const city = typeof address === 'string' ? '' : firstValue(address.city, address.town, 'Springfield');
    const recipient = firstValue(order.recipientName, order.customerName, address.name, 'Customer');
    const phone = firstValue(order.phone, address.phone, 'Not provided');
    const detailId = getOrderId(order, orderId);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <View style={styles.topBar}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.backLink}><Feather name="arrow-left" size={14} color={COLORS.green} /><Text style={styles.backLinkText}>Back to Orders</Text></Pressable>
                    <View style={styles.topActions}><Pressable style={styles.smallIcon}><MaterialCommunityIcons name="receipt-text-outline" size={17} color={COLORS.blue} /></Pressable><Pressable style={styles.smallIcon}><Feather name="share-2" size={16} color={COLORS.blue} /></Pressable></View>
                </View>

                <View style={styles.brandRow}>
                    <View><Text style={styles.brandName}>Harvestly</Text><Text style={styles.brandSub}>Farm-to-table delivery</Text></View>
                    <View style={styles.orderIdBlock}><Text style={styles.orderIdLabel}>ORDER ID</Text><Text numberOfLines={1} style={styles.orderId}>{detailId}</Text></View>
                </View>
                <View style={[styles.statusBanner, !pending && styles.paidBanner]}><View style={[styles.statusDot, pending ? styles.pendingDot : styles.paidDot]} /><Text style={[styles.statusText, pending ? styles.pendingText : styles.paidText]}>{pending ? 'PENDING PAYMENT' : 'PAID'}</Text></View>
                <View style={styles.infoBanner}><MaterialCommunityIcons name="information-outline" size={18} color={COLORS.blue} /><View style={styles.flexOne}><Text style={styles.infoTitle}>{pending ? 'Payment authorization awaiting confirmation' : 'Payment confirmed'}</Text><Text style={styles.infoText}>{pending ? 'Complete payment to initiate your farm pack.' : 'Your order has been successfully paid.'}</Text></View></View>

                <SectionHeader title={`Ordered Items (${items.length})`} trailing={`Subtotal: ${money(subtotal)}`} />
                <View style={styles.sectionCard}>
                    {items.length > 0 ? items.map((item, index) => {
                        const unitPrice = Number(firstValue(item.unitPrice, item.price, itemPrice(item) / itemQuantity(item))) || 0;
                        const lineTotal = itemPrice(item) || unitPrice * itemQuantity(item);
                        return <View key={item.id || item.productId || String(index)} style={[styles.itemRow, index > 0 && styles.itemBorder]}><Image source={{ uri: itemImage(item) }} style={styles.itemImage} /><View style={styles.flexOne}><Text numberOfLines={1} style={styles.itemTitle}>{itemName(item)}</Text><Text style={styles.itemMeta}>{firstValue(item.variant, item.weight, 'Farm selection')}</Text><Text style={styles.itemQty}>Qty: {itemQuantity(item)} • {money(unitPrice)} each</Text></View><Text style={styles.itemAmount}>{money(lineTotal)}</Text></View>;
                    }) : <Text style={styles.mutedText}>No item details available.</Text>}
                </View>

                <SectionHeader title="Delivery Details" trailing="Green Slot" trailingIcon="check-circle" />
                <View style={styles.sectionCard}>
                    <DetailRow icon="map-marker-outline" label="Delivery Address" value={`${addressLine}${city ? `, ${city}` : ''}`} subValue={firstValue(address.postalCode, address.zipCode, 'Doorstep delivery')} />
                    <DetailRow icon="clock-outline" label="Estimated Arrival" value={formatDate(order.deliveryDate || order.estimatedDelivery)} subValue={firstValue(order.deliveryWindow, 'Refrigerated courier service')} />
                    <DetailRow icon="account-outline" label="Recipient Contact" value={recipient} subValue={phone} />
                    <View style={styles.noteBox}><MaterialCommunityIcons name="message-text-outline" size={14} color={COLORS.blue} /><Text style={styles.noteText}>{firstValue(order.deliveryNote, order.notes, 'Leave at front porch, ring doorbell.')}</Text></View>
                </View>

                <SectionHeader title="Payment Summary" trailing={firstValue(order.paymentGateway, 'Paystack Gateway')} />
                <View style={styles.sectionCard}>
                    <SummaryRow label="Payment Method" value={firstValue(order.paymentMethod, 'Debit Card')} />
                    <SummaryRow label="Payment Reference" value={firstValue(order.paymentReference, order.transactionReference, 'Not available')} />
                    <View style={styles.summaryDivider} />
                    <SummaryRow label="Items Subtotal" value={money(subtotal)} />
                    <SummaryRow label="Eco-Tote Bag Deposit" value={money(toteDeposit)} />
                    <SummaryRow label="Delivery Fee" value={deliveryFee ? money(deliveryFee) : 'FREE'} green={deliveryFee === 0} />
                    <SummaryRow label="Estimated Sales Tax" value={money(tax)} />
                    <View style={styles.totalRow}><Text style={styles.totalLabel}>Total Payable</Text><Text style={styles.totalAmount}>{money(total)}</Text></View>
                </View>

                {pending && <Pressable style={styles.paymentButton} onPress={() => navigation.navigate('Cart', { screen: 'Checkout', params: { orderId: detailId, orderData: order } })}><Feather name="credit-card" size={15} color={COLORS.white} /><Text style={styles.paymentButtonText}>Complete Payment with Paystack ({money(total)})</Text><Feather name="arrow-right" size={15} color={COLORS.white} /></Pressable>}
            </ScrollView>
        </SafeAreaView>
    );
}

function SectionHeader({ title, trailing, trailingIcon }) {
    return <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text><View style={styles.sectionTrailing}>{trailingIcon && <Feather name={trailingIcon} size={12} color={COLORS.green} />}<Text style={styles.sectionTrailingText}>{trailing}</Text></View></View>;
}

function DetailRow({ icon, label, value, subValue }) {
    return <View style={styles.detailRow}><View style={styles.detailIcon}><MaterialCommunityIcons name={icon} size={15} color={COLORS.green} /></View><View style={styles.flexOne}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text><Text style={styles.detailSubValue}>{subValue}</Text></View></View>;
}

function SummaryRow({ label, value, green }) {
    return <View style={styles.summaryRow}><Text style={styles.summaryLabel}>{label}</Text><Text style={[styles.summaryValue, green && styles.greenValue]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background, padding: 24 }, content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 48 },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }, backLink: { flexDirection: 'row', alignItems: 'center', gap: 6 }, backLinkText: { color: COLORS.green, fontSize: 14, fontWeight: '700' }, topActions: { flexDirection: 'row', gap: 9 }, smallIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: '#e7eef4', alignItems: 'center', justifyContent: 'center' },
    brandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }, brandName: { color: COLORS.green, fontSize: 24, fontWeight: '900' }, brandSub: { color: COLORS.muted, fontSize: 13, marginTop: 2 }, orderIdBlock: { alignItems: 'flex-end', maxWidth: 210 }, orderIdLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '800' }, orderId: { color: COLORS.ink, fontSize: 14, fontWeight: '700', marginTop: 3 },
    statusBanner: { alignSelf: 'flex-end', borderRadius: 16, borderWidth: 1, borderColor: '#f4d993', backgroundColor: '#fffaf0', paddingHorizontal: 13, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 12 }, paidBanner: { borderColor: '#b9dfd0', backgroundColor: COLORS.paleGreen }, statusDot: { width: 9, height: 9, borderRadius: 5 }, pendingDot: { backgroundColor: '#f0a41c' }, paidDot: { backgroundColor: COLORS.green }, statusText: { fontSize: 12, fontWeight: '900' }, pendingText: { color: COLORS.amber }, paidText: { color: COLORS.green },
    infoBanner: { backgroundColor: '#eef5fb', borderRadius: 12, padding: 13, flexDirection: 'row', gap: 10, marginBottom: 20 }, infoTitle: { color: COLORS.blue, fontSize: 13, fontWeight: '800' }, infoText: { color: '#58718b', fontSize: 12, marginTop: 4 }, flexOne: { flex: 1 }, sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }, sectionTitle: { color: COLORS.ink, fontSize: 18, fontWeight: '900' }, sectionTrailing: { flexDirection: 'row', alignItems: 'center', gap: 4 }, sectionTrailingText: { color: COLORS.green, fontSize: 12, fontWeight: '800' },
    sectionCard: { backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 20, shadowColor: '#173b2e', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }, itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }, itemBorder: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 14 }, itemImage: { width: 64, height: 64, borderRadius: 9, backgroundColor: '#eef2ed' }, itemTitle: { color: COLORS.ink, fontSize: 14, fontWeight: '800' }, itemMeta: { color: COLORS.muted, fontSize: 11, marginTop: 4 }, itemQty: { color: COLORS.blue, fontSize: 11, marginTop: 4 }, itemAmount: { color: COLORS.ink, fontSize: 13, fontWeight: '900' }, mutedText: { color: COLORS.muted, fontSize: 13, paddingVertical: 10 },
    detailRow: { flexDirection: 'row', gap: 11, marginBottom: 16 }, detailIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.paleGreen, alignItems: 'center', justifyContent: 'center' }, detailLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700' }, detailValue: { color: COLORS.ink, fontSize: 14, fontWeight: '800', marginTop: 2 }, detailSubValue: { color: COLORS.muted, fontSize: 11, marginTop: 3 }, noteBox: { backgroundColor: '#eef5fb', borderRadius: 9, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 7 }, noteText: { color: COLORS.blue, fontSize: 11, flex: 1 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 }, summaryLabel: { color: COLORS.muted, fontSize: 12 }, summaryValue: { color: COLORS.ink, fontSize: 12, fontWeight: '700', maxWidth: 210, textAlign: 'right' }, greenValue: { color: COLORS.green }, summaryDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 7 }, totalRow: { borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 7, paddingTop: 13, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, totalLabel: { color: COLORS.ink, fontSize: 17, fontWeight: '900' }, totalAmount: { color: COLORS.green, fontSize: 22, fontWeight: '900' }, paymentButton: { minHeight: 52, borderRadius: 16, backgroundColor: COLORS.green, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }, paymentButtonText: { color: COLORS.white, fontSize: 13, fontWeight: '900', flex: 1, textAlign: 'center' }, errorTitle: { color: COLORS.ink, fontSize: 17, fontWeight: '800', marginTop: 12 }, backButton: { backgroundColor: COLORS.green, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12, marginTop: 18 }, backButtonText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
});
