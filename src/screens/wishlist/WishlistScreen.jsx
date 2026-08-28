import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWishlistApi, removeFromWishlistApi } from '../../api/endpoints';
import { AuthContext } from '../../context/AuthContext';

export default function WishlistScreen() {
    const { user } = useContext(AuthContext);
    const queryClient = useQueryClient();

    const { data: wishlist, isLoading } = useQuery({
        queryKey: ['wishlist', user?.id],
        queryFn: async () => (await getWishlistApi(user.id)).data,
        enabled: !!user?.id,
    });

    const removeMutation = useMutation({
        mutationFn: (productId) => removeFromWishlistApi({ customerId: user.id, productId }),
        onSuccess: () => queryClient.invalidateQueries(['wishlist', user?.id]),
    });

    if (isLoading) return <ActivityIndicator style={styles.center} size="large" />;

    return (
        <View style={styles.container}>
            <FlatList
                data={wishlist}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <Text style={styles.name}>{item.productName}</Text>
                        <Button title="Remove" color="red" onPress={() => removeMutation.mutate(item.productId)} />
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    row: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
    name: { fontSize: 16 },
});