import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    Image,
    Alert,
} from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { initializePaymentApi, simulatePaymentWebhookApi } from '../../api/endpoints';

export default function CheckoutScreen({ route, navigation }) {
    // orderId passed from CartScreen checkout action
    const { orderId = 'fb68000a-1212', orderData } = route.params || {};

    const [selectedChannel, setSelectedChannel] = useState('card');

    console.log(orderId);
    
    // 1. Initialize Paystack Payment
    const { data: paymentInfo, isLoading: isInitializing, error: error } = useQuery({
        queryKey: ['initializePayment', orderId],
        queryFn: async () => {
            const res = await initializePaymentApi(orderId);
            
            return res.data; // expects { authorizationUrl, reference, accessCode, amount }
        },
        enabled: !!orderId,
    });
    console.log("hello this is me", error);

    // 2. Webhook Simulation Mutation (for backend sandbox testing)
    console.log("this is the reference", paymentInfo);
    const simulateWebhookMutation = useMutation({
        mutationFn: () => simulatePaymentWebhookApi(paymentInfo?.reference || 'pstk_ref_982081X271'),

        
        onSuccess: () => {
            Alert.alert('Webhook Success', 'Payment simulation completed! Order auto-fulfilled.', [
                { text: 'View Orders', onPress: () => navigation.navigate('OrderHistory') },
            ]);
        },
        onError: (err) => Alert.alert('Error', err.response?.data?.message || 'Simulation failed'),
    });

    const handlePayNow = () => {
        if (!paymentInfo?.authorizationUrl) {
            Alert.alert('Notice', 'Payment gateway reference initialized. Processing...');
            return;
        }
        // Redirect to WebView or Paystack Browser Flow
        Alert.alert('Paystack Gateway', `Opening gateway: ${paymentInfo.authorizationUrl}`);
    };

    if (isInitializing) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color="#0a5d2c" />
                <Text style={{ marginTop: 10, color: '#666', fontSize: 12 }}>Initializing Paystack Secure Checkout...</Text>
            </SafeAreaView>
        );
    }

    const txRef = paymentInfo?.reference || 'pstk_ref_982081X271';
    const totalAmount = orderData?.totalAmount || 42.34;

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Nav Header */}
            <View style={styles.topNav}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={16} color="#1f2937" />
                    <Text style={styles.backBtnText}>Return to Cart</Text>
                </TouchableOpacity>
                <View style={styles.sslBadge}>
                    <Feather name="lock" size={10} color="#0a5d2c" />
                    <Text style={styles.sslText}>hello</Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Title Section */}
                <View style={styles.titleRow}>
                    <View>
                        <Text style={styles.screenTitle}>Checkout & Payment</Text>
                        <Text style={styles.screenSubtitle}>Fulfill your farm-fresh basket securely</Text>
                    </View>
                    <View style={styles.lockIconCircle}>
                        <Feather name="lock" size={16} color="#0a5d2c" />
                    </View>
                </View>

                {/* Status Box */}
                <View style={styles.statusCard}>
                    <View style={styles.statusBadgesRow}>
                        <View style={styles.pendingBadge}>
                            <View style={styles.dotOrange} />
                            <Text style={styles.pendingText}>PENDING AUTHORIZATION</Text>
                        </View>
                        <View style={styles.verifiedBadge}>
                            <Feather name="check-circle" size={10} color="#0284c7" />
                            <Text style={styles.verifiedText}>Paystack Verified</Text>
                        </View>
                    </View>

                    <View style={styles.statusDivider} />

                    <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>ORDER ID</Text>
                        <View style={styles.metaValGroup}>
                            <Text style={styles.metaValue}>{orderId}</Text>
                            <Feather name="copy" size={12} color="#6b7280" />
                        </View>
                    </View>

                    <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>TX REFERENCE</Text>
                        <Text style={styles.metaValue}>{txRef}</Text>
                    </View>
                </View>

                {/* Order Summary Dropdown */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <MaterialCommunityIcons name="shopping-outline" size={18} color="#0a5d2c" />
                            <View>
                                <Text style={styles.summaryTitle}>Order Summary</Text>
                                <Text style={styles.summarySub}>3 item varieties</Text>
                            </View>
                        </View>
                        <Feather name="chevron-down" size={18} color="#6b7280" />
                    </View>

                    {/* Basket Preview Items */}
                    <View style={styles.itemList}>
                        <View style={styles.itemRow}>
                            <Image source={{ uri: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=200' }} style={styles.itemThumb} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.itemTitle}>Artisan Eba Flour</Text>
                                <Text style={styles.itemTag}>Qty: 3 • <Text style={{ color: '#15803d' }}>Organic</Text></Text>
                            </View>
                            <Text style={styles.itemPrice}>$18.99</Text>
                        </View>

                        <View style={styles.itemRow}>
                            <Image source={{ uri: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=200' }} style={styles.itemThumb} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.itemTitle}>Hass Avocados (Single)</Text>
                                <Text style={styles.itemTag}>Qty: 1 • <Text style={{ color: '#15803d' }}>Fresh ripe</Text></Text>
                            </View>
                            <Text style={styles.itemPrice}>$4.50</Text>
                        </View>

                        <View style={styles.itemRow}>
                            <Image source={{ uri: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=200' }} style={styles.itemThumb} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.itemTitle}>Artisan Sourdough Loaf</Text>
                                <Text style={styles.itemTag}>Qty: 2 • <Text style={{ color: '#15803d' }}>Wildyeast</Text></Text>
                            </View>
                            <Text style={styles.itemPrice}>$14.50</Text>
                        </View>
                    </View>

                    {/* Breakdown */}
                    <View style={styles.calcDivider} />
                    <View style={styles.calcRow}>
                        <Text style={styles.calcLabel}>Basket Subtotal</Text>
                        <Text style={styles.calcVal}>$37.99</Text>
                    </View>
                    <View style={styles.calcRow}>
                        <Text style={styles.calcLabel}>Eco-Tote Deposit ♻</Text>
                        <Text style={styles.calcVal}>$1.50</Text>
                    </View>
                    <View style={styles.calcRow}>
                        <Text style={styles.calcLabel}>Calculated Tax</Text>
                        <Text style={styles.calcVal}>$2.85</Text>
                    </View>
                    <View style={styles.calcRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Text style={styles.calcLabel}>Express Harvest Delivery</Text>
                            <View style={styles.promoTag}><Text style={styles.promoText}>HARVEST24</Text></View>
                        </View>
                        <Text style={[styles.calcVal, { color: '#15803d' }]}>Free</Text>
                    </View>

                    <View style={styles.totalPayableRow}>
                        <View>
                            <Text style={styles.totalPayableTitle}>Total Payable</Text>
                            <Text style={styles.paystackEquiv}>~₦65,600 Paystack equivalent</Text>
                        </View>
                        <Text style={styles.totalPayableAmount}>${totalAmount.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Delivery Destination */}
                <View style={styles.destinationCard}>
                    <View style={styles.destIconBg}>
                        <Ionicons name="bus-outline" size={16} color="#0a5d2c" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={styles.destTitle}>Delivery Destination</Text>
                            <Text style={styles.destTime}>Today, 5:30 PM</Text>
                        </View>
                        <Text style={styles.destSub}>742 Evergreen St, Apt 4B • Doorstep delivery</Text>
                    </View>
                </View>

                {/* Payment Channels */}
                <View style={styles.channelSection}>
                    <View style={styles.channelHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <MaterialCommunityIcons name="credit-card-outline" size={18} color="#0a5d2c" />
                            <Text style={styles.channelHeaderTitle}>Payment Channel</Text>
                        </View>
                        <Text style={styles.gatewayLabel}>Paystack Gateway</Text>
                    </View>

                    {/* Card Option */}
                    <TouchableOpacity
                        style={[styles.channelOption, selectedChannel === 'card' && styles.channelOptionSelected]}
                        onPress={() => setSelectedChannel('card')}
                    >
                        <View style={styles.channelMainRow}>
                            <Feather name="credit-card" size={18} color="#0a5d2c" />
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.channelTitle}>Debit / Credit Card</Text>
                                <Text style={styles.channelSubtitle}>Visa, Mastercard, Verve</Text>
                            </View>
                            <Ionicons name="checkmark-circle" size={18} color="#0a5d2c" />
                        </View>
                        <View style={styles.cardTokenBox}>
                            <Text style={styles.cardNumber}>VISA  ••••  ••••  ••••  0829</Text>
                            <View style={styles.defaultBadge}><Text style={styles.defaultText}>Default</Text></View>
                        </View>
                        <Text style={styles.vaultSubtext}>Tokenized card reference via Paystack secure vault</Text>
                    </TouchableOpacity>

                    {/* Bank Transfer */}
                    <TouchableOpacity
                        style={[styles.channelOption, selectedChannel === 'bank' && styles.channelOptionSelected]}
                        onPress={() => setSelectedChannel('bank')}
                    >
                        <View style={styles.channelMainRow}>
                            <MaterialCommunityIcons name="bank-outline" size={18} color="#4b5563" />
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.channelTitle}>Paystack Bank Transfer</Text>
                                <Text style={styles.channelSubtitle}>Instant virtual account allocation</Text>
                            </View>
                            <View style={styles.radioOutline} />
                        </View>
                    </TouchableOpacity>

                    {/* USSD & Mobile Money */}
                    <TouchableOpacity
                        style={[styles.channelOption, selectedChannel === 'ussd' && styles.channelOptionSelected]}
                        onPress={() => setSelectedChannel('ussd')}
                    >
                        <View style={styles.channelMainRow}>
                            <MaterialCommunityIcons name="cellphone-text" size={18} color="#4b5563" />
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.channelTitle}>USSD & Mobile Money</Text>
                                <Text style={styles.channelSubtitle}>Guaranty, Zenith, M-Pesa, Apple Pay</Text>
                            </View>
                            <View style={styles.radioOutline} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Backend Sandbox Simulation Card */}
                <View style={styles.sandboxCard}>
                    <View style={styles.sandboxHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                            <Feather name="terminal" size={14} color="#1f2937" />
                            <Text style={styles.sandboxTitle}>Backend Sandbox Mode</Text>
                        </View>
                        <View style={styles.simBadge}>
                            <Text style={styles.simBadgeText}>paymentSimulationEnabled</Text>
                        </View>
                    </View>
                    <Text style={styles.sandboxDesc}>
                        Simulate a direct webhook confirmation payload (<Text style={{ fontWeight: 'bold' }}>charge.success</Text>) without leaving the browser/mobile sandbox.
                    </Text>

                    <TouchableOpacity
                        style={styles.simulateBtn}
                        onPress={() => simulateWebhookMutation.mutate()}
                        disabled={simulateWebhookMutation.isPending}
                    >
                        {simulateWebhookMutation.isPending ? (
                            <ActivityIndicator size="small" color="#0a5d2c" />
                        ) : (
                            <>
                                <Ionicons name="flash-outline" size={14} color="#0a5d2c" style={{ marginRight: 6 }} />
                                <Text style={styles.simulateBtnText}>Simulate Webhook Success</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Main Sticky Action Button */}
            <View style={styles.footerSticky}>
                <TouchableOpacity style={styles.payBtn} onPress={handlePayNow}>
                    <Feather name="shield" size={16} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.payBtnText}>Pay ${totalAmount.toFixed(2)} with Paystack</Text>
                    <Feather name="arrow-right" size={16} color="#fff" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
                <Text style={styles.footerNotice}>
                    Clicking pay initializes Paystack modal. Order auto-fulfills via verified server webhook callback.
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f4f7f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f7f5' },
    scrollContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 120 },

    topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    backBtnText: { fontSize: 12, fontWeight: '600', color: '#1f2937' },
    sslBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#eef6f1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    sslText: { fontSize: 8, fontWeight: 'bold', color: '#0a5d2c' },

    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    screenTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
    screenSubtitle: { fontSize: 11, color: '#6b7280', marginTop: 2 },
    lockIconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#eef6f1', justifyContent: 'center', alignItems: 'center' },

    statusCard: { backgroundColor: '#ffffff', borderRadius: 14, padding: 12, marginBottom: 14, elevation: 1 },
    statusBadgesRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    pendingBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff7ed', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    dotOrange: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#c2410c' },
    pendingText: { fontSize: 9, fontWeight: 'bold', color: '#c2410c' },
    verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f0f9ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    verifiedText: { fontSize: 9, fontWeight: 'bold', color: '#0284c7' },
    statusDivider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 10 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    metaLabel: { fontSize: 9, fontWeight: 'bold', color: '#9ca3af', letterSpacing: 0.5 },
    metaValGroup: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaValue: { fontSize: 11, fontWeight: 'bold', color: '#1f2937', fontFamily: 'Platform' },

    summaryCard: { backgroundColor: '#ffffff', borderRadius: 14, padding: 14, marginBottom: 14, elevation: 1 },
    summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    summaryTitle: { fontSize: 13, fontWeight: 'bold', color: '#111827' },
    summarySub: { fontSize: 10, color: '#6b7280' },
    itemList: { gap: 10 },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    itemThumb: { width: 40, height: 40, borderRadius: 8 },
    itemTitle: { fontSize: 12, fontWeight: 'bold', color: '#111827' },
    itemTag: { fontSize: 10, color: '#6b7280', marginTop: 1 },
    itemPrice: { fontSize: 12, fontWeight: 'bold', color: '#111827' },
    calcDivider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 10 },
    calcRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    calcLabel: { fontSize: 11, color: '#6b7280' },
    calcVal: { fontSize: 11, fontWeight: '600', color: '#1f2937' },
    promoTag: { backgroundColor: '#dcfce7', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 },
    promoText: { fontSize: 8, fontWeight: 'bold', color: '#15803d' },
    totalPayableRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
    totalPayableTitle: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
    paystackEquiv: { fontSize: 9, color: '#9ca3af' },
    totalPayableAmount: { fontSize: 20, fontWeight: 'bold', color: '#111827' },

    destinationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eef6f1', borderRadius: 12, padding: 12, marginBottom: 14, gap: 10 },
    destIconBg: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center' },
    destTitle: { fontSize: 11, fontWeight: 'bold', color: '#0a5d2c' },
    destTime: { fontSize: 9, fontWeight: 'bold', color: '#0a5d2c' },
    destSub: { fontSize: 10, color: '#4b5563', marginTop: 2 },

    channelSection: { gap: 10, marginBottom: 14 },
    channelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
    channelHeaderTitle: { fontSize: 13, fontWeight: 'bold', color: '#111827' },
    gatewayLabel: { fontSize: 10, color: '#6b7280' },
    channelOption: { backgroundColor: '#ffffff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e5e7eb' },
    channelOptionSelected: { borderColor: '#0a5d2c', backgroundColor: '#f0fdf4' },
    channelMainRow: { flexDirection: 'row', alignItems: 'center' },
    channelTitle: { fontSize: 12, fontWeight: 'bold', color: '#111827' },
    channelSubtitle: { fontSize: 10, color: '#6b7280', marginTop: 1 },
    radioOutline: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1' },
    cardTokenBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8faf9', padding: 8, borderRadius: 8, marginTop: 10 },
    cardNumber: { fontSize: 11, fontWeight: 'bold', color: '#1f2937' },
    defaultBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    defaultText: { fontSize: 8, fontWeight: 'bold', color: '#15803d' },
    vaultSubtext: { fontSize: 9, color: '#9ca3af', marginTop: 6 },

    sandboxCard: { backgroundColor: '#eff6ff', borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#bfdbfe' },
    sandboxHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    sandboxTitle: { fontSize: 12, fontWeight: 'bold', color: '#1e40af' },
    simBadge: { backgroundColor: '#bbf7d0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    simBadgeText: { fontSize: 8, fontWeight: 'bold', color: '#15803d' },
    sandboxDesc: { fontSize: 10, color: '#3b82f6', lineHeight: 14, marginBottom: 10 },
    simulateBtn: { backgroundColor: '#ffffff', borderHeight: 1, borderColor: '#bfdbfe', paddingVertical: 8, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    simulateBtnText: { fontSize: 11, fontWeight: 'bold', color: '#0a5d2c' },

    footerSticky: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb', elevation: 8 },
    payBtn: { backgroundColor: '#064e23', paddingVertical: 14, borderRadius: 28, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    payBtnText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
    footerNotice: { fontSize: 8, color: '#9ca3af', textAlign: 'center', marginTop: 6 },
});