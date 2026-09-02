import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getActiveProductsApi } from '../../api/endpoints';

export default function ProductListScreen({ navigation }) {
    const { data: products, isLoading, error } = useQuery({
        queryKey: ['activeProducts'],
        queryFn: async () => {
            const res = await getActiveProductsApi();
            return res.data;
        },
    });

    if (isLoading) return <ActivityIndicator style={styles.center} size="large" />;
    if (error) return <Text style={styles.center}>Error loading products: {error.message}</Text>;

    const renderProductCard = ({ item }) => {
        // Extract first HTTP URL from imageUrls array or fall back to first index
        const imageUrl = item?.imageUrls?.find(url => url.startsWith('http')) || item?.imageUrls?.[0];

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('ProductDetail', { name: item.name })}
                activeOpacity={0.8}
            >
                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
                ) : (
                    <View style={[styles.image, styles.placeholder]}>
                        <Text style={styles.placeholderText}>No Image</Text>
                    </View>
                )}

                <View style={styles.infoContainer}>
                    <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
                    {item.categoryName && <Text style={styles.category}>{item.categoryName}</Text>}
                    <Text style={styles.price}>${item.price}</Text>
                    {item.description && (
                        <Text style={styles.description} numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                renderItem={renderProductCard}
                numColumns={2}
                columnWrapperStyle={styles.row}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 8, backgroundColor: '#f5f5f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    row: { justifyContent: 'space-between' },
    card: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        overflow: 'hidden',
    },
    image: { width: '100%', height: 130 },
    placeholder: { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
    placeholderText: { color: '#888', fontSize: 12 },
    infoContainer: { padding: 10 },
    title: { fontSize: 14, fontWeight: 'bold', textTransform: 'capitalize' },
    category: { fontSize: 11, color: '#888', marginVertical: 2 },
    price: { fontSize: 14, color: 'green', fontWeight: 'bold', marginVertical: 4 },
    description: { fontSize: 12, color: '#666' },
});