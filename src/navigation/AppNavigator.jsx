import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

import AuthStack from './AuthStack';
import MainTabNavigator from './MainTabNavigator';

export default function AppNavigator() {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {user ? <MainTabNavigator /> : <AuthStack />}
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});