import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
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
    if (error) return <Text style={styles.center}>Error loading products.</Text>;

    return (
        <View style={styles.container}>
            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('ProductDetail', { name: item.name })}
                    >
                        <Text style={styles.title}>{item.name}</Text>
                        <Text style={styles.price}>${item.price}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: { padding: 16, backgroundColor: '#fff', borderRadius: 8, marginBottom: 12, elevation: 2 },
    title: { fontSize: 18, fontWeight: 'bold' },
    price: { color: '#888', marginTop: 4 },
});