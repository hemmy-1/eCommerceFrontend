import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import ProductListScreen from '../screens/products/ProductListScreen';
import ProductDetailScreen from '../screens/products/ProductDetailScreen';
import WishlistScreen from '../screens/wishlist/WishlistScreen';
import CartScreen from '../screens/cart/CartScreen';
import OrderHistoryScreen from '../screens/orders/OrderHistoryScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

function HomeStackNavigator() {
    return (
        <HomeStack.Navigator>
            <HomeStack.Screen name="ProductList" component={ProductListScreen} options={{ title: 'Products' }} />
            <HomeStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product Details' }} />
        </HomeStack.Navigator>
    );
}

export default function MainTabNavigator() {
    // You can dynamically get this count from your cart state/context or React Query
    const cartItemCount = 3;

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: true,
                tabBarActiveTintColor: '#0a5d2c',
                tabBarInactiveTintColor: '#555555',
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarIcon: ({ color, focused, size }) => {
                    let iconName;

                    if (route.name === 'HomeTab') {
                        return <StorefrontIcon focused={focused} color={color} />;
                    } else if (route.name === 'Wishlist') {
                        return <Feather name="heart" size={22} color={color} />;
                    } else if (route.name === 'Cart') {
                        return <Feather name="shopping-cart" size={22} color={color} />;
                    } else if (route.name === 'Orders') {
                        return <MaterialCommunityIcons name="receipt-outline" size={22} color={color} />;
                    } else if (route.name === 'Profile') {
                        return <ProfileIcon focused={focused} color={color} />;
                    }
                },
            })}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeStackNavigator}
                options={{ headerShown: false, title: 'Shop' }}
            />
            <Tab.Screen name="Wishlist" component={WishlistScreen} options={{ title: 'Wishlist' }} />
            <Tab.Screen
                name="Cart"
                component={CartScreen}
                options={{
                    title: 'My Cart',
                    tabBarBadge: cartItemCount > 0 ? cartItemCount : null,
                    tabBarBadgeStyle: styles.badgeStyle,
                }}
            />
            <Tab.Screen name="Orders" component={OrderHistoryScreen} options={{ title: 'My Orders' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
        </Tab.Navigator>
    );
}

// Custom Icon Helpers for unique shapes (Storefront & Active Oval Profile)
const StorefrontIcon = ({ color }) => (
    <MaterialCommunityIcons name="storefront-outline" size={22} color={color} />
);

const ProfileIcon = ({ focused, color }) => {
    if (focused) {
        return (
            <View style={styles.activeProfilePill}>
                <Ionicons name="person-circle-outline" size={24} color="#0a5d2c" />
            </View>
        );
    }
    return <Ionicons name="person-circle-outline" size={22} color={color} />;
};

const styles = StyleSheet.create({
    tabBar: {
        height: 65,
        paddingBottom: 10,
        paddingTop: 8,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    tabBarLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    badgeStyle: {
        backgroundColor: '#0a5d2c',
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 'bold',
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        lineHeight: 18,
    },
    activeProfilePill: {
        backgroundColor: '#e6f0e9',
        borderRadius: 18,
        paddingHorizontal: 12,
        paddingVertical: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
});