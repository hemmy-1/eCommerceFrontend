import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'jwt_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_EMAIL_KEY = 'user_email';

export const saveTokens = async (accessToken, refreshToken) => {
    // Check if accessToken exists and is valid before storing
    if (typeof accessToken === 'string' && accessToken.trim() !== '') {
        await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
    } else if (accessToken) {
        // Fallback if it's somehow passed as a non-string value
        await SecureStore.setItemAsync(TOKEN_KEY, String(accessToken));
    }

    if (typeof refreshToken === 'string' && refreshToken.trim() !== '') {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    } else if (refreshToken) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, String(refreshToken));
    }
};

export const getAccessToken = async () => {
    return await SecureStore.getItemAsync(TOKEN_KEY);
};

export const getRefreshToken = async () => {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
};

export const saveUserEmail = async (email) => {
    if (typeof email === 'string' && email.trim() !== '') {
        await SecureStore.setItemAsync(USER_EMAIL_KEY, email.trim());
    }
};

export const getUserEmail = async () => {
    return await SecureStore.getItemAsync(USER_EMAIL_KEY);
};

export const clearTokens = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_EMAIL_KEY);
};