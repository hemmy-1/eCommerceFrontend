import React, { useContext, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Image,
    TextInput,
    ScrollView,
    RefreshControl,
    Alert,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { addToCartApi, getActiveProductsApi } from '../../api/endpoints';
import { AuthContext } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function ProductListScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const queryClient = useQueryClient();
    const [selectedCategory, setSelectedCategory] = useState('All Foods');
    const [searchQuery, setSearchQuery] = useState('');
    const [addingProductId, setAddingProductId] = useState(null);

    const categories = ['All Foods', 'Fresh Fruits', 'Organic Veggies', 'Pantry'];

    const { data: products, isLoading, isRefetching, error, refetch } = useQuery({
        queryKey: ['activeProducts'],
        queryFn: async () => {
            const res = await getActiveProductsApi();
            return res.data;
        },
    });

    const handleAddToCart = async (item) => {
        if (!user?.id) {
            Alert.alert('Sign in required', 'Please sign in before adding items to your cart.');
            return;
        }

        if (!item?.id) {
            Alert.alert('Error', 'This product could not be added to your cart.');
            return;
        }

        try {
            setAddingProductId(item.id);
            await addToCartApi({ customerId: user.id, productId: item.id, quantity: 1 });
            await queryClient.invalidateQueries({ queryKey: ['cart', user.id] });
            Alert.alert('Success', `${item.name || 'Item'} added to your cart`);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to add item to cart');
        } finally {
            setAddingProductId(null);
        }
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* Top Bar Navigation */}
            <View style={styles.topBar}>
                <View style={styles.logoRow}>
                    <View style={styles.logoIcon}>
                        <Ionicons name="leaf" size={16} color="#fff" />
                    </View>
                    <View>
                        <Text style={styles.appName}>
                            Harvestly <Text style={styles.appSub}>• SHOP</Text>
                        </Text>
                        <TouchableOpacity style={styles.locationRow}>
                            <Ionicons name="location-outline" size={12} color="#1b6333" />
                            <Text style={styles.locationText}>Deliver to: 742 Evergreen...</Text>
                            <Feather name="chevron-down" size={12} color="#555" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.topBarIcons}>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Feather name="search" size={18} color="#333" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Feather name="bell" size={18} color="#333" />
                        <View style={styles.notificationDot} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.avatarBtn}>
                        <Ionicons name="person" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Input Bar */}
            <View style={styles.searchBarContainer}>
                <Feather name="search" size={18} color="#888" style={{ marginRight: 8 }} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search fresh fruits, vegetables, dairy..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TouchableOpacity style={styles.filterBtn}>
                    <Ionicons name="options-outline" size={18} color="#0a5d2c" />
                </TouchableOpacity>
            </View>

            {/* Promo Banner */}
            <View style={styles.promoBanner}>
                <View style={styles.promoTextContainer}>
                    <View style={styles.promoBadge}>
                        <Text style={styles.promoBadgeText}>MORNING HARVEST</Text>
                    </View>
                    <Text style={styles.promoTitle}>Up to 25% Off Fresh{'\n'}Greens & Berries</Text>
                    <Text style={styles.promoSubtitle}>Picked within 24 hours from local...</Text>
                    <TouchableOpacity style={styles.shopDealsBtn}>
                        <Text style={styles.shopDealsText}>Shop Deals</Text>
                        <Feather name="arrow-right" size={12} color="#0a5d2c" />
                    </TouchableOpacity>
                </View>
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=300' }}
                    style={styles.promoImage}
                    resizeMode="cover"
                />
            </View>

            {/* Category Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
                {categories.map((cat, index) => {
                    const isSelected = selectedCategory === cat;
                    return (
                        <TouchableOpacity
                            key={index}
                            style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                            onPress={() => setSelectedCategory(cat)}
                        >
                            {cat === 'Fresh Fruits' && <Text style={{ marginRight: 4 }}>🍎</Text>}
                            {cat === 'Organic Veggies' && <Ionicons name="leaf-outline" size={14} color={isSelected ? '#fff' : '#0a5d2c'} style={{ marginRight: 4 }} />}
                            <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Section Header */}
            <View style={styles.sectionHeader}>
                <View>
                    <Text style={styles.sectionTitle}>Featured Pantry & Farm Fresh</Text>
                    <Text style={styles.sectionSubtitle}>Handpicked this morning from certified regional growers</Text>
                </View>
                <Text style={styles.itemCountText}>{products?.length || 0} items</Text>
            </View>
        </View>
    );

    const renderProductCard = ({ item }) => {
        const imageUrl = item?.imageUrls?.find((url) => url.startsWith('http')) || item?.imageUrls?.[0];

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('ProductDetail', { name: item.name })}
                activeOpacity={0.9}
            >
                {/* Product Image & Badges */}
                <View style={styles.imageContainer}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
                    ) : (
                        <View style={[styles.image, styles.placeholder]}>
                            <Text style={styles.placeholderText}>No Image</Text>
                        </View>
                    )}

                    {/* Green Tag Badge */}
                    <View style={styles.tagBadge}>
                        <Text style={styles.tagBadgeText}>Local Farm</Text>
                    </View>

                    {/* Wishlist Button */}
                    <TouchableOpacity style={styles.wishlistBtn}>
                        <Feather name="heart" size={16} color="#444" />
                    </TouchableOpacity>
                </View>

                {/* Product Details */}
                <View style={styles.infoContainer}>
                    <Text style={styles.categoryTag}>
                        {item.categoryName ? item.categoryName.toUpperCase() : 'FRESH FRUITS'}
                    </Text>
                    <Text style={styles.title} numberOfLines={1}>
                        {item.name}
                    </Text>
                    {item.description && (
                        <Text style={styles.description} numberOfLines={1}>
                            {item.description}
                        </Text>
                    )}

                    {/* Price and Add Button Row */}
                    <View style={styles.priceRow}>
                        <View>
                            <View style={styles.priceContainer}>
                                <Text style={styles.price}>${item.price}</Text>
                                <Text style={styles.oldPrice}>$5.99</Text>
                            </View>
                            <Text style={styles.unitText}>$4.99/lb</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.addToCartBtn}
                            onPress={() => handleAddToCart(item)}
                            disabled={addingProductId === item.id}
                        >
                            {addingProductId === item.id ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <AntDesign name="plus" size={24} color="white" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading) return <ActivityIndicator style={styles.center} size="large" color="#0a5d2c" />;
    if (error) return <Text style={styles.center}>Error loading products: {error.message}</Text>;

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={products}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderProductCard}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        colors={['#0a5d2c']}
                        tintColor="#0a5d2c"
                    />
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f6f9f7' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { paddingHorizontal: 16, paddingBottom: 20 },

    /* Header Styles */
    headerContainer: { paddingTop: 10, marginBottom: 10 },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    logoIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#0a5d2c', justifyContent: 'center', alignItems: 'center' },
    appName: { fontSize: 16, fontWeight: 'bold', color: '#0a5d2c' },
    appSub: { fontSize: 10, color: '#666', fontWeight: '400' },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
    locationText: { fontSize: 11, color: '#555', fontWeight: '500' },
    topBarIcons: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    iconBtn: { position: 'relative', padding: 4 },
    notificationDot: { position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: 3, backgroundColor: '#d9534f' },
    avatarBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#0a5d2c', justifyContent: 'center', alignItems: 'center' },

    /* Search Bar */
    searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eef3f0', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 14 },
    searchInput: { flex: 1, fontSize: 13, color: '#333' },
    filterBtn: { paddingLeft: 8 },

    /* Promo Banner */
    promoBanner: { flexDirection: 'row', backgroundColor: '#0a5d2c', borderRadius: 16, padding: 14, overflow: 'hidden', marginBottom: 14 },
    promoTextContainer: { flex: 1 },
    promoBadge: { backgroundColor: '#1d7541', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 6 },
    promoBadgeText: { color: '#a3f3c1', fontSize: 9, fontWeight: 'bold' },
    promoTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
    promoSubtitle: { fontSize: 10, color: '#c2e3ce', marginBottom: 10 },
    shopDealsBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, alignSelf: 'flex-start', gap: 4 },
    shopDealsText: { fontSize: 11, color: '#0a5d2c', fontWeight: 'bold' },
    promoImage: { width: 90, height: 90, borderRadius: 12 },

    /* Category Chips */
    categoriesContainer: { flexDirection: 'row', marginBottom: 16 },
    categoryChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eef3f0', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
    categoryChipActive: { backgroundColor: '#0a5d2c' },
    categoryChipText: { fontSize: 12, color: '#333', fontWeight: '600' },
    categoryChipTextActive: { color: '#fff' },

    /* Section Header */
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1a231e' },
    sectionSubtitle: { fontSize: 11, color: '#666', marginTop: 2 },
    itemCountText: { fontSize: 11, color: '#0a5d2c', fontWeight: 'bold' },

    /* Product Card */
    card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
    imageContainer: { position: 'relative', width: '100%', height: 200 },
    image: { width: '100%', height: '100%' },
    placeholder: { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
    placeholderText: { color: '#888', fontSize: 12 },
    tagBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: '#a3f3c1', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    tagBadgeText: { fontSize: 10, color: '#0a5d2c', fontWeight: 'bold' },
    wishlistBtn: { position: 'absolute', top: 12, right: 12, backgroundColor: '#ffffffd0', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },

    /* Info Section */
    infoContainer: { padding: 14 },
    categoryTag: { fontSize: 10, color: '#0a5d2c', fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 2 },
    title: { fontSize: 16, fontWeight: 'bold', color: '#1a231e', marginBottom: 2 },
    description: { fontSize: 12, color: '#666', marginBottom: 10 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    priceContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    price: { fontSize: 18, fontWeight: 'bold', color: '#1a231e' },
    oldPrice: { fontSize: 12, color: '#999', textDecorationLine: 'line-through' },
    unitText: { fontSize: 10, color: '#777' },
    addToCartBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0a5d2c', justifyContent: 'center', alignItems: 'center' },
});