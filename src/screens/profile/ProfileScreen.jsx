import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { logoutApi } from '../../api/endpoints';

export default function ProfileScreen() {
    const { user, logout } = useContext(AuthContext);

    const handleLogout = async () => {
        try {
            if (user?.email) await logoutApi(user.email);
        } catch (e) {
            console.error(e);
        } finally {
            await logout();
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>User Profile</Text>
            <Text style={styles.detail}>Nickname: {user?.nickName}</Text>
            <Text style={styles.detail}>Email: {user?.email}</Text>
            <Text style={styles.detail}>Role: {user?.role}</Text>

            <View style={styles.btn}>
                <Button title="Logout" color="red" onPress={handleLogout} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    detail: { fontSize: 16, marginBottom: 8 },
    btn: { marginTop: 30 }
});