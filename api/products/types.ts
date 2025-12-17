/**
 * Types for n8n Product Search API
 */

export interface ProdutoIncluso {
    nome: string;
    marca: string;
    cor: string;
}

export interface KitSearchResult {
    id: string;
    nome: string;
    tipo: 'kit' | 'produto';
    preco: number;
    estoque: number;
    descricao: string;
    tamanhos_disponiveis: string[];
    cores_disponiveis: string[];
    produtos_inclusos: ProdutoIncluso[];
    imagem_url: string;
}

export interface SearchResponse {
    results: KitSearchResult[];
    total_encontrados: number;
    termo_busca: string;
}

export interface SearchParams {
    q?: string;
    size?: string;
    color?: string;
    max_price?: string;
}
