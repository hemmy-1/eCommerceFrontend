import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Image,
    Alert,
} from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import WebView from 'react-native-webview';
import { initializePaymentApi, simulatePaymentWebhookApi } from '../../api/endpoints';
import { SafeAreaView } from 'react-native-safe-area-context';

const toNumber = (value, fallback = 0) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
};

export default function CheckoutScreen({ route, navigation }) {
    const { orderId, orderData = {} } = route.params || {};

    console.log("this is the order Id:  ", orderId);
    

    const [selectedChannel, setSelectedChannel] = useState('card');
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
    const [showWebView, setShowWebView] = useState(false);
    const [paymentCompleted, setPaymentCompleted] = useState(false);
    const [paymentResult, setPaymentResult] = useState(null);

    const items = Array.isArray(orderData.items) ? orderData.items : [];
    const subtotal = toNumber(orderData.subtotal, 0);
    const shippingFee = toNumber(orderData.shippingFee, 0);
    const tax = toNumber(orderData.tax, 0);
    const toteDeposit = toNumber(orderData.toteDeposit, 0);
    const totalAmount = toNumber(orderData.totalAmount ?? subtotal + shippingFee + tax + toteDeposit, 0);

    const { data: paymentInfo, isLoading: isInitializing } = useQuery({
        queryKey: ['initializePayment', orderId],
        queryFn: async () => {
            const res = await initializePaymentApi(orderId);
            console.log('[Checkout] Payment initialization response:', res.data);
            console.log('[Checkout] transactionReference received:', res.data?.transactionReference);
            return res.data;
        },
        enabled: !!orderId,
    });

    const [paymentUrl, setPaymentUrl] = useState('');
    useEffect(() => {
        if (paymentInfo) {
            console.log('[Checkout] paymentInfo transactionReference:', paymentInfo.transactionReference);
            console.log('[Checkout] payment URL received:', paymentInfo.paymentUrl || paymentInfo.authorizationUrl || '(none: simulation mode)');
        }
        const authorizationUrl = paymentInfo?.paymentUrl || paymentInfo?.authorizationUrl || '';
        if (authorizationUrl) {
            setPaymentUrl(authorizationUrl);
        }
    }, [paymentInfo]);

    const navigateToOrders = () => {
        const parentNav = navigation.getParent();
        if (parentNav) {
            parentNav.navigate('Orders');
            return;
        }
        navigation.navigate('Orders');
    };

    useEffect(() => {
        if (paymentResult !== 'success') return;

        const timer = setTimeout(() => {
            navigateToOrders();
        }, 1800);

        return () => clearTimeout(timer);
    }, [paymentResult, navigation]);

    const simulateWebhookMutation = useMutation({
        mutationFn: (referenceOverride) => {
            const transactionReference = referenceOverride || paymentInfo?.transactionReference;
            console.log('[Checkout] Sending transactionReference to webhook:', transactionReference);

            if (!transactionReference) {
                throw new Error('Payment initialization did not return transactionReference');
            }

            return simulatePaymentWebhookApi(transactionReference);
        },
        onSuccess: () => {
            console.log('[Checkout] Payment webhook succeeded for transactionReference:', paymentInfo?.transactionReference);
            setPaymentResult('success');
            setShowWebView(false);
        },
        onError: (err) => {
            console.error('[Checkout] Payment webhook failed:', err);
            setPaymentResult('failed');
            Alert.alert('Error', err.response?.data?.message || 'Simulation failed');
        },
    });

    const handlePayNow = () => {
        if (!paymentUrl) {
            console.log('[Checkout] Pay button pressed without paymentUrl. transactionReference:', paymentInfo?.transactionReference);

            // Backend simulation mode can legitimately return no authorization URL.
            // In that case, complete the order through the scheduled webhook flow instead of blocking.
            simulateWebhookMutation.mutate();
            return;
        }
        console.log('[Checkout] Opening paymentUrl with transactionReference:', paymentInfo?.transactionReference);
        setPaymentCompleted(false);
        setShowWebView(true);
    };

    const handleWebViewStateChange = (navState) => {
        const nextUrl = navState?.url || '';
        const normalized = nextUrl.toLowerCase();

        if (paymentCompleted) return;

        if (
            normalized.includes('success') ||
            normalized.includes('paid') ||
            normalized.includes('complete') ||
            normalized.includes('status=success')
        ) {
            setPaymentCompleted(true);
            simulateWebhookMutation.mutate();
            return;
        }

        if (
            normalized.includes('cancel') ||
            normalized.includes('failed') ||
            normalized.includes('error')
        ) {
            setPaymentCompleted(true);
            setPaymentResult('failed');
            setShowWebView(false);
        }
    };

    if (paymentResult === 'success') {
        return (
            <SafeAreaView style={styles.resultSafeArea}>
                <View style={styles.resultCard}>
                    <View style={styles.successIconCircle}>
                        <Feather name="check" size={32} color="#fff" />
                    </View>
                    <Text style={styles.resultTitle}>Payment Successful</Text>
                    <Text style={styles.resultText}>Your order has been confirmed and is being prepared.</Text>
                    <Text style={styles.resultHint}>Redirecting to your orders...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (paymentResult === 'failed') {
        return (
            <SafeAreaView style={styles.resultSafeArea}>
                <View style={styles.resultCard}>
                    <View style={styles.failedIconCircle}>
                        <Feather name="x" size={32} color="#fff" />
                    </View>
                    <Text style={styles.resultTitle}>Payment Cancelled</Text>
                    <Text style={styles.resultText}>Your payment did not complete. You can try again or return to your cart.</Text>
                    <View style={styles.resultActions}>
                        <TouchableOpacity style={styles.secondaryAction} onPress={() => navigation.goBack()}>
                            <Text style={styles.secondaryActionText}>Back to Cart</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.primaryAction} onPress={() => { setPaymentResult(null); setShowWebView(false); handlePayNow(); }}>
                            <Text style={styles.primaryActionText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    if (showWebView && paymentUrl) {
        return (
            <SafeAreaView style={styles.webViewSafeArea}>
                <View style={styles.webViewHeader}>
                    <TouchableOpacity onPress={() => setShowWebView(false)} style={styles.webViewCloseBtn}>
                        <Feather name="x" size={18} color="#1f2937" />
                        <Text style={styles.webViewCloseText}>Close</Text>
                    </TouchableOpacity>
                </View>
                <WebView
                    source={{ uri: paymentUrl }}
                    startInLoadingState
                    onNavigationStateChange={handleWebViewStateChange}
                    renderLoading={() => (
                        <View style={styles.webViewLoader}>
                            <ActivityIndicator size="large" color="#0a5d2c" />
                        </View>
                    )}
                    style={styles.webView}
                />
            </SafeAreaView>
        );
    }

    if (isInitializing) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color="#0a5d2c" />
                <Text style={{ marginTop: 10, color: '#666', fontSize: 12 }}>Initializing Paystack Secure Checkout...</Text>
            </SafeAreaView>
        );
    }

    const txRef = paymentInfo?.transactionReference || 'Pending Initialization...';

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.topNav}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={16} color="#1f2937" />
                    <Text style={styles.backBtnText}>Return to Cart</Text>
                </TouchableOpacity>
                <View style={styles.sslBadge}>
                    <Feather name="lock" size={10} color="#0a5d2c" />
                    <Text style={styles.sslText}>256-BIT SSL</Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.titleRow}>
                    <View>
                        <Text style={styles.screenTitle}>Checkout & Payment</Text>
                        <Text style={styles.screenSubtitle}>Fulfill your farm-fresh basket securely</Text>
                    </View>
                    <View style={styles.lockIconCircle}>
                        <Feather name="lock" size={16} color="#0a5d2c" />
                    </View>
                </View>

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
                            <Text style={styles.metaValue}>{orderId || 'N/A'}</Text>
                            <Feather name="copy" size={12} color="#6b7280" />
                        </View>
                    </View>

                    <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>TX REFERENCE</Text>
                        <Text style={styles.metaValue}>{txRef}</Text>
                    </View>
                </View>

                <View style={styles.summaryCard}>
                    <TouchableOpacity
                        style={styles.summaryHeader}
                        onPress={() => setIsSummaryExpanded(!isSummaryExpanded)}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <MaterialCommunityIcons name="shopping-outline" size={18} color="#0a5d2c" />
                            <View>
                                <Text style={styles.summaryTitle}>Order Summary</Text>
                                <Text style={styles.summarySub}>{items.length} {items.length === 1 ? 'item' : 'items'}</Text>
                            </View>
                        </View>
                        <Feather name={isSummaryExpanded ? 'chevron-up' : 'chevron-down'} size={18} color="#6b7280" />
                    </TouchableOpacity>

                    {isSummaryExpanded && (
                        <>
                            <View style={styles.itemList}>
                                {items.length > 0 ? (
                                    items.map((item, index) => (
                                        <View key={item.id || index.toString()} style={styles.itemRow}>
                                            <Image
                                                source={{ uri: item.image || 'https://via.placeholder.com/100' }}
                                                style={styles.itemThumb}
                                            />
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.itemTitle}>{item.title || item.name}</Text>
                                                <Text style={styles.itemTag}>
                                                    Qty: {item.quantity || 1} {item.variant ? `• ${item.variant}` : ''}
                                                </Text>
                                            </View>
                                            <Text style={styles.itemPrice}>
                                                ${(toNumber(item.price || 0) * toNumber(item.quantity || 1)).toFixed(2)}
                                            </Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>
                                        No item details passed.
                                    </Text>
                                )}
                            </View>

                            <View style={styles.calcDivider} />
                            <View style={styles.calcRow}>
                                <Text style={styles.calcLabel}>Basket Subtotal</Text>
                                <Text style={styles.calcVal}>${subtotal.toFixed(2)}</Text>
                            </View>
                            {toteDeposit > 0 && (
                                <View style={styles.calcRow}>
                                    <Text style={styles.calcLabel}>Eco-Tote Deposit ♻</Text>
                                    <Text style={styles.calcVal}>${toteDeposit.toFixed(2)}</Text>
                                </View>
                            )}
                            <View style={styles.calcRow}>
                                <Text style={styles.calcLabel}>Calculated Tax</Text>
                                <Text style={styles.calcVal}>${tax.toFixed(2)}</Text>
                            </View>

                            <View style={styles.totalPayableRow}>
                                <View>
                                    <Text style={styles.totalPayableTitle}>Total Payable</Text>
                                </View>
                                <Text style={styles.totalPayableAmount}>${totalAmount.toFixed(2)}</Text>
                            </View>
                        </>
                    )}
                </View>

                <View style={styles.channelSection}>
                    <View style={styles.channelHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <MaterialCommunityIcons name="credit-card-outline" size={18} color="#0a5d2c" />
                            <Text style={styles.channelHeaderTitle}>Payment Channel</Text>
                        </View>
                        <Text style={styles.gatewayLabel}>Paystack Gateway</Text>
                    </View>

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
                    </TouchableOpacity>

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
                </View>

                <View style={styles.sandboxCard}>
                    <View style={styles.sandboxHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                            <Feather name="terminal" size={14} color="#1f2937" />
                            <Text style={styles.sandboxTitle}>Backend Sandbox Mode</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.simulateBtn}
                        onPress={() => simulateWebhookMutation.mutate()}
                        disabled={simulateWebhookMutation.isPending}
                    >
                        {simulateWebhookMutation.isPending ? (
                            <ActivityIndicator size="small" color="#0a5d2c" />
                        ) : (
                            <Text style={styles.simulateBtnText}>Simulate Webhook Success</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={styles.footerSticky}>
                <TouchableOpacity style={styles.payBtn} onPress={handlePayNow}>
                    <Feather name="shield" size={16} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.payBtnText}>Pay ${totalAmount.toFixed(2)} with Paystack</Text>
                    <Feather name="arrow-right" size={16} color="#fff" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
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
    metaValue: { fontSize: 11, fontWeight: 'bold', color: '#1f2937' },
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
    totalPayableRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
    totalPayableTitle: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
    totalPayableAmount: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
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
    sandboxCard: { backgroundColor: '#eff6ff', borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#bfdbfe' },
    sandboxHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    sandboxTitle: { fontSize: 12, fontWeight: 'bold', color: '#1e40af' },
    simulateBtn: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#bfdbfe', paddingVertical: 8, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    simulateBtnText: { fontSize: 11, fontWeight: 'bold', color: '#0a5d2c' },
    footerSticky: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb', elevation: 8 },
    payBtn: { backgroundColor: '#064e23', paddingVertical: 14, borderRadius: 28, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    payBtnText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
    webViewSafeArea: { flex: 1, backgroundColor: '#fff' },
    webViewHeader: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: '#fff' },
    webViewCloseBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6 },
    webViewCloseText: { fontSize: 13, fontWeight: '600', color: '#1f2937' },
    webView: { flex: 1 },
    webViewLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    resultSafeArea: { flex: 1, backgroundColor: '#f4f7f5', justifyContent: 'center', alignItems: 'center', padding: 24 },
    resultCard: { backgroundColor: '#fff', borderRadius: 20, padding: 28, width: '100%', alignItems: 'center', elevation: 2 },
    successIconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#0a5d2c', justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
    failedIconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#dc2626', justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
    resultTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
    resultText: { fontSize: 13, color: '#4b5563', textAlign: 'center', lineHeight: 20 },
    resultHint: { marginTop: 12, fontSize: 12, color: '#0a5d2c', fontWeight: '600' },
    resultActions: { flexDirection: 'row', marginTop: 20, gap: 10 },
    primaryAction: { backgroundColor: '#0a5d2c', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 18 },
    primaryActionText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    secondaryAction: { backgroundColor: '#e5e7eb', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 18 },
    secondaryActionText: { color: '#111827', fontWeight: 'bold', fontSize: 12 },
});