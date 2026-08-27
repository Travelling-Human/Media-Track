import apiClient from './client';

export const searchCatalog = (mediaType, query, page = 1) =>
    apiClient.get('/catalog/search/', { params: { media_type: mediaType, q: query, page } });

export const fetchTrending = () => apiClient.get('/catalog/trending/');

export const fetchAvailability = (mediaType, source, externalId) =>
    apiClient.get('/catalog/availability/', {
        params: { media_type: mediaType, external_source: source, external_id: externalId },
    });