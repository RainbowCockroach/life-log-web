import Cookies from 'js-cookie';

const API_KEY_COOKIE_NAME = 'lifelog_api_key';
const BASE_URL_COOKIE_NAME = 'lifelog_base_url';
const COOKIE_EXPIRY_DAYS = 365; // Store for 1 year

/**
 * Saves the API key to a cookie
 * @param apiKey - The API key to store
 */
export function saveApiKey(apiKey: string): void {
  Cookies.set(API_KEY_COOKIE_NAME, apiKey, {
    expires: COOKIE_EXPIRY_DAYS,
    sameSite: 'strict',
    secure: window.location.protocol === 'https:'
  });
}

/**
 * Retrieves the API key from the cookie
 * @returns The stored API key or null if not found
 */
export function getApiKey(): string | null {
  return Cookies.get(API_KEY_COOKIE_NAME) || null;
}

/**
 * Removes the API key from the cookie
 */
export function clearApiKey(): void {
  Cookies.remove(API_KEY_COOKIE_NAME);
}

/**
 * Checks if an API key exists in storage
 * @returns True if API key exists, false otherwise
 */
export function hasApiKey(): boolean {
  return !!getApiKey();
}

/**
 * Saves the base URL to a cookie
 * @param baseUrl - The base URL to store
 */
export function saveBaseUrl(baseUrl: string): void {
  Cookies.set(BASE_URL_COOKIE_NAME, baseUrl, {
    expires: COOKIE_EXPIRY_DAYS,
    sameSite: 'strict',
    secure: window.location.protocol === 'https:'
  });
}

/**
 * Retrieves the base URL from the cookie
 * @returns The stored base URL or null if not found
 */
export function getBaseUrl(): string | null {
  return Cookies.get(BASE_URL_COOKIE_NAME) || null;
}

/**
 * Removes the base URL from the cookie
 */
export function clearBaseUrl(): void {
  Cookies.remove(BASE_URL_COOKIE_NAME);
}

/**
 * Checks if a base URL exists in storage
 * @returns True if base URL exists, false otherwise
 */
export function hasBaseUrl(): boolean {
  return !!getBaseUrl();
}
