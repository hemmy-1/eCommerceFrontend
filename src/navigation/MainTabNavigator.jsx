import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProductListScreen from '../screens/products/ProductListScreen';
import ProductDetailScreen from '../screens/products/ProductDetailScreen';
import WishlistScreen from '../screens/wishlist/WishlistScreen';
import CartScreen from '../screens/cart/CartScreen';
import OrderHistoryScreen from '../screens/orders/OrderHistoryScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

// Nested Stack inside the Home Tab to navigate to Product Details
function HomeStackNavigator() {
    return (
        <HomeStack.Navigator>
            <HomeStack.Screen name="ProductList" component={ProductListScreen} options={{ title: 'Products' }} />
            <HomeStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product Details' }} />
        </HomeStack.Navigator>
    );
}

export default function MainTabNavigator() {
    return (
        <Tab.Navigator screenOptions={{ headerShown: true }}>
            <Tab.Screen
                name="HomeTab"
                component={HomeStackNavigator}
                options={{ headerShown: false, title: 'Shop' }}
            />
            <Tab.Screen name="Wishlist" component={WishlistScreen} options={{ title: 'Wishlist' }} />
            <Tab.Screen name="Cart" component={CartScreen} options={{ title: 'My Cart' }} />
            <Tab.Screen name="Orders" component={OrderHistoryScreen} options={{ title: 'My Orders' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
        </Tab.Navigator>
    );
}