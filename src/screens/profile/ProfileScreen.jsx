import React, { useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { logoutApi } from '../../api/endpoints';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

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
        <SafeAreaView style={styles.safeArea}>
            {/* Top Bar Header */}
            <View style={styles.topBar}>
                <View style={styles.logoRow}>
                    <View style={styles.logoBadge}>
                        <Ionicons name="leaf" size={14} color="#fff" />
                    </View>
                    <View>
                        <Text style={styles.appName}>
                            Harvestly <Text style={styles.appSub}>• PROFILE</Text>
                        </Text>
                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={12} color="#0a5d2c" />
                            <Text style={styles.locationText}>Deliver to: 742 Evergr...</Text>
                            <Feather name="chevron-down" size={12} color="#666" />
                        </View>
                    </View>
                </View>

                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Feather name="search" size={18} color="#333" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Feather name="bell" size={18} color="#333" />
                        <View style={styles.notificationDot} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.avatarHeaderBtn}>
                        <Ionicons name="person" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                {/* User Info Card */}
                <View style={styles.profileHeaderCard}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200' }}
                        style={styles.avatar}
                    />
                    <View style={styles.profileInfo}>
                        <View style={styles.nameRow}>
                            <Text style={styles.userName}>{user?.nickName || 'Alex Harvest'}</Text>
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="leaf" size={10} color="#1b6333" />
                                <Text style={styles.verifiedText}>Verified Foodie</Text>
                            </View>
                        </View>
                        <Text style={styles.userHandle}>@{user?.nickName?.toLowerCase() || 'alex_eats_clean'}</Text>
                        <Text style={styles.userEmail}>{user?.email || 'alex.harvest@example.com'}</Text>
                    </View>
                </View>

                {/* Membership Card */}
                <View style={styles.membershipCard}>
                    <View style={styles.membershipLeft}>
                        <View style={styles.badgeIconBg}>
                            <MaterialCommunityIcons name="medal" size={18} color="#d97706" />
                        </View>
                        <View>
                            <Text style={styles.membershipTitle}>Gold Member / Premium Buyer</Text>
                            <Text style={styles.membershipSubtitle}>Free Priority Delivery Enabled</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.perksBtn}>
                        <Text style={styles.perksBtnText}>Perks</Text>
                    </TouchableOpacity>
                </View>

                {/* Metrics Row */}
                <View style={styles.metricsRow}>
                    <View style={styles.metricCard}>
                        <View style={styles.metricIconBg}>
                            <Feather name="shopping-bag" size={16} color="#0a5d2c" />
                        </View>
                        <Text style={styles.metricValue}>28</Text>
                        <Text style={styles.metricLabel}>Orders Completed</Text>
                    </View>

                    <View style={styles.metricCard}>
                        <View style={[styles.metricIconBg, { backgroundColor: '#fce7f3' }]}>
                            <Feather name="heart" size={16} color="#be185d" />
                        </View>
                        <Text style={styles.metricValue}>12</Text>
                        <Text style={styles.metricLabel}>Wishlist Items</Text>
                    </View>

                    <View style={styles.metricCard}>
                        <View style={[styles.metricIconBg, { backgroundColor: '#ecfdf5' }]}>
                            <Feather name="thumbs-up" size={16} color="#047857" />
                        </View>
                        <Text style={styles.metricValue}>$142</Text>
                        <Text style={styles.metricLabel}>Organic Club Saved</Text>
                    </View>
                </View>

                {/* Eco Impact Banner */}
                <View style={styles.ecoBanner}>
                    <View style={styles.ecoHeader}>
                        <View style={styles.ecoTitleRow}>
                            <Ionicons name="shield-checkmark" size={16} color="#4ade80" />
                            <Text style={styles.ecoTitle}>Eco-Harvest Impact</Text>
                        </View>
                        <View style={styles.tierBadge}>
                            <Text style={styles.tierText}>Tier 4 Pioneer</Text>
                        </View>
                    </View>
                    <Text style={styles.ecoSubtitle}>
                        You diverted 18.4 kg of packaging waste through reusable crate pickups this season!
                    </Text>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: '75%' }]} />
                    </View>
                    <View style={styles.ecoFooter}>
                        <Text style={styles.ecoPointsText}>360 / 480 Eco Points</Text>
                        <Text style={styles.ecoGiftText}>Next Gift: Free Honey</Text>
                    </View>
                </View>

                {/* Navigation Menu List */}
                <View style={styles.menuContainer}>
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconBg}>
                            <Ionicons name="location-outline" size={18} color="#0a5d2c" />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuTitle}>Delivery Addresses</Text>
                            <Text style={styles.menuSubtitle}>Home: 742 Evergreen St</Text>
                        </View>
                        <Feather name="chevron-right" size={18} color="#999" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconBg}>
                            <Feather name="credit-card" size={18} color="#0a5d2c" />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuTitle}>Payment Methods</Text>
                            <Text style={styles.menuSubtitle}>Visa ending in 4242</Text>
                        </View>
                        <Feather name="chevron-right" size={18} color="#999" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconBg}>
                            <Ionicons name="nutrition-outline" size={18} color="#0a5d2c" />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuTitle}>Dietary Preferences</Text>
                            <Text style={styles.menuSubtitle}>Organic Only, Gluten-Free</Text>
                        </View>
                        <Feather name="chevron-right" size={18} color="#999" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconBg}>
                            <Feather name="bell" size={18} color="#0a5d2c" />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuTitle}>Notifications & Reminders</Text>
                            <Text style={styles.menuSubtitle}>Fresh arrival alerts, weekly replenishment</Text>
                        </View>
                        <Feather name="chevron-right" size={18} color="#999" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconBg}>
                            <Feather name="help-circle" size={18} color="#0a5d2c" />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuTitle}>Help Center & Support</Text>
                            <Text style={styles.menuSubtitle}>24/7 Farm concierge chat & FAQ</Text>
                        </View>
                        <Feather name="chevron-right" size={18} color="#999" />
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Feather name="log-out" size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.logoutBtnText}>LOGOUT</Text>
                </TouchableOpacity>

                {/* Footer Branding */}
                <View style={styles.footer}>
                    <Text style={styles.footerAppText}>🍃 Harvestly v2.4.0 • Eco-friendly groceries</Text>
                    <Text style={styles.footerSubText}>Crafted with fresh farm love • 100% Carbon Neutral Delivery</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f6f9f7' },
    container: { paddingHorizontal: 16, paddingBottom: 30 },

    /* Top Navigation Bar */
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    logoBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#0a5d2c', justifyContent: 'center', alignItems: 'center' },
    appName: { fontSize: 15, fontWeight: 'bold', color: '#0a5d2c' },
    appSub: { fontSize: 10, color: '#666', fontWeight: '400' },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 1 },
    locationText: { fontSize: 11, color: '#555' },
    headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    iconBtn: { padding: 6, position: 'relative' },
    notificationDot: { position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: 3, backgroundColor: '#dc2626' },
    avatarHeaderBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#0a5d2c', justifyContent: 'center', alignItems: 'center' },

    /* User Profile Card */
    profileHeaderCard: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 12 },
    avatar: { width: 56, height: 56, borderRadius: 28 },
    profileInfo: { marginLeft: 12, flex: 1 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    userName: { fontSize: 18, fontWeight: 'bold', color: '#1a231e' },
    verifiedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#dcfce7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, gap: 2 },
    verifiedText: { fontSize: 9, fontWeight: 'bold', color: '#1b6333' },
    userHandle: { fontSize: 12, color: '#666', marginTop: 1 },
    userEmail: { fontSize: 12, color: '#888' },

    /* Membership Perks Card */
    membershipCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0fdf4', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#dcfce7', marginBottom: 14 },
    membershipLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    badgeIconBg: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fef3c7', justifyContent: 'center', alignItems: 'center' },
    membershipTitle: { fontSize: 12, fontWeight: 'bold', color: '#1a231e' },
    membershipSubtitle: { fontSize: 10, color: '#059669' },
    perksBtn: { backgroundColor: '#0a5d2c', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    perksBtnText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

    /* Metrics Row */
    metricsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 14 },
    metricCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 },
    metricIconBg: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#eef3f0', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    metricValue: { fontSize: 16, fontWeight: 'bold', color: '#1a231e' },
    metricLabel: { fontSize: 9, color: '#666', textAlign: 'center', marginTop: 2 },

    /* Eco Banner */
    ecoBanner: { backgroundColor: '#0a5d2c', borderRadius: 14, padding: 14, marginBottom: 16 },
    ecoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    ecoTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    ecoTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    tierBadge: { backgroundColor: '#14532d', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    tierText: { color: '#a7f3d0', fontSize: 9, fontWeight: 'bold' },
    ecoSubtitle: { color: '#d1fae5', fontSize: 11, lineHeight: 15, marginBottom: 10 },
    progressBarBg: { height: 6, backgroundColor: '#14532d', borderRadius: 3, marginBottom: 8, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#4ade80', borderRadius: 3 },
    ecoFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    ecoPointsText: { color: '#a7f3d0', fontSize: 9, fontWeight: '600' },
    ecoGiftText: { color: '#a7f3d0', fontSize: 9, fontWeight: '600' },

    /* Menu List */
    menuContainer: { backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    menuIconBg: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    menuTextContainer: { flex: 1 },
    menuTitle: { fontSize: 13, fontWeight: '600', color: '#1a231e' },
    menuSubtitle: { fontSize: 11, color: '#666', marginTop: 1 },

    /* Logout Button */
    logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#dc2626', borderRadius: 20, paddingVertical: 12, marginBottom: 16 },
    logoutBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },

    /* Footer */
    footer: { alignItems: 'center', gap: 2 },
    footerAppText: { fontSize: 11, color: '#666', fontWeight: '500' },
    footerSubText: { fontSize: 9, color: '#999' },
});