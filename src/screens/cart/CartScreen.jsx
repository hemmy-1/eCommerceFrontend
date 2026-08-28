import React, { useContext } from 'react';
import { View, Text, FlatList, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../../context/AuthContext';
import { getCartApi, checkoutApi } from '../../api/endpoints';

export default function CartScreen() {
    const { user } = useContext(AuthContext);
    const queryClient = useQueryClient();

    const { data: cart, isLoading } = useQuery({
        queryKey: ['cart', user?.id],
        queryFn: async () => {
            const res = await getCartApi(user.id);
            return res.data;
        },
        enabled: !!user?.id,
    });

    const checkoutMutation = useMutation({
        mutationFn: () => checkoutApi(user.id),
        onSuccess: (res) => {
            Alert.alert('Checkout Complete', `Order created successfully! ID: ${res.data.id}`);
            queryClient.invalidateQueries(['cart', user?.id]);
        },
        onError: (err) => Alert.alert('Error', err.response?.data?.message || 'Checkout failed'),
    });

    if (isLoading) return <ActivityIndicator style={styles.center} size="large" />;

    return (
        <View style={styles.container}>
            <FlatList
                data={cart?.items || []}
                keyExtractor={(item) => item.productId}
                renderItem={({ item }) => (
                    <View style={styles.itemRow}>
                        <Text>{item.productName}</Text>
                        <Text>Qty: {item.quantity}</Text>
                        <Text>${item.price}</Text>
                    </View>
                )}
            />
            <View style={styles.footer}>
                <Text style={styles.total}>Total: ${cart?.totalPrice || 0}</Text>
                <Button
                    title="Proceed to Checkout"
                    onPress={() => checkoutMutation.mutate()}
                    disabled={!cart?.items?.length || checkoutMutation.isPending}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderColor: '#ccc' },
    footer: { marginTop: 'auto', paddingTop: 16 },
    total: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
});