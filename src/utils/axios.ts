import type { AxiosRequestConfig } from 'axios';

import axios from 'axios';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: CONFIG.site.serverUrl });

axiosInstance.interceptors.request.use(
  (config) => {
    // Try sessionStorage first (jwt_access_token)
    let accessToken = sessionStorage.getItem('jwt_access_token');
    // Fallback to old key for backwards compatibility
    if (!accessToken) {
      accessToken = sessionStorage.getItem('accessToken');
    }
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip auto-refresh for login/register/refresh endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                          originalRequest.url?.includes('/auth/register') ||
                          originalRequest.url?.includes('/auth/refresh');

    // If error is 401 and we haven't tried to refresh yet (and not an auth endpoint)
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        // Get refresh token
        const refreshToken = sessionStorage.getItem('jwt_refresh_token') || 
                           sessionStorage.getItem('refreshToken');

        if (refreshToken) {
          // Call refresh endpoint
          const response = await axios.post(`${CONFIG.site.serverUrl}/api/auth/refresh`, {
            refreshToken,
          });

          const { accessToken: newAccessToken } = response.data;

          // Update tokens in storage
          sessionStorage.setItem('jwt_access_token', newAccessToken);
          sessionStorage.setItem('accessToken', newAccessToken); // Backwards compatibility

          // Update authorization header
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Retry original request with new token
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        console.error('Token refresh failed:', refreshError);
        sessionStorage.clear();
        window.location.href = '/auth/jwt/sign-in';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject((error.response && error.response.data) || 'Something went wrong!');
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/users/profile',
    signIn: '/api/auth/login',
    signUp: '/api/auth/register',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
};
