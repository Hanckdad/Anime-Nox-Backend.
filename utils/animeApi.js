const axios = require('axios');
const NodeCache = require('node-cache');

// Cache for API responses (5 minutes TTL)
const cache = new NodeCache({ stdTTL: 300 });

const ANIME_API_BASE = 'https://www.sankavollerei.com/anime';

// Axios instance with better error handling
const apiClient = axios.create({
  baseURL: ANIME_API_BASE,
  timeout: 10000,
  headers: {
    'User-Agent': 'AnimeNox/1.0.0 (https://github.com/hanckdad)'
  }
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🔄 Fetching: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Success: ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.message);
    
    if (error.response) {
      console.error(`Status: ${error.response.status}, Data:`, error.response.data);
    }
    
    return Promise.reject(error);
  }
);

const getAnimeData = async (endpoint, useCache = true) => {
  const cacheKey = endpoint;
  
  // Return cached data if available
  if (useCache) {
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  try {
    const response = await apiClient.get(endpoint);
    const data = response.data;

    // Cache successful responses
    if (useCache && data) {
      cache.set(cacheKey, data);
    }

    return data;
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error.message);
    
    // Return cached data even if expired when API fails
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log('Using cached data due to API failure');
      return cachedData;
    }
    
    throw new Error(`API request failed: ${error.message}`);
  }
};

// Batch requests for better performance
const batchRequests = async (endpoints) => {
  try {
    const requests = endpoints.map(endpoint => getAnimeData(endpoint));
    const results = await Promise.allSettled(requests);
    
    return results.map((result, index) => ({
      endpoint: endpoints[index],
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason.message : null
    }));
  } catch (error) {
    console.error('Batch requests failed:', error);
    throw error;
  }
};

// Search across multiple endpoints
const comprehensiveSearch = async (query) => {
  const endpoints = [
    `/search/${encodeURIComponent(query)}`,
    `/neko/search/${encodeURIComponent(query)}`
  ];

  const results = await batchRequests(endpoints);
  
  // Combine and deduplicate results
  const allResults = [];
  results.forEach(result => {
    if (result.data && Array.isArray(result.data)) {
      allResults.push(...result.data);
    }
  });

  // Remove duplicates based on slug or title
  const uniqueResults = Array.from(new Map(
    allResults.map(item => [item.slug || item.title, item])
  ).values());

  return uniqueResults;
};

// Get trending anime from multiple sources
const getTrendingAnime = async () => {
  const endpoints = [
    '/home',
    '/samehadaku/popular',
    '/neko/latest'
  ];

  const results = await batchRequests(endpoints);
  const trending = [];

  results.forEach(result => {
    if (result.data) {
      if (Array.isArray(result.data)) {
        trending.push(...result.data.slice(0, 10));
      } else if (result.data.popular || result.data.trending) {
        const data = result.data.popular || result.data.trending;
        if (Array.isArray(data)) {
          trending.push(...data.slice(0, 10));
        }
      }
    }
  });

  // Remove duplicates and limit to 20 items
  return Array.from(new Map(
    trending.map(item => [item.slug || item.title, item])
  ).values()).slice(0, 20);
};

module.exports = {
  getAnimeData,
  batchRequests,
  comprehensiveSearch,
  getTrendingAnime,
  cache
};