import Cookies from 'js-cookie';

const API_KEY_COOKIE_NAME = 'lifelog_api_key';
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
