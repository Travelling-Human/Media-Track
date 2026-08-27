import apiClient from './client';

export const listItems = (params = {}) => apiClient.get('/items/', { params });
export const createItem = (payload) => apiClient.post('/items/', payload);
export const updateItem = (id, payload) => apiClient.patch(`/items/${id}/`, payload);
export const deleteItem = (id) => apiClient.delete(`/items/${id}/`);


export const exportItems = (format) =>
    apiClient.get(`/export/${format}/`, { responseType: 'blob' });