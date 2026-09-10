import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView,
    Image,
    TouchableOpacity,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons, Feather } from '@expo/vector-icons';
import { getProductDetailApi, addToCartApi, addToWishlistApi } from '../../api/endpoints';
import { AuthContext } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProductDetailScreen({ route, navigation }) {
    const { name } = route.params;
    const { user } = useContext(AuthContext);
    const queryClient = useQueryClient();

    // UI & Stepper States
    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const { data: product, isLoading } = useQuery({
        queryKey: ['product', name],
        queryFn: async () => (await getProductDetailApi(name)).data,
    });

    // Add to Cart with Dynamic Quantity
    const handleCart = async () => {
        try {
            setLoading(true);
            await addToCartApi({ customerId: user?.id, productId: product?.id, quantity });
            Alert.alert("Success", `Added ${quantity} item(s) to your cart`);
            queryClient.invalidateQueries(['cart', user?.id]);
        } catch (error) {
            Alert.alert("An error occurred", error.message || "Failed to add to cart");
        } finally {
            setLoading(false);
        }
    };

    // Wishlist Mutation
    const wishlistMutation = useMutation({
        mutationFn: () => addToWishlistApi({ customerId: user?.id, productId: product?.id }),
        onSuccess: () => Alert.alert('Success', 'Added to wishlist'),
        onError: (err) => Alert.alert('Error', err.response?.data?.message || 'Failed to add to wishlist'),
    });

    if (isLoading) return <ActivityIndicator style={styles.center} size="large" color="#0a5d2c" />;

    const imageUrl = product?.imageUrls?.find(url => url.startsWith('http')) || product?.imageUrls?.[0];
    const unitPrice = parseFloat(product?.price || 0);

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header Navigation */}
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Feather name="arrow-left" size={20} color="#1a231e" />
                </TouchableOpacity>

                <View style={styles.headerTitleContainer}>
                    <View style={styles.logoBadge}>
                        <Ionicons name="leaf" size={12} color="#fff" />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Product Detail</Text>
                        <Text style={styles.headerSubtitle}>Harvestly Fresh Market</Text>
                    </View>
                </View>

                <View style={styles.headerRightBtns}>
                    <TouchableOpacity style={styles.headerBtn}>
                        <Feather name="share-2" size={18} color="#1a231e" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.avatarBtn}>
                        <Ionicons name="person" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Product Image Section */}
                <View style={styles.imageContainer}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.productImage} resizeMode="cover" />
                    ) : (
                        <View style={[styles.productImage, styles.placeholder]}>
                            <Text style={styles.placeholderText}>No Image Available</Text>
                        </View>
                    )}

                    {/* Image Overlay Badges */}
                    <View style={styles.organicBadge}>
                        <Ionicons name="leaf" size={12} color="#0a5d2c" />
                        <Text style={styles.organicText}>CERTIFIED ORGANIC</Text>
                    </View>

                    <View style={styles.ripenessBadge}>
                        <View style={styles.greenDot} />
                        <Text style={styles.ripenessText}>Peak Ripeness</Text>
                    </View>

                    {/* Gallery Indicators */}
                    <View style={styles.paginationDots}>
                        <View style={[styles.dot, styles.activeDot]} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                    </View>
                </View>

                {/* Details Section */}
                <View style={styles.detailsContainer}>
                    {/* Category & Rating Row */}
                    <View style={styles.metaRow}>
                        <Text style={styles.categoryTag}>
                            {product?.categoryName ? product.categoryName.toUpperCase() : 'FRESH VEGETABLES & PRODUCE'}
                        </Text>
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={12} color="#f59e0b" />
                            <Text style={styles.ratingScore}>4.9</Text>
                            <Text style={styles.ratingCount}>(342)</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>{product?.name}</Text>

                    <View style={styles.originRow}>
                        <Ionicons name="location-outline" size={14} color="#0a5d2c" />
                        <Text style={styles.originText}>Grown by <Text style={{ fontWeight: '600' }}>Coastal Sunrise Farms, CA</Text></Text>
                    </View>

                    {/* Price and Stepper Row */}
                    <View style={styles.priceCard}>
                        <View style={styles.priceLeft}>
                            <Text style={styles.price}>${product?.price}</Text>
                            <Text style={styles.oldPrice}>$4.29</Text>
                            <View style={styles.saveBadge}>
                                <Text style={styles.saveText}>SAVE 19%</Text>
                            </View>
                        </View>

                        {/* Quantity Stepper */}
                        <View style={styles.stepperContainer}>
                            <TouchableOpacity
                                style={styles.stepperBtn}
                                onPress={() => setQuantity(prev => Math.max(1, prev - 1))}
                            >
                                <Feather name="minus" size={16} color="#333" />
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{quantity}</Text>
                            <TouchableOpacity
                                style={[styles.stepperBtn, styles.stepperPlusBtn]}
                                onPress={() => setQuantity(prev => prev + 1)}
                            >
                                <Feather name="plus" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Nutritional Highlights */}
                    <View style={styles.nutritionHeader}>
                        <Text style={styles.sectionTitle}>NUTRITIONAL HIGHLIGHTS</Text>
                        <Text style={styles.perServing}>Per 1/2 avocado (80g)</Text>
                    </View>

                    <View style={styles.nutritionGrid}>
                        <View style={styles.nutritionCard}>
                            <Text style={styles.nutritionVal}>160</Text>
                            <Text style={styles.nutritionLabel}>Calories</Text>
                        </View>
                        <View style={styles.nutritionCard}>
                            <Text style={styles.nutritionVal}>15g</Text>
                            <Text style={styles.nutritionLabel}>Good Fats</Text>
                        </View>
                        <View style={styles.nutritionCard}>
                            <Text style={styles.nutritionVal}>7g</Text>
                            <Text style={styles.nutritionLabel}>Fiber</Text>
                        </View>
                        <View style={styles.nutritionCard}>
                            <Text style={styles.nutritionVal}>0g</Text>
                            <Text style={styles.nutritionLabel}>Sugar</Text>
                        </View>
                    </View>

                    {/* About Section */}
                    <Text style={styles.sectionTitle}>ABOUT THIS HARVEST</Text>
                    <Text style={styles.description}>
                        {product?.description || 'Creamy, rich Hass avocados carefully hand-picked at peak ripeness. Naturally loaded with heart-healthy monounsaturated fats.'}
                    </Text>
                </View>
            </ScrollView>

            {/* Bottom Floating Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.wishlistBtn}
                    onPress={() => wishlistMutation.mutate()}
                    disabled={wishlistMutation.isLoading}
                >
                    {wishlistMutation.isLoading ? (
                        <ActivityIndicator size="small" color="#0a5d2c" />
                    ) : (
                        <Feather name="heart" size={20} color="#1a231e" />
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.addToCartBtn}
                    onPress={handleCart}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <View style={styles.cartBtnLeft}>
                                <Feather name="shopping-bag" size={18} color="#fff" />
                                <Text style={styles.addToCartText}>ADD TO CART</Text>
                            </View>
                            <Text style={styles.cartPriceText}>
                                ${(unitPrice * quantity).toFixed(2)}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#ffffff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingBottom: 100 },

    /* Header Bar */
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerBtn: { padding: 6, borderRadius: 20, backgroundColor: '#f5f7f5' },
    headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    logoBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#0a5d2c', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 14, fontWeight: 'bold', color: '#1a231e' },
    headerSubtitle: { fontSize: 10, color: '#777' },
    headerRightBtns: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    avatarBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#0a5d2c', justifyContent: 'center', alignItems: 'center' },

    /* Image & Overlay Badges */
    imageContainer: { position: 'relative', width: '100%', height: 280, backgroundColor: '#f6f9f7' },
    productImage: { width: '100%', height: '100%' },
    placeholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#e8ece9' },
    placeholderText: { color: '#888', fontSize: 12 },
    organicBadge: {
        position: 'absolute',
        top: 14,
        left: 14,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffffd9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 14,
        gap: 4,
    },
    organicText: { fontSize: 9, fontWeight: 'bold', color: '#0a5d2c' },
    ripenessBadge: {
        position: 'absolute',
        top: 14,
        right: 14,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffffd9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 14,
        gap: 4,
    },
    greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' },
    ripenessText: { fontSize: 9, fontWeight: 'bold', color: '#333' },
    paginationDots: { position: 'absolute', bottom: 12, width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 6 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ffffff80' },
    activeDot: { width: 18, backgroundColor: '#0a5d2c' },

    /* Details */
    detailsContainer: { padding: 18 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    categoryTag: { fontSize: 11, fontWeight: 'bold', color: '#0a5d2c', letterSpacing: 0.5 },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6f1', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, gap: 3 },
    ratingScore: { fontSize: 11, fontWeight: 'bold', color: '#1a231e' },
    ratingCount: { fontSize: 10, color: '#777' },
    title: { fontSize: 20, fontWeight: 'bold', color: '#1a231e', marginBottom: 6 },
    originRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
    originText: { fontSize: 12, color: '#555' },

    /* Price Card */
    priceCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f4f8f5',
        borderRadius: 16,
        padding: 14,
        marginBottom: 20,
    },
    priceLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    price: { fontSize: 22, fontWeight: 'bold', color: '#0a5d2c' },
    oldPrice: { fontSize: 13, color: '#999', textDecorationLine: 'line-through' },
    saveBadge: { backgroundColor: '#fce7f3', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
    saveText: { fontSize: 9, fontWeight: 'bold', color: '#be185d' },

    /* Stepper */
    stepperContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 4, gap: 10 },
    stepperBtn: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    stepperPlusBtn: { backgroundColor: '#0a5d2c' },
    quantityText: { fontSize: 14, fontWeight: 'bold', color: '#1a231e' },

    /* Nutrition Grid */
    nutritionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#1a231e', letterSpacing: 0.5, marginTop: 10, marginBottom: 8 },
    perServing: { fontSize: 10, color: '#777' },
    nutritionGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 18 },
    nutritionCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: 'center',
    },
    nutritionVal: { fontSize: 15, fontWeight: 'bold', color: '#0a5d2c' },
    nutritionLabel: { fontSize: 10, color: '#777', marginTop: 2 },

    description: { fontSize: 13, color: '#555', lineHeight: 18, marginBottom: 20 },

    /* Bottom Sticky Bar */
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        gap: 12,
    },
    wishlistBtn: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#f4f8f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addToCartBtn: {
        flex: 1,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#0a5d2c',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 18,
    },
    cartBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    addToCartText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
    cartPriceText: { color: '#a3f3c1', fontSize: 14, fontWeight: 'bold' },
});