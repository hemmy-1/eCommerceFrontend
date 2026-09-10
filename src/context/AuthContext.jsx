import React, { createContext, useState, useEffect } from 'react';
import {
    saveTokens,
    clearTokens,
    getAccessToken,
    saveUserEmail,
    getUserEmail,
} from '../storage/secureStore';
import { getCurrentUserApi, loginApi } from '../api/endpoints';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = async (email) => {
        try {
            const response = await getCurrentUserApi(email);
            setUser(response.data); // Stores customer id, nickName, email, role
            return true;
        } catch (error) {
            // A stale token should quietly return the user to the login screen.
            await logout();
            return false;
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        const response = await loginApi(credentials);
        console.log("response", response.data);
        const { accessToken, refreshToken } = response.data;
        await saveTokens(accessToken, refreshToken);
        await saveUserEmail(credentials.email);
        await fetchUserProfile(credentials);
    };

    const logout = async () => {
        await clearTokens();
        setUser(null);
    };

    useEffect(() => {
        const checkAuthStatus = async () => {
            const token = await getAccessToken();
            const email = await getUserEmail();

            if (token && email) {
                await fetchUserProfile({ email });
            } else {
                await clearTokens();
                setLoading(false);
            }
        };
        checkAuthStatus();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};