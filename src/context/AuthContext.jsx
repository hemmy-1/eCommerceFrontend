import React, { createContext, useState, useEffect } from 'react';
import { saveTokens, clearTokens, getAccessToken } from '../storage/secureStore';
import { getCurrentUserApi, loginApi } from '../api/endpoints';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = async (email) => {
        try {
            const response = await getCurrentUserApi(email);
            setUser(response.data); // Stores customer id, nickName, email, role
        } catch (error) {
            console.error('Failed to fetch user context', error);
            await logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        const response = await loginApi(credentials);
        console.log("response", response.data);
        const { accessToken, refreshToken } = response.data;
        await saveTokens(accessToken, refreshToken);
        console.log(credentials.email);
        console.log(credentials);
        await fetchUserProfile(credentials);
    };

    const logout = async () => {
        await clearTokens();
        setUser(null);
    };

    useEffect(() => {
        const checkAuthStatus = async () => {
            const token = await getAccessToken();
            if (token) {
                await fetchUserProfile();
            } else {
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