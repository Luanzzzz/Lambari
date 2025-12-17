/**
 * Test Script for API Search Logic
 * Run with: npx ts-node --esm api/products/test.ts
 */

import { MOCK_KITS } from './mockKits.js';
import { KitSearchResult, SearchResponse } from './types.js';

// Normalize text for case-insensitive search
function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

// Check if kit matches search term
function matchesSearchTerm(kit: KitSearchResult, searchTerm: string): boolean {
    const normalizedSearch = normalizeText(searchTerm);

    if (normalizeText(kit.nome).includes(normalizedSearch)) return true;
    if (normalizeText(kit.descricao).includes(normalizedSearch)) return true;

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

    if (kit.cores_disponiveis.some(cor =>
        normalizeText(cor).includes(normalizedColor)
    )) return true;

    if (kit.produtos_inclusos.some(produto =>
        normalizeText(produto.cor).includes(normalizedColor)
    )) return true;

    return false;
}

// Simulate search handler
function search(q: string = '', size: string = '', color: string = '', maxPriceStr: string = ''): SearchResponse {
    const maxPrice = parseFloat(maxPriceStr);
    const hasValidMaxPrice = !isNaN(maxPrice) && maxPrice > 0;

    let results = MOCK_KITS.filter(kit => {
        if (q && !matchesSearchTerm(kit, q)) return false;
        if (size && !matchesSize(kit, size)) return false;
        if (color && !matchesColor(kit, color)) return false;
        if (hasValidMaxPrice && kit.preco > maxPrice) return false;
        return true;
    });

    results = results.slice(0, 10);

    return {
        results,
        total_encontrados: results.length,
        termo_busca: q || ''
    };
}

// ============= TESTS =============
console.log('🧪 Testando API de Busca de Produtos/Kits\n');
console.log('='.repeat(50));

// Test 1: Search without params (returns all)
console.log('\n📋 Teste 1: Busca sem parâmetros (retorna todos)');
const test1 = search();
console.log(`   Total encontrados: ${test1.total_encontrados}`);
console.log(`   ✅ Passou: ${test1.total_encontrados === 5 ? 'SIM' : 'NÃO'} (esperado: 5)`);

// Test 2: Search by term "verão"
console.log('\n📋 Teste 2: Busca por termo "verão"');
const test2 = search('verão');
console.log(`   Total encontrados: ${test2.total_encontrados}`);
console.log(`   Kits: ${test2.results.map(k => k.nome).join(', ')}`);
console.log(`   ✅ Passou: ${test2.results.some(k => k.nome.includes('Tropical')) ? 'SIM' : 'NÃO'}`);

// Test 3: Search by size "RN"
console.log('\n📋 Teste 3: Filtro por tamanho "RN"');
const test3 = search('', 'RN');
console.log(`   Total encontrados: ${test3.total_encontrados}`);
console.log(`   Kits: ${test3.results.map(k => k.nome).join(', ')}`);
console.log(`   ✅ Passou: ${test3.total_encontrados >= 2 ? 'SIM' : 'NÃO'} (esperado: >=2)`);

// Test 4: Search with max_price filter
console.log('\n📋 Teste 4: Filtro por preço máximo R$ 100');
const test4 = search('', '', '', '100');
console.log(`   Total encontrados: ${test4.total_encontrados}`);
console.log(`   Kits: ${test4.results.map(k => `${k.nome} (R$${k.preco})`).join(', ')}`);
console.log(`   ✅ Passou: ${test4.results.every(k => k.preco <= 100) ? 'SIM' : 'NÃO'}`);

// Test 5: Search by color "Rosa"
console.log('\n📋 Teste 5: Filtro por cor "Rosa"');
const test5 = search('', '', 'Rosa');
console.log(`   Total encontrados: ${test5.total_encontrados}`);
console.log(`   Kits: ${test5.results.map(k => k.nome).join(', ')}`);
console.log(`   ✅ Passou: ${test5.total_encontrados >= 1 ? 'SIM' : 'NÃO'}`);

// Test 6: Search by brand "Carter"
console.log('\n📋 Teste 6: Busca por marca "Carter"');
const test6 = search('Carter');
console.log(`   Total encontrados: ${test6.total_encontrados}`);
console.log(`   Kits: ${test6.results.map(k => k.nome).join(', ')}`);
console.log(`   ✅ Passou: ${test6.total_encontrados >= 1 ? 'SIM' : 'NÃO'}`);

// Test 7: Combined filters
console.log('\n📋 Teste 7: Filtros combinados (q=kit, size=RN, max_price=100)');
const test7 = search('kit', 'RN', '', '100');
console.log(`   Total encontrados: ${test7.total_encontrados}`);
console.log(`   Kits: ${test7.results.map(k => k.nome).join(', ')}`);

// Test 8: Non-existent product
console.log('\n📋 Teste 8: Produto inexistente');
const test8 = search('xyznotfound123');
console.log(`   Total encontrados: ${test8.total_encontrados}`);
console.log(`   ✅ Passou: ${test8.total_encontrados === 0 && test8.results.length === 0 ? 'SIM' : 'NÃO'}`);

// Test 9: Case insensitive
console.log('\n📋 Teste 9: Case insensitive (VERAO vs verão)');
const test9a = search('VERAO');
const test9b = search('verão');
console.log(`   Usando 'VERAO': ${test9a.total_encontrados} resultados`);
console.log(`   Usando 'verão': ${test9b.total_encontrados} resultados`);
console.log(`   ✅ Passou: ${test9a.total_encontrados === test9b.total_encontrados ? 'SIM' : 'NÃO'}`);

console.log('\n' + '='.repeat(50));
console.log('🎉 Testes concluídos!\n');

// Show example JSON response
console.log('📄 Exemplo de resposta JSON:');
console.log(JSON.stringify(search('tropical'), null, 2));
