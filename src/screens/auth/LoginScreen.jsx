import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Ionicons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
    // Form & UI States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [keepSignedIn, setKeepSignedIn] = useState(false);
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);

    // Preserved Original Login Logic
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        try {
            setLoading(true);
            
            const response = await login({
                email,
                password,
            });
            
            console.log('Success', response);
        } catch (err) {
            console.log('Login Error Details:', err.response?.data || err.message);

            const errorMessage =
                err.response?.data?.message ||
                err.response?.data ||
                err.message ||
                'Invalid credentials';

            Alert.alert('Login Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.container}>

                {/* Top Badge & Header */}
                <View style={styles.headerSection}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="leaf-outline" size={36} color="#1b6333" />
                        <View style={styles.smallBadge}>
                            <Ionicons name="leaf" size={10} color="#fff" />
                        </View>
                    </View>

                    <View style={styles.taglineBadge}>
                        <Ionicons name="checkmark-circle-outline" size={14} color="#1b6333" />
                        <Text style={styles.taglineText}>FARM-TO-DOOR COMMUNITY</Text>
                    </View>

                    <Text style={styles.headerTitle}>Welcome to Harvestly</Text>
                    <Text style={styles.headerSubtitle}>
                        Fresh organic groceries delivered right to{'\n'}your kitchen
                    </Text>
                </View>

                {/* Main Card Form */}
                <View style={styles.card}>
                    {/* Email Field */}
                    <Text style={styles.label}>Email Address</Text>
                    <View style={styles.inputWrapper}>
                        <Feather name="mail" size={18} color="#777" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="sarah.miller@domain.com"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    {/* Password Header Row */}
                    <View style={styles.passwordRow}>
                        <Text style={styles.label}>Password</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                            <Text style={styles.forgotText}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Password Field */}
                    <View style={styles.inputWrapper}>
                        <Feather name="lock" size={18} color="#777" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••••••"
                            placeholderTextColor="#999"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Feather name={showPassword ? "eye" : "eye-off"} size={18} color="#777" />
                        </TouchableOpacity>
                    </View>

                    {/* Keep Signed In Checkbox */}
                    <TouchableOpacity
                        style={styles.checkboxContainer}
                        onPress={() => setKeepSignedIn(!keepSignedIn)}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={keepSignedIn ? "checkbox" : "square-outline"}
                            size={20}
                            color={keepSignedIn ? "#1b6333" : "#888"}
                        />
                        <Text style={styles.checkboxLabel}>Keep me signed in for 30 days</Text>
                    </TouchableOpacity>

                    {/* Sign In Button */}
                    <TouchableOpacity
                        style={[styles.signInButton, loading && { opacity: 0.7 }]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <View style={styles.btnContent}>
                                <Text style={styles.signInButtonText}>Sign In</Text>
                                <Feather name="arrow-right" size={18} color="#fff" style={{ marginLeft: 6 }} />
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>Or continue with</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Social Logins (UI-only Placeholders) */}
                    <View style={styles.socialRow}>
                        <TouchableOpacity style={styles.socialBtn}>
                            <FontAwesome5 name="google" size={16} color="#ea4335" />
                            <Text style={styles.socialBtnText}>Google</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.socialBtn}>
                            <FontAwesome5 name="apple" size={18} color="#000" />
                            <Text style={styles.socialBtnText}>Apple</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Register Navigation Link */}
                    <View style={styles.footerRow}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.signUpText}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Bottom Trust Badge */}
                <View style={styles.trustBadgeContainer}>
                    <ShieldIcon />
                    <Text style={styles.trustBadgeText}>
                        100% Organic Certified • Same-day Express Delivery
                    </Text>
                </View>

            </View>
        </ScrollView>
    );
}

// Custom Shield Icon Component for bottom badge
const ShieldIcon = () => (
    <View style={styles.shieldIconWrapper}>
        <Ionicons name="shield-checkmark" size={14} color="#fff" />
    </View>
);

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: '#eaf4ee',
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 20,
        alignItems: 'center',
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logoContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        position: 'relative',
    },
    smallBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: '#1b6333',
        borderRadius: 8,
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    taglineBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#d2ecd9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 10,
        gap: 4,
    },
    taglineText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1b6333',
        letterSpacing: 0.5,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1d2a21',
        marginBottom: 6,
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#5b6e62',
        textAlign: 'center',
        lineHeight: 18,
    },
    card: {
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2b362f',
        marginBottom: 6,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f5fb',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 16,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    passwordRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    forgotText: {
        fontSize: 12,
        color: '#1b6333',
        fontWeight: '600',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 8,
    },
    checkboxLabel: {
        fontSize: 12,
        color: '#555',
    },
    signInButton: {
        backgroundColor: '#0a5d2c',
        borderRadius: 24,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    signInButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: 'bold',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e6e8ec',
    },
    dividerText: {
        fontSize: 11,
        color: '#888',
        paddingHorizontal: 8,
    },
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 20,
    },
    socialBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f2f5fb',
        borderRadius: 10,
        paddingVertical: 10,
        gap: 8,
    },
    socialBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 13,
        color: '#666',
    },
    signUpText: {
        fontSize: 13,
        color: '#0a5d2c',
        fontWeight: 'bold',
    },
    trustBadgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f5fb',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        marginTop: 18,
        gap: 8,
        width: '100%',
    },
    shieldIconWrapper: {
        backgroundColor: '#0a5d2c',
        borderRadius: 10,
        padding: 3,
    },
    trustBadgeText: {
        fontSize: 11,
        color: '#4f5e54',
        fontWeight: '500',
    },
});