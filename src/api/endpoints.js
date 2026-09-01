import client from './client';

// Auth Endpoints
export const loginApi = (data) => client.post('/auth/login', data);
export const registerApi = (data) => client.post('/auth/register', data);
export const verifyEmailApi = (data) => client.post('/auth/verify-email', data);
export const logoutApi = (email) => client.post('/auth/logout', email);

// User Profile Endpoint
export const getCurrentUserApi = (credential) => client.post('/api/users/me', credential );

// Product Endpoints
export const getActiveProductsApi = () => client.get('/api/v1/product/activeProducts');
export const getProductDetailApi = (name) => client.get(`/api/v1/product/detail/${name}`);

// Review Endpoint
export const createReviewApi = ({ productId, rating, comment }) =>
    client.post(`/api/products/${productId}/reviews`, { rating, comment });

// Cart Endpoints
export const getCartApi = (customerId) => client.get(`/api/cart/${customerId}`);
export const addToCartApi = ({ customerId, productId, quantity }) =>
    client.post(`/api/cart/${customerId}/items`, { productId, quantity });
export const updateCartQuantityApi = ({ customerId, productId, quantity }) =>
    client.put(`/api/cart/${customerId}/items/${productId}`, { quantity });
export const removeFromCartApi = ({ customerId, productId }) =>
    client.delete(`/api/cart/${customerId}/items/${productId}`);

// Order Endpoints
export const checkoutApi = (customerId) => client.post(`/api/orders/checkout/${customerId}`);
export const getCustomerOrdersApi = (customerId) => client.get(`/api/orders/customer/${customerId}`);

// Wishlist Endpoints
export const getWishlistApi = (customerId) => client.get(`/api/wishlist/${customerId}`);
export const addToWishlistApi = ({ customerId, productId }) =>
    client.post(`/api/wishlist/${customerId}`, { productId });
export const removeFromWishlistApi = ({ customerId, productId }) =>
    client.delete(`/api/wishlist/${customerId}/products/${productId}`);