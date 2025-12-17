/**
 * Test Script for API Search Logic
 * Run with: node api/products/test.cjs
 */

// ========== MOCK DATA (inline for CommonJS test) ==========
const MOCK_KITS = [
    {
        id: 'kit-verao-tropical-01',
        nome: 'Kit Verão Tropical',
        tipo: 'kit',
        preco: 89.90,
        estoque: 3,
        descricao: 'Kit completo para aproveitar o verão com conforto e estilo. Peças leves e frescas para os dias quentes.',
        tamanhos_disponiveis: ['6-9 meses', '9-12 meses'],
        cores_disponiveis: ['Azul/Amarelo', 'Verde/Laranja'],
        produtos_inclusos: [
            { nome: 'Body Manga Curta Tropical', marca: "Carter's", cor: 'Azul com estampa abacaxi' },
            { nome: 'Shorts Saruel', marca: 'Tip Top', cor: 'Amarelo' },
            { nome: 'Chapéu de Praia', marca: 'Pimpolho', cor: 'Azul' }
        ],
        imagem_url: '/images/kits/kit-verao-tropical.jpg'
    },
    {
        id: 'kit-inverno-quentinho-02',
        nome: 'Kit Inverno Quentinho',
        tipo: 'kit',
        preco: 120.00,
        estoque: 5,
        descricao: 'Kit aconchegante para os dias frios. Peças macias e quentinhas para manter seu bebê protegido.',
        tamanhos_disponiveis: ['RN', '1-3 meses'],
        cores_disponiveis: ['Rosa/Branco', 'Azul/Cinza', 'Bege'],
        produtos_inclusos: [
            { nome: 'Macacão Plush com Capuz', marca: 'Gerber', cor: 'Rosa com orelhinhas' },
            { nome: 'Body Manga Longa Térmico', marca: "Carter's", cor: 'Branco' },
            { nome: 'Calça com Pé', marca: 'Tip Top', cor: 'Rosa' },
            { nome: 'Touca de Malha', marca: 'Pimpolho', cor: 'Rosa claro' },
            { nome: 'Luvas Antiarranhão', marca: 'Gerber', cor: 'Branco' }
        ],
        imagem_url: '/images/kits/kit-inverno-quentinho.jpg'
    },
    {
        id: 'kit-passeio-chique-03',
        nome: 'Kit Passeio Chique',
        tipo: 'kit',
        preco: 150.00,
        estoque: 2,
        descricao: 'Kit elegante para passeios especiais. Peças sofisticadas para seu bebê arrasar em qualquer ocasião.',
        tamanhos_disponiveis: ['3-6 meses'],
        cores_disponiveis: ['Marinho/Branco', 'Bordô/Bege'],
        produtos_inclusos: [
            { nome: 'Conjunto Social Camisa + Calça', marca: 'Paola Da Vinci', cor: 'Azul marinho com listras' },
            { nome: 'Sapatinho Mocassim', marca: 'Pimpolho', cor: 'Marrom' },
            { nome: 'Blazer Mini', marca: 'Tip Top', cor: 'Azul marinho' },
            { nome: 'Gravata Borboleta', marca: 'Tip Top', cor: 'Vermelha' }
        ],
        imagem_url: '/images/kits/kit-passeio-chique.jpg'
    },
    {
        id: 'kit-primeiros-dias-04',
        nome: 'Kit Primeiros Dias',
        tipo: 'kit',
        preco: 78.50,
        estoque: 10,
        descricao: 'Kit essencial para recém-nascidos. Tudo que você precisa para os primeiros dias do bebê em casa.',
        tamanhos_disponiveis: ['RN'],
        cores_disponiveis: ['Branco', 'Amarelo Claro', 'Verde Água'],
        produtos_inclusos: [
            { nome: 'Body Kimono Manga Longa (3 unidades)', marca: 'Gerber', cor: 'Branco, Amarelo, Verde' },
            { nome: 'Calça com Pé (2 unidades)', marca: "Carter's", cor: 'Branco e Bege' },
            { nome: 'Touca Suedine', marca: 'Pimpolho', cor: 'Branco' },
            { nome: 'Par de Meias RN', marca: 'Tip Top', cor: 'Branco' }
        ],
        imagem_url: '/images/kits/kit-primeiros-dias.jpg'
    },
    {
        id: 'kit-festinha-05',
        nome: 'Kit Festinha',
        tipo: 'kit',
        preco: 95.00,
        estoque: 1,
        descricao: 'Kit especial para festas e comemorações. Seu bebê será a estrela de qualquer evento!',
        tamanhos_disponiveis: ['9-12 meses'],
        cores_disponiveis: ['Rosa/Dourado', 'Azul/Prata'],
        produtos_inclusos: [
            { nome: 'Vestido de Festa com Tule', marca: 'Paraíso', cor: 'Rosa com detalhes dourados' },
            { nome: 'Tiara com Laço', marca: 'Pimpolho', cor: 'Dourada' },
            { nome: 'Sapatilha de Festa', marca: 'Tip Top', cor: 'Rosa cintilante' },
            { nome: 'Calcinha Tapa Fralda', marca: "Carter's", cor: 'Rosa' }
        ],
        imagem_url: '/images/kits/kit-festinha.jpg'
    }
];

// ========== SEARCH LOGIC ==========
function normalizeText(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function matchesSearchTerm(kit, searchTerm) {
    const normalizedSearch = normalizeText(searchTerm);
    if (normalizeText(kit.nome).includes(normalizedSearch)) return true;
    if (normalizeText(kit.descricao).includes(normalizedSearch)) return true;
    for (const produto of kit.produtos_inclusos) {
        if (normalizeText(produto.nome).includes(normalizedSearch)) return true;
        if (normalizeText(produto.marca).includes(normalizedSearch)) return true;
    }
    return false;
}

function matchesSize(kit, size) {
    const normalizedSize = normalizeText(size);
    return kit.tamanhos_disponiveis.some(tamanho =>
        normalizeText(tamanho).includes(normalizedSize) ||
        normalizedSize.includes(normalizeText(tamanho))
    );
}

function matchesColor(kit, color) {
    const normalizedColor = normalizeText(color);
    if (kit.cores_disponiveis.some(cor => normalizeText(cor).includes(normalizedColor))) return true;
    if (kit.produtos_inclusos.some(produto => normalizeText(produto.cor).includes(normalizedColor))) return true;
    return false;
}

function search(q = '', size = '', color = '', maxPriceStr = '') {
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

// ========== TESTS ==========
console.log('🧪 Testando API de Busca de Produtos/Kits\n');
console.log('='.repeat(50));

let passed = 0;
let failed = 0;

// Test 1: Search without params
console.log('\n📋 Teste 1: Busca sem parâmetros (retorna todos os 5 kits)');
const test1 = search();
console.log(`   Total encontrados: ${test1.total_encontrados}`);
if (test1.total_encontrados === 5) { passed++; console.log('   ✅ PASSOU'); }
else { failed++; console.log('   ❌ FALHOU'); }

// Test 2: Search by term "verão"
console.log('\n📋 Teste 2: Busca por termo "verão"');
const test2 = search('verão');
console.log(`   Total encontrados: ${test2.total_encontrados}`);
console.log(`   Kits: ${test2.results.map(k => k.nome).join(', ')}`);
if (test2.results.some(k => k.nome.includes('Tropical'))) { passed++; console.log('   ✅ PASSOU'); }
else { failed++; console.log('   ❌ FALHOU'); }

// Test 3: Search by size "RN"
console.log('\n📋 Teste 3: Filtro por tamanho "RN"');
const test3 = search('', 'RN');
console.log(`   Total encontrados: ${test3.total_encontrados}`);
console.log(`   Kits: ${test3.results.map(k => k.nome).join(', ')}`);
if (test3.total_encontrados >= 2) { passed++; console.log('   ✅ PASSOU'); }
else { failed++; console.log('   ❌ FALHOU'); }

// Test 4: Search with max_price filter
console.log('\n📋 Teste 4: Filtro por preço máximo R$ 100');
const test4 = search('', '', '', '100');
console.log(`   Total encontrados: ${test4.total_encontrados}`);
console.log(`   Kits: ${test4.results.map(k => `${k.nome} (R$${k.preco})`).join(', ')}`);
if (test4.results.every(k => k.preco <= 100)) { passed++; console.log('   ✅ PASSOU'); }
else { failed++; console.log('   ❌ FALHOU'); }

// Test 5: Search by color "Rosa"
console.log('\n📋 Teste 5: Filtro por cor "Rosa"');
const test5 = search('', '', 'Rosa');
console.log(`   Total encontrados: ${test5.total_encontrados}`);
console.log(`   Kits: ${test5.results.map(k => k.nome).join(', ')}`);
if (test5.total_encontrados >= 1) { passed++; console.log('   ✅ PASSOU'); }
else { failed++; console.log('   ❌ FALHOU'); }

// Test 6: Search by brand "Carter"
console.log('\n📋 Teste 6: Busca por marca "Carter"');
const test6 = search('Carter');
console.log(`   Total encontrados: ${test6.total_encontrados}`);
console.log(`   Kits: ${test6.results.map(k => k.nome).join(', ')}`);
if (test6.total_encontrados >= 1) { passed++; console.log('   ✅ PASSOU'); }
else { failed++; console.log('   ❌ FALHOU'); }

// Test 7: Combined filters
console.log('\n📋 Teste 7: Filtros combinados (q=kit, size=RN, max_price=100)');
const test7 = search('kit', 'RN', '', '100');
console.log(`   Total encontrados: ${test7.total_encontrados}`);
console.log(`   Kits: ${test7.results.map(k => k.nome).join(', ')}`);
if (test7.results.every(k => k.preco <= 100)) { passed++; console.log('   ✅ PASSOU'); }
else { failed++; console.log('   ❌ FALHOU'); }

// Test 8: Non-existent product
console.log('\n📋 Teste 8: Produto inexistente');
const test8 = search('xyznotfound123');
console.log(`   Total encontrados: ${test8.total_encontrados}`);
if (test8.total_encontrados === 0 && test8.results.length === 0) { passed++; console.log('   ✅ PASSOU'); }
else { failed++; console.log('   ❌ FALHOU'); }

// Test 9: Case insensitive
console.log('\n📋 Teste 9: Case insensitive (VERAO vs verão)');
const test9a = search('VERAO');
const test9b = search('verão');
console.log(`   Usando 'VERAO': ${test9a.total_encontrados} resultados`);
console.log(`   Usando 'verão': ${test9b.total_encontrados} resultados`);
if (test9a.total_encontrados === test9b.total_encontrados) { passed++; console.log('   ✅ PASSOU'); }
else { failed++; console.log('   ❌ FALHOU'); }

console.log('\n' + '='.repeat(50));
console.log(`\n🎯 RESULTADO FINAL: ${passed}/${passed + failed} testes passaram`);
if (failed === 0) {
    console.log('🎉 Todos os testes passaram!\n');
} else {
    console.log(`⚠️  ${failed} teste(s) falharam\n`);
}

// Show example JSON response
console.log('📄 Exemplo de resposta JSON para n8n:');
console.log(JSON.stringify(search('tropical'), null, 2));
