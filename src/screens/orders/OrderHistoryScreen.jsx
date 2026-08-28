import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getCustomerOrdersApi } from '../../api/endpoints';
import { AuthContext } from '../../context/AuthContext';

export default function OrderHistoryScreen() {
    const { user } = useContext(AuthContext);

    const { data: orders, isLoading } = useQuery({
        queryKey: ['orders', user?.id],
        queryFn: async () => (await getCustomerOrdersApi(user.id)).data,
        enabled: !!user?.id,
    });

    if (isLoading) return <ActivityIndicator style={styles.center} size="large" />;

    return (
        <View style={styles.container}>
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.orderId}>Order ID: {item.id}</Text>
                        <Text>Status: {item.status}</Text>
                        <Text>Total: ${item.totalAmount}</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: { padding: 16, backgroundColor: '#fff', borderRadius: 8, marginBottom: 12, elevation: 1 },
    orderId: { fontWeight: 'bold', marginBottom: 4 },
});