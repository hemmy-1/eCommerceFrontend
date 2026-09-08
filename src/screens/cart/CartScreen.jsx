import React, { useContext, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Image,
    SafeAreaView,
    ScrollView,
    Switch,
    TextInput,
    Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { getCartApi, checkoutApi, updateCartQuantityApi, removeFromCartApi } from '../../api/endpoints';

export default function CartScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const queryClient = useQueryClient();

    const [allowSubstitutions, setAllowSubstitutions] = useState(true);
    const [couponCode, setCouponCode] = useState('HARVESTSPRING');
    const [isCouponApplied, setIsCouponApplied] = useState(true);

    // Fetch Cart Data
    const { data: cart, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['cart', user?.id],
        queryFn: async () => {
            const res = await getCartApi(user.id);
            return res.data;
        },
        enabled: !!user?.id,
    });

    // Checkout Mutation
    const checkoutMutation = useMutation({
        mutationFn: () => checkoutApi(user.id),
        onSuccess: (res) => {
            Alert.alert('Checkout Complete', `Order created successfully! ID: ${res.data?.id || res.data?.orderId}`);
            queryClient.invalidateQueries(['cart', user?.id]);
        },
        onError: (err) => Alert.alert('Error', err.response?.data?.message || 'Checkout failed'),
    });

    // Quantity Update Mutation
    const updateQtyMutation = useMutation({
        mutationFn: ({ productId, quantity }) => updateCartQuantityApi({ customerId: user.id, productId, quantity }),
        onSuccess: () => queryClient.invalidateQueries(['cart', user?.id]),
    });

    // Item Quantity Adjusters
    const handleIncrement = (item) => {
        updateQtyMutation.mutate({ productId: item.productId, quantity: item.quantity + 1 });
    };

    const handleDecrement = (item) => {
        if (item.quantity > 1) {
            updateQtyMutation.mutate({ productId: item.productId, quantity: item.quantity - 1 });
        } else {
            removeFromCartApi({ customerId: user.id, productId: item.productId }).then(() => {
                queryClient.invalidateQueries(['cart', user?.id]);
            });
        }
    };

    // Calculate Calculations (fallback logic)
    const itemsCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 6;
    const subtotal = cart?.cartSubtotal || 37.99;
    const toteBagDeposit = 1.50;
    const salesTax = 2.85;
    const finalTotal = (subtotal + toteBagDeposit + salesTax).toFixed(2);

    const recommendations = [
        { id: 'rec1', name: 'Cold-Pressed Sicilian Olive Oil', price: '$12.40', tag: 'Top Match', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=200' },
        { id: 'rec2', name: 'Raw & Pure Wild Forest Honey', price: '$7.90', tag: 'Artisan', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=200' },
    ];

    if (isLoading && !isRefetching) {
        return <ActivityIndicator style={styles.center} size="large" color="#0a5d2c" />;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Same-Day Harvest Banner */}
                <View style={styles.harvestBanner}>
                    <View style={styles.harvestLeft}>
                        <View style={styles.harvestIconCircle}>
                            <Ionicons name="leaf" size={14} color="#0a5d2c" />
                        </View>
                        <View>
                            <View style={styles.harvestTitleRow}>
                                <Text style={styles.harvestTitle}>Same-Day Harvest</Text>
                                <View style={styles.freshTag}>
                                    <Text style={styles.freshTagText}>Peak Fresh</Text>
                                </View>
                            </View>
                            <Text style={styles.harvestTimeText}>
                                Order within <Text style={styles.boldTimer}>3 h 12 m</Text> for sunset delivery
                            </Text>
                        </View>
                    </View>
                    <Feather name="truck" size={16} color="#0a5d2c" />
                </View>

                {/* My Cart Header */}
                <View style={styles.headerRow}>
                    <Text style={styles.headerTitle}>
                        My Cart <Text style={styles.headerSubtitle}>({cart?.items?.length || 3} unique • {itemsCount} items)</Text>
                    </Text>
                    <TouchableOpacity onPress={() => Alert.alert('Clear All', 'Are you sure you want to clear your cart?')}>
                        <Text style={styles.clearAllText}>Clear all</Text>
                    </TouchableOpacity>
                </View>

                {/* Delivery Destination */}
                <View style={styles.destinationCard}>
                    <View style={styles.destinationLeft}>
                        <View style={styles.locationPinBg}>
                            <Ionicons name="location-outline" size={16} color="#0a5d2c" />
                        </View>
                        <View>
                            <Text style={styles.destinationLabel}>DELIVERY DESTINATION</Text>
                            <Text style={styles.destinationAddress}>742 Evergreen St, Apt 4B</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.changeBtn}>
                        <Text style={styles.changeBtnText}>Change</Text>
                    </TouchableOpacity>
                </View>

                {/* Cart Items List */}
                <View style={styles.itemsListContainer}>
                    {(cart?.items && cart.items.length > 0 ? cart.items : [
                        { productId: '1', productName: 'Artisan Stone-Ground Eba Flour', category: 'PANTRY STAPLES', weight: '2 kg pouch • Sun-dried cassava', unitPrice: 24.00, originalPrice: '$27.00', quantity: 3, tag: 'Bio', note: 'Direct from Oko-Aro Farmers Co-op • Batch: #EB-587', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=200' },
                        { productId: '2', productName: 'Fresh Organic Hass Avocado', category: 'FRESH PRODUCE', weight: 'Pack of 3 • Ripened on vine', unitPrice: 3.49, quantity: 1, tag: 'Ready', note: 'Peak Ripeness: Optimal today & tomorrow', image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=200' },
                        { productId: '3', productName: 'Artisan Sourdough Loaf', category: 'ARTISAN BAKERY', weight: '24 oz • 36-hr cold fermented', unitPrice: 10.50, quantity: 2, tag: 'Warm', note: 'Baked fresh 6:00 AM', image: 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?q=80&w=200' }
                    ]).map((item) => (
                        <View key={item.productId} style={styles.itemCard}>
                            <View style={styles.itemMainRow}>
                                {/* Image & Tag */}
                                <View style={styles.imageWrapper}>
                                    <Image
                                        source={{ uri: item.image || item.imageUrl || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=200' }}
                                        style={styles.itemImage}
                                    />
                                    {item.tag && (
                                        <View style={styles.itemTagBadge}>
                                            <Text style={styles.itemTagText}>{item.tag}</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Info */}
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemCategory}>{(item.category || 'PANTRY STAPLES').toUpperCase()}</Text>
                                    <Text style={styles.itemName} numberOfLines={1}>{item.productName}</Text>
                                    <Text style={styles.itemWeight}>{item.weight || '1 unit'}</Text>

                                    <View style={styles.priceStepperRow}>
                                        <View style={styles.priceRow}>
                                            <Text style={styles.itemPrice}>${parseFloat(item.unitPrice).toFixed(2)}</Text>
                                            {item.originalPrice && <Text style={styles.strikePrice}>{item.originalPrice}</Text>}
                                        </View>

                                        {/* Stepper */}
                                        <View style={styles.stepperContainer}>
                                            <TouchableOpacity style={styles.stepperBtn} onPress={() => handleDecrement(item)}>
                                                <Feather name="minus" size={14} color="#0a5d2c" />
                                            </TouchableOpacity>
                                            <Text style={styles.stepperQty}>{item.quantity}</Text>
                                            <TouchableOpacity style={styles.stepperBtnActive} onPress={() => handleIncrement(item)}>
                                                <Feather name="plus" size={14} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Batch/Note Footer */}
                            {item.note && (
                                <View style={styles.itemNoteRow}>
                                    <Ionicons name="leaf-outline" size={12} color="#0a5d2c" />
                                    <Text style={styles.itemNoteText}>{item.note}</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                {/* Recommendations Section */}
                <View style={styles.recommendSection}>
                    <View style={styles.recommendHeader}>
                        <View>
                            <Text style={styles.recommendTitle}>Pairs Well With Your Basket</Text>
                            <Text style={styles.recommendSubtitle}>Chef recommendations for your pantry items</Text>
                        </View>
                        <View style={styles.picksBadge}>
                            <Text style={styles.picksText}>Picks</Text>
                        </View>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendList}>
                        {recommendations.map((rec) => (
                            <View key={rec.id} style={styles.recommendCard}>
                                <View style={styles.recImageWrapper}>
                                    <Image source={{ uri: rec.image }} style={styles.recImage} />
                                    <View style={styles.recBadge}>
                                        <Text style={styles.recBadgeText}>{rec.tag}</Text>
                                    </View>
                                </View>
                                <Text style={styles.recName} numberOfLines={2}>{rec.name}</Text>
                                <View style={styles.recFooter}>
                                    <Text style={styles.recPrice}>{rec.price}</Text>
                                    <TouchableOpacity style={styles.recAddBtn}>
                                        <Feather name="plus" size={14} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Substitutions & Packaging Toggle Box */}
                <View style={styles.substitutionsCard}>
                    <View style={styles.toggleRow}>
                        <View style={styles.toggleLeft}>
                            <View style={styles.globeIconBg}>
                                <Feather name="globe" size={16} color="#0a5d2c" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.toggleTitle}>Artisanal Substitutions</Text>
                                <Text style={styles.toggleSubtitle}>Allow curated organic alternatives if sold out</Text>
                            </View>
                        </View>
                        <Switch
                            value={allowSubstitutions}
                            onValueChange={setAllowSubstitutions}
                            trackColor={{ false: '#e2e8f0', true: '#0a5d2c' }}
                            thumbColor="#fff"
                        />
                    </View>
                    <View style={styles.myceliumRow}>
                        <MaterialCommunityIcons name="recycle" size={14} color="#0a5d2c" />
                        <Text style={styles.myceliumText}>Packed in 100% compostable mycelium packaging</Text>
                    </View>
                </View>

                {/* Voucher Section */}
                <View style={styles.voucherCard}>
                    <View style={styles.voucherHeader}>
                        <MaterialCommunityIcons name="ticket-percent-outline" size={16} color="#0a5d2c" />
                        <Text style={styles.voucherTitle}>Harvest Voucher & Farm Credits</Text>
                    </View>
                    <View style={styles.voucherInputRow}>
                        <View style={styles.voucherInputBox}>
                            <Feather name="tag" size={14} color="#888" style={{ marginRight: 6 }} />
                            <TextInput
                                style={styles.voucherInput}
                                value={couponCode}
                                onChangeText={setCouponCode}
                                placeholder="Enter Promo Code"
                            />
                        </View>
                        <TouchableOpacity
                            style={[styles.applyBtn, isCouponApplied && styles.appliedBtn]}
                            onPress={() => setIsCouponApplied(!isCouponApplied)}
                        >
                            <Text style={styles.applyBtnText}>{isCouponApplied ? 'Applied' : 'Apply'}</Text>
                        </TouchableOpacity>
                    </View>
                    {isCouponApplied && (
                        <View style={styles.couponSuccessRow}>
                            <Ionicons name="checkmark-circle-outline" size={12} color="#0a5d2c" />
                            <Text style={styles.couponSuccessText}>
                                Coupon applied: Free express harvest delivery unlocked!
                            </Text>
                        </View>
                    )}
                </View>

                {/* Order Summary */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Order Summary</Text>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Items Subtotal ({itemsCount} items)</Text>
                        <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Text style={styles.summaryLabel}>Eco Tote Bag Deposit</Text>
                            <Feather name="help-circle" size={12} color="#888" />
                        </View>
                        <Text style={styles.summaryValue}>${toteBagDeposit.toFixed(2)}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Estimated Sales Tax</Text>
                        <Text style={styles.summaryValue}>${salesTax.toFixed(2)}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.summaryLabel}>Carbon-Neutral Delivery</Text>
                            <View style={styles.promoPill}>
                                <Text style={styles.promoPillText}>PROMO</Text>
                            </View>
                        </View>
                        <Text style={styles.summaryValue}>
                            <Text style={styles.strikeText}>$4.99</Text> <Text style={styles.freeText}>FREE</Text>
                        </Text>
                    </View>

                    <View style={styles.summaryDivider} />

                    <View style={styles.finalTotalRow}>
                        <View>
                            <Text style={styles.finalTotalLabel}>Final Total</Text>
                            <Text style={styles.savedSubtext}>Saved $7.99 on this order</Text>
                        </View>
                        <Text style={styles.finalTotalPrice}>${finalTotal}</Text>
                    </View>

                    <View style={styles.impactBox}>
                        <View style={styles.impactIconBg}>
                            <Ionicons name="leaf" size={12} color="#0a5d2c" />
                        </View>
                        <Text style={styles.impactText}>
                            This basket supports <Text style={{ fontWeight: 'bold' }}>3 local family farms</Text> and eliminates 1.2kg of single-use plastic waste.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Sticky Checkout Bar */}
            <View style={styles.stickyFooter}>
                <View>
                    <Text style={styles.toPayLabel}>TO PAY</Text>
                    <Text style={styles.toPayAmount}>${finalTotal}</Text>
                </View>

                <TouchableOpacity
                    style={[styles.checkoutBtn, checkoutMutation.isPending && { opacity: 0.7 }]}
                    onPress={() => checkoutMutation.mutate()}
                    disabled={checkoutMutation.isPending}
                >
                    {checkoutMutation.isPending ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
                            <Feather name="arrow-right" size={16} color="#fff" style={{ marginLeft: 6 }} />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f6f9f7' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 100 },

    /* Same Day Harvest Banner */
    harvestBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e2f0e8', borderRadius: 14, padding: 12, marginBottom: 14 },
    harvestLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    harvestIconCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#0a5d2c', justifyContent: 'center', alignItems: 'center' },
    harvestTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    harvestTitle: { fontSize: 13, fontWeight: 'bold', color: '#0a5d2c' },
    freshTag: { backgroundColor: '#14532d', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
    freshTagText: { fontSize: 8, color: '#a7f3d0', fontWeight: 'bold' },
    harvestTimeText: { fontSize: 10, color: '#555', marginTop: 1 },
    boldTimer: { fontWeight: 'bold', color: '#b45309' },

    /* Header */
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a231e' },
    headerSubtitle: { fontSize: 12, fontWeight: 'normal', color: '#666' },
    clearAllText: { fontSize: 12, color: '#666' },

    /* Destination Card */
    destinationCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#eef6f1', borderRadius: 12, padding: 10, marginBottom: 16 },
    destinationLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    locationPinBg: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
    destinationLabel: { fontSize: 8, fontWeight: 'bold', color: '#0a5d2c', letterSpacing: 0.5 },
    destinationAddress: { fontSize: 12, fontWeight: '600', color: '#1a231e' },
    changeBtn: { backgroundColor: '#dcfce7', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    changeBtnText: { fontSize: 10, fontWeight: 'bold', color: '#0a5d2c' },

    /* Cart Item Card */
    itemsListContainer: { gap: 12, marginBottom: 16 },
    itemCard: { backgroundColor: '#fff', borderRadius: 14, padding: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 },
    itemMainRow: { flexDirection: 'row', gap: 10 },
    imageWrapper: { position: 'relative', width: 75, height: 75, borderRadius: 10, overflow: 'hidden' },
    itemImage: { width: '100%', height: '100%' },
    itemTagBadge: { position: 'absolute', top: 4, left: 4, backgroundColor: '#ffffffd9', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
    itemTagText: { fontSize: 8, fontWeight: 'bold', color: '#0a5d2c' },
    itemInfo: { flex: 1 },
    itemCategory: { fontSize: 8, fontWeight: 'bold', color: '#0a5d2c', letterSpacing: 0.5 },
    itemName: { fontSize: 13, fontWeight: 'bold', color: '#1a231e', marginTop: 1 },
    itemWeight: { fontSize: 10, color: '#777', marginTop: 1 },
    priceStepperRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
    itemPrice: { fontSize: 15, fontWeight: 'bold', color: '#0a5d2c' },
    strikePrice: { fontSize: 10, color: '#aaa', textDecorationLine: 'line-through' },
    stepperContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', borderRadius: 16, padding: 2, gap: 8 },
    stepperBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
    stepperBtnActive: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#0a5d2c', justifyContent: 'center', alignItems: 'center' },
    stepperQty: { fontSize: 12, fontWeight: 'bold', color: '#1a231e' },
    itemNoteRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
    itemNoteText: { fontSize: 9, color: '#666' },

    /* Recommendations */
    recommendSection: { marginBottom: 16 },
    recommendHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    recommendTitle: { fontSize: 13, fontWeight: 'bold', color: '#1a231e' },
    recommendSubtitle: { fontSize: 10, color: '#777' },
    picksBadge: { backgroundColor: '#e2f1e8', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    picksText: { fontSize: 9, fontWeight: 'bold', color: '#0a5d2c' },
    recommendList: { gap: 10 },
    recommendCard: { width: 140, backgroundColor: '#fff', borderRadius: 12, padding: 8, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 },
    recImageWrapper: { position: 'relative', width: '100%', height: 90, borderRadius: 8, overflow: 'hidden', marginBottom: 6 },
    recImage: { width: '100%', height: '100%' },
    recBadge: { position: 'absolute', top: 4, left: 4, backgroundColor: '#ffffffd9', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 },
    recBadgeText: { fontSize: 7, fontWeight: 'bold', color: '#0a5d2c' },
    recName: { fontSize: 11, fontWeight: 'bold', color: '#1a231e', height: 28 },
    recFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
    recPrice: { fontSize: 12, fontWeight: 'bold', color: '#1a231e' },
    recAddBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#0a5d2c', justifyContent: 'center', alignItems: 'center' },

    /* Substitutions Card */
    substitutionsCard: { backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 14, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 },
    toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    globeIconBg: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#eef6f1', justifyContent: 'center', alignItems: 'center' },
    toggleTitle: { fontSize: 12, fontWeight: 'bold', color: '#1a231e' },
    toggleSubtitle: { fontSize: 9, color: '#777' },
    myceliumRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
    myceliumText: { fontSize: 9, color: '#0a5d2c' },

    /* Voucher Card */
    voucherCard: { backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 14, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 },
    voucherHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
    voucherTitle: { fontSize: 12, fontWeight: 'bold', color: '#1a231e' },
    voucherInputRow: { flexDirection: 'row', gap: 8 },
    voucherInputBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8faf9', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 10, height: 36 },
    voucherInput: { flex: 1, fontSize: 11, fontWeight: 'bold', color: '#1a231e' },
    applyBtn: { backgroundColor: '#0a5d2c', paddingHorizontal: 14, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    appliedBtn: { backgroundColor: '#064e23' },
    applyBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    couponSuccessRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
    couponSuccessText: { fontSize: 9, color: '#0a5d2c', fontWeight: '500' },

    /* Order Summary */
    summaryCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 14, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 },
    summaryTitle: { fontSize: 13, fontWeight: 'bold', color: '#1a231e', marginBottom: 10 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    summaryLabel: { fontSize: 11, color: '#666' },
    summaryValue: { fontSize: 11, fontWeight: '600', color: '#1a231e' },
    promoPill: { backgroundColor: '#dcfce7', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 },
    promoPillText: { fontSize: 7, fontWeight: 'bold', color: '#0a5d2c' },
    strikeText: { textDecorationLine: 'line-through', color: '#aaa' },
    freeText: { color: '#0a5d2c', fontWeight: 'bold' },
    summaryDivider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 10 },
    finalTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    finalTotalLabel: { fontSize: 13, fontWeight: 'bold', color: '#1a231e' },
    savedSubtext: { fontSize: 9, color: '#0a5d2c', marginTop: 1 },
    finalTotalPrice: { fontSize: 18, fontWeight: 'bold', color: '#0a5d2c' },
    impactBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e2f0e8', padding: 8, borderRadius: 8, marginTop: 10, gap: 8 },
    impactIconBg: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
    impactText: { flex: 1, fontSize: 9, color: '#0a5d2c', lineHeight: 12 },

    /* Sticky Bottom Footer */
    stickyFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justify: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#eef2f0',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    toPayLabel: { fontSize: 8, color: '#888', fontWeight: 'bold', letterSpacing: 0.5 },
    toPayAmount: { fontSize: 18, fontWeight: 'bold', color: '#0a5d2c' },
    checkoutBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0a5d2c', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24 },
    checkoutBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
});