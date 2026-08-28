import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { verifyEmailApi } from '../../api/endpoints';

export default function VerifyEmailScreen({ route, navigation }) {
    const [code, setCode] = useState('');
    const [email] = useState(route.params?.email || '');

    const handleVerify = async () => {
        try {
            await verifyEmailApi({ email, code });
            Alert.alert('Success', 'Email verified successfully!');
            navigation.navigate('Login');
        } catch (err) {
            Alert.alert('Verification Failed', err.response?.data?.message || 'Invalid code');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Verify Email</Text>
            <Text style={styles.subtitle}>Enter the code sent to {email}</Text>
            <TextInput style={styles.input} placeholder="Verification Code" value={code} onChangeText={setCode} />
            <Button title="Verify" onPress={handleVerify} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
    subtitle: { textAlign: 'center', marginVertical: 10, color: '#666' },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 }
});