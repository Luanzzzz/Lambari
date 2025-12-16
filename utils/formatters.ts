/**
 * Shared formatting utilities for Lambari Kids B2B
 */

/**
 * Format a number as Brazilian Real currency
 */
export const formatPrice = (price: number): string =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

/**
 * Format a price as installment value
 */
export const formatInstallment = (price: number, installments: number = 3): string =>
    formatPrice(price / installments);

/**
 * App-wide constants
 */
export const DEFAULTS = {
    PRICE_RANGE: { min: 0, max: 1000 },
    LOW_STOCK_THRESHOLD: 10,
    DEBOUNCE_MS: 300,
    INSTALLMENTS: 3,
} as const;

/**
 * WhatsApp configuration - can be overridden by environment variables
 */
export const WHATSAPP_CONFIG = {
    PHONE: '5511947804855',
} as const;
