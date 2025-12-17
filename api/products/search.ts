/**
 * Vercel Serverless Function: Product/Kit Search API
 * Endpoint: /api/products/search
 * 
 * Query params:
 * - q: search term (optional)
 * - size: filter by size (optional)
 * - color: filter by color (optional)
 * - max_price: maximum price filter (optional)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MOCK_KITS } from './mockKits';
import { KitSearchResult, SearchResponse } from './types';

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
    'https://app.n8n.cloud',
    'https://n8n.cloud',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
];

// Check if origin is allowed (includes Vercel domains)
function isAllowedOrigin(origin: string | undefined): boolean {
    if (!origin) return true; // Allow requests without origin (e.g., curl)

    if (ALLOWED_ORIGINS.includes(origin)) return true;

    // Allow all Vercel preview and production URLs
    if (origin.endsWith('.vercel.app')) return true;

    return false;
}

// Set CORS headers
function setCorsHeaders(req: VercelRequest, res: VercelResponse): void {
    const origin = req.headers.origin as string | undefined;

    if (isAllowedOrigin(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
}

// Normalize text for case-insensitive search
function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // Remove accents
}

// Check if kit matches search term
function matchesSearchTerm(kit: KitSearchResult, searchTerm: string): boolean {
    const normalizedSearch = normalizeText(searchTerm);

    // Search in nome
    if (normalizeText(kit.nome).includes(normalizedSearch)) return true;

    // Search in descricao
    if (normalizeText(kit.descricao).includes(normalizedSearch)) return true;

    // Search in produtos_inclusos (nome, marca)
    for (const produto of kit.produtos_inclusos) {
        if (normalizeText(produto.nome).includes(normalizedSearch)) return true;
        if (normalizeText(produto.marca).includes(normalizedSearch)) return true;
    }

    return false;
}

// Check if kit matches size filter
function matchesSize(kit: KitSearchResult, size: string): boolean {
    const normalizedSize = normalizeText(size);

    return kit.tamanhos_disponiveis.some(tamanho =>
        normalizeText(tamanho).includes(normalizedSize) ||
        normalizedSize.includes(normalizeText(tamanho))
    );
}

// Check if kit matches color filter
function matchesColor(kit: KitSearchResult, color: string): boolean {
    const normalizedColor = normalizeText(color);

    // Check cores_disponiveis
    if (kit.cores_disponiveis.some(cor =>
        normalizeText(cor).includes(normalizedColor)
    )) return true;

    // Check produtos_inclusos colors
    if (kit.produtos_inclusos.some(produto =>
        normalizeText(produto.cor).includes(normalizedColor)
    )) return true;

    return false;
}

// Main handler
export default function handler(req: VercelRequest, res: VercelResponse): void {
    // Set CORS headers
    setCorsHeaders(req, res);

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        // Extract query parameters
        const q = (req.query.q as string) || '';
        const size = (req.query.size as string) || '';
        const color = (req.query.color as string) || '';
        const maxPriceStr = (req.query.max_price as string) || '';

        // Parse max_price (ignore if invalid)
        const maxPrice = parseFloat(maxPriceStr);
        const hasValidMaxPrice = !isNaN(maxPrice) && maxPrice > 0;

        // Filter kits
        let results = MOCK_KITS.filter(kit => {
            // Filter by search term (if provided)
            if (q && !matchesSearchTerm(kit, q)) return false;

            // Filter by size (if provided)
            if (size && !matchesSize(kit, size)) return false;

            // Filter by color (if provided)
            if (color && !matchesColor(kit, color)) return false;

            // Filter by max price (if valid)
            if (hasValidMaxPrice && kit.preco > maxPrice) return false;

            return true;
        });

        // Limit results to 10
        results = results.slice(0, 10);

        // Build response
        const response: SearchResponse = {
            results,
            total_encontrados: results.length,
            termo_busca: q || ''
        };

        // Return JSON response
        res.status(200).json(response);

    } catch (error) {
        console.error('Search API error:', error);
        res.status(500).json({
            error: 'Internal server error',
            results: [],
            total_encontrados: 0,
            termo_busca: ''
        });
    }
}
