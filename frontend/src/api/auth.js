import apiClient from './client';

export const registerUser = (username, email, password) =>
    apiClient.post('/auth/register/', { username, email, password });

export const loginUser = (username, password) =>
    apiClient.post('/auth/login/', { username, password });