import React, { useContext } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Image,
    Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Feather, Ionicons } from '@expo/vector-icons';
import { getWishlistApi, removeFromWishlistApi, addToCartApi } from '../../api/endpoints';
import { AuthContext } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function WishlistScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const queryClient = useQueryClient();

    // Fetch Wishlist Data
    const { data: wishlist, isLoading } = useQuery({
        queryKey: ['wishlist', user?.id],
        queryFn: async () => (await getWishlistApi(user.id)).data,
        enabled: !!user?.id,
    });

    // Remove Mutation
    const removeMutation = useMutation({
        mutationFn: (productId) => removeFromWishlistApi({ customerId: user.id, productId }),
        onSuccess: () => queryClient.invalidateQueries(['wishlist', user?.id]),
        onError: (err) => Alert.alert('Error', err?.response?.data?.message || 'Could not remove item'),
    });

    // Move Single Item to Cart
    const handleMoveToCart = async (item) => {
        try {
            await addToCartApi({ customerId: user.id, productId: item.productId, quantity: 1 });
            removeMutation.mutate(item.productId);
            Alert.alert('Success', `${item.productName || 'Item'} moved to cart`);
        } catch (error) {
            Alert.alert('Error', error?.response?.data?.message || 'Failed to move to cart');
        }
    };

    // Move All Items to Cart
    const handleMoveAllToCart = async () => {
        if (!wishlist || wishlist.length === 0) return;
        try {
            for (const item of wishlist) {
                await addToCartApi({ customerId: user.id, productId: item.productId, quantity: 1 });
                await removeFromWishlistApi({ customerId: user.id, productId: item.productId });
            }
            queryClient.invalidateQueries(['wishlist', user?.id]);
            Alert.alert('Success', 'All items moved to cart');
        } catch (error) {
            Alert.alert('Error', 'Failed to move all items to cart');
        }
    };

    // Calculate Subtotal safely
    const subtotal = wishlist?.reduce((acc, curr) => acc + (parseFloat(curr.productPrice || curr.price || 0)), 0) || 0;

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* Main Title Row */}
            <View style={styles.titleRow}>
                <View style={styles.titleWithBadge}>
                    <Text style={styles.screenTitle}>Saved for Later</Text>
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>{wishlist?.length || 0} items</Text>
                    </View>
                </View>

                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.shareBtn}>
                        <Feather name="share-2" size={16} color="#444" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Alert.alert('Clear All', 'Functionality to clear all items')}>
                        <Text style={styles.clearAllText}>Clear All</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Free Delivery Status Banner */}
            <View style={styles.deliveryBanner}>
                <View style={styles.deliveryIconBg}>
                    <Feather name="truck" size={16} color="#0a5d2c" />
                </View>
                <View style={styles.deliveryTextContainer}>
                    <Text style={styles.deliveryTitle}>
                        <Text style={styles.deliveryBold}>FREE HARVEST DELIVERY</Text> • $5.30 away
                    </Text>
                    <Text style={styles.deliverySubtitle}>Add items totaling $35.00 for zero-deli...</Text>
                </View>
                <Feather name="chevron-right" size={18} color="#0a5d2c" />
            </View>
        </View>
    );

    const renderFooter = () => {
        if (!wishlist || wishlist.length === 0) return null;

        return (
            <View style={styles.footerContainer}>
                <View style={styles.subtotalRow}>
                    <View>
                        <Text style={styles.subtotalLabel}>SUBTOTAL FOR WISHLIST</Text>
                        <Text style={styles.subtotalPrice}>${subtotal.toFixed(2)}</Text>
                    </View>

                    <View style={styles.guaranteeBadge}>
                        <Ionicons name="checkmark-circle-outline" size={14} color="#0a5d2c" />
                        <Text style={styles.guaranteeText}>Best Price Guarantee</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.moveAllBtn} onPress={handleMoveAllToCart}>
                    <Feather name="shopping-bag" size={18} color="#fff" />
                    <Text style={styles.moveAllBtnText}>Move All ({wishlist.length} Items) to Cart</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderWishlistItem = ({ item }) => {
        const imageUrl = item?.imageUrl || item?.imageUrls?.[0];

        return (
            <View style={styles.card}>
                {/* Product Image Box */}
                <View style={styles.imageWrapper}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.productImage} resizeMode="cover" />
                    ) : (
                        <View style={[styles.productImage, styles.placeholder]}>
                            <Ionicons name="image-outline" size={24} color="#aaa" />
                        </View>
                    )}

                    {/* Tag Badge on Image */}
                    <View style={styles.imageTagBadge}>
                        <Text style={styles.imageTagText}>{item.tag || 'ORGANIC'}</Text>
                    </View>
                </View>

                {/* Details Section */}
                <View style={styles.detailsWrapper}>
                    {/* Category & Trash Icon Row */}
                    <View style={styles.cardTopRow}>
                        <Text style={styles.categoryTag}>
                            {(item.categoryName || 'PANTRY STAPLES').toUpperCase()}
                        </Text>
                        <TouchableOpacity
                            onPress={() => removeMutation.mutate(item.productId)}
                            disabled={removeMutation.isLoading}
                        >
                            <Feather name="trash-2" size={16} color="#888" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.productName} numberOfLines={1}>
                        {item.productName || item.name}
                    </Text>

                    <Text style={styles.productWeight}>
                        {item.weight || '1.5 kg'} • {item.subtitle || 'Sun-Dried Stone Mill'}
                    </Text>

                    <View style={styles.stockRow}>
                        <View style={styles.greenDot} />
                        <Text style={styles.stockText}>{item.stockStatus || 'In Stock • Ships today'}</Text>
                    </View>

                    {/* Price and Action Button Row */}
                    <View style={styles.cardBottomRow}>
                        <View style={styles.priceContainer}>
                            <Text style={styles.price}>${item.productPrice || item.price || '8.50'}</Text>
                            <Text style={styles.unitPrice}>($5.67/kg)</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.moveCartBtn}
                            onPress={() => handleMoveToCart(item)}
                        >
                            <Feather name="shopping-cart" size={14} color="#fff" />
                            <Text style={styles.moveCartBtnText}>Move to Cart</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    if (isLoading) return <ActivityIndicator style={styles.center} size="large" color="#0a5d2c" />;

    return (
        <SafeAreaView style={styles.safeArea}>
            <FlatList
                data={wishlist}
                keyExtractor={(item) => item.productId.toString()}
                renderItem={renderWishlistItem}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Feather name="heart" size={48} color="#ccc" />
                        <Text style={styles.emptyText}>Your wishlist is empty</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f6f9f7' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { paddingHorizontal: 16, paddingBottom: 30 },

    /* Header */
    headerContainer: { paddingTop: 16, marginBottom: 16 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    titleWithBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    screenTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a231e' },
    countBadge: { backgroundColor: '#e2f1e8', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
    countText: { fontSize: 11, fontWeight: 'bold', color: '#0a5d2c' },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    shareBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#eef3f0', justifyContent: 'center', alignItems: 'center' },
    clearAllText: { fontSize: 12, color: '#555', fontWeight: '500' },

    /* Delivery Status Banner */
    deliveryBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ebf6f0',
        borderRadius: 14,
        padding: 12,
        gap: 10,
    },
    deliveryIconBg: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
    deliveryTextContainer: { flex: 1 },
    deliveryTitle: { fontSize: 11, color: '#222' },
    deliveryBold: { color: '#0a5d2c', fontWeight: 'bold' },
    deliverySubtitle: { fontSize: 10, color: '#666', marginTop: 1 },

    /* Wishlist Item Card */
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        marginBottom: 14,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
    },
    imageWrapper: { position: 'relative', width: 90, height: 90, borderRadius: 12, overflow: 'hidden' },
    productImage: { width: '100%', height: '100%' },
    placeholder: { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
    imageTagBadge: {
        position: 'absolute',
        top: 6,
        left: 6,
        backgroundColor: '#ffffffd9',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    imageTagText: { fontSize: 8, fontWeight: 'bold', color: '#0a5d2c' },

    detailsWrapper: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
    cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    categoryTag: { fontSize: 9, fontWeight: 'bold', color: '#0a5d2c', letterSpacing: 0.5 },
    productName: { fontSize: 14, fontWeight: 'bold', color: '#1a231e', marginTop: 2 },
    productWeight: { fontSize: 11, color: '#777', marginTop: 1 },
    stockRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    greenDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#22c55e' },
    stockText: { fontSize: 10, color: '#0a5d2c', fontWeight: '500' },

    cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    priceContainer: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
    price: { fontSize: 16, fontWeight: 'bold', color: '#1a231e' },
    unitPrice: { fontSize: 10, color: '#888' },
    moveCartBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0a5d2c',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    moveCartBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

    /* Footer / Subtotal Card */
    footerContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginTop: 10,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
    },
    subtotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    subtotalLabel: { fontSize: 9, fontWeight: 'bold', color: '#888', letterSpacing: 0.5 },
    subtotalPrice: { fontSize: 20, fontWeight: 'bold', color: '#0a5d2c', marginTop: 2 },
    guaranteeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    guaranteeText: { fontSize: 10, fontWeight: '600', color: '#1a231e' },
    moveAllBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a5d2c',
        borderRadius: 22,
        paddingVertical: 12,
        gap: 8,
    },
    moveAllBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },

    emptyContainer: { paddingVertical: 60, alignItems: 'center' },
    emptyText: { color: '#888', marginTop: 10, fontSize: 14 },
});