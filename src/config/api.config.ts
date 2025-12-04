/**
 * API Configuration
 * Central configuration for all API endpoints
 */

/**
 * Base API URL - reads from environment variable
 * Falls back to localhost:3002 for development
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

/**
 * Check if we're in development mode
 */
export const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Check if we're in production mode
 */
export const isProduction = process.env.NODE_ENV === 'production';
