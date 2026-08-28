import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert, TextInput, ScrollView } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProductDetailApi, addToCartApi, addToWishlistApi, createReviewApi } from '../../api/endpoints';
import { AuthContext } from '../../context/AuthContext';

export default function ProductDetailScreen({ route }) {
    const { name } = route.params;
    const { user } = useContext(AuthContext);
    const queryClient = useQueryClient();

    const [rating, setRating] = useState('5');
    const [comment, setComment] = useState('');

    const { data: product, isLoading } = useQuery({
        queryKey: ['product', name],
        queryFn: async () => (await getProductDetailApi(name)).data,
    });

    const cartMutation = useMutation({
        mutationFn: () => addToCartApi({ customerId: user.id, productId: product.id, quantity: 1 }),
        onSuccess: () => {
            Alert.alert('Success', 'Added to cart');
            queryClient.invalidateQueries(['cart', user?.id]);
        },
    });

    const wishlistMutation = useMutation({
        mutationFn: () => addToWishlistApi({ customerId: user.id, productId: product.id }),
        onSuccess: () => Alert.alert('Success', 'Added to wishlist'),
    });

    const reviewMutation = useMutation({
        mutationFn: () => createReviewApi({ productId: product.id, rating: parseInt(rating), comment }),
        onSuccess: () => {
            Alert.alert('Success', 'Review submitted');
            setComment('');
        },
        onError: (err) => Alert.alert('Error', err.response?.data?.message || 'Review failed. Ensure you bought this item.'),
    });

    if (isLoading) return <ActivityIndicator style={styles.center} size="large" />;

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{product?.name}</Text>
            <Text style={styles.price}>${product?.price}</Text>
            <Text style={styles.description}>{product?.description}</Text>

            <View style={styles.btnRow}>
                <Button title="Add to Cart" onPress={() => cartMutation.mutate()} />
                <Button title="Add to Wishlist" onPress={() => wishlistMutation.mutate()} color="#ff5722" />
            </View>

            <View style={styles.reviewSection}>
                <Text style={styles.sectionHeader}>Write a Review</Text>
                <TextInput style={styles.input} placeholder="Rating (1-5)" keyboardType="numeric" value={rating} onChangeText={setRating} />
                <TextInput style={styles.input} placeholder="Comment" multiline value={comment} onChangeText={setComment} />
                <Button title="Submit Review" onPress={() => reviewMutation.mutate()} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold' },
    price: { fontSize: 20, color: 'green', marginVertical: 8 },
    description: { fontSize: 16, color: '#555', marginBottom: 16 },
    btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    reviewSection: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 16 },
    sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
});