import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 1. CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Query params
  const { q = '', size, color, max_price } = req.query;
  const termoBusca = (q as string).toLowerCase().trim();

  // 3. Base de dados mockada
  const todosProdutos = [
    {
      id: "kit-verao-tropical-01",
      nome: "Kit Verão Tropical",
      tipo: "kit",
      preco: 89.90,
      estoque: 3,
      descricao: "Kit completo para aproveitar o verão com conforto e estilo! Perfeito para passeios e dias quentes. ☀️🏖️",
      tamanhos_disponiveis: ["6-9 meses", "9-12 meses"],
      cores_disponiveis: ["Azul/Amarelo", "Verde/Laranja"],
      imagem_url: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=600&fit=crop",
      produtos_inclusos: [
        { nome: "Body Manga Curta Tropical", marca: "Carter's", cor: "Azul com estampa abacaxi" },
        { nome: "Shorts Saruel", marca: "Tip Top", cor: "Amarelo" },
        { nome: "Chapéu de Praia", marca: "Pimpolho", cor: "Azul" }
      ]
    },
    {
      id: "kit-inverno-quentinho-01",
      nome: "Kit Inverno Quentinho",
      tipo: "kit",
      preco: 120.00,
      estoque: 5,
      descricao: "Mantém seu bebê aquecido e estiloso nos dias frios! Tecidos macios e confortáveis. ❄️🧣",
      tamanhos_disponiveis: ["RN", "1-3 meses", "3-6 meses"],
      cores_disponiveis: ["Vermelho/Branco", "Azul Marinho"],
      imagem_url: "https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=600&h=600&fit=crop",
      produtos_inclusos: [
        { nome: "Macacão Plush", marca: "Pulla Bulla", cor: "Vermelho" },
        { nome: "Touca com Pompom", marca: "Tip Top", cor: "Branco" },
        { nome: "Luvas de Lã", marca: "Pimpolho", cor: "Vermelho" }
      ]
    },
    {
      id: "kit-passeio-chique-01",
      nome: "Kit Passeio Chique",
      tipo: "kit",
      preco: 150.00,
      estoque: 2,
      descricao: "Vista seu pequeno com elegância para ocasiões especiais! Qualidade premium. ✨👶",
      tamanhos_disponiveis: ["3-6 meses", "6-9 meses"],
      cores_disponiveis: ["Bege/Dourado", "Azul Royal"],
      imagem_url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=600&fit=crop",
      produtos_inclusos: [
        { nome: "Body Social", marca: "Carter's", cor: "Bege" },
        { nome: "Calça Alfaiataria", marca: "Milon", cor: "Bege" },
        { nome: "Gravata Borboleta", marca: "Tip Top", cor: "Dourado" }
      ]
    },
    {
      id: "kit-primeiros-dias-01",
      nome: "Kit Primeiros Dias",
      tipo: "kit",
      preco: 78.50,
      estoque: 10,
      descricao: "Tudo que você precisa para os primeiros dias do bebê! Essenciais selecionados. 🍼💙",
      tamanhos_disponiveis: ["RN"],
      cores_disponiveis: ["Rosa Bebê", "Azul Bebê", "Branco"],
      imagem_url: "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=600&h=600&fit=crop",
      produtos_inclusos: [
        { nome: "Body Envelope RN", marca: "Gerber", cor: "Branco" },
        { nome: "Calça Mijão", marca: "Pulla Bulla", cor: "Azul Bebê" },
        { nome: "Touca Básica", marca: "Tip Top", cor: "Azul Bebê" },
        { nome: "Luva Antirranhão", marca: "Pimpolho", cor: "Branco" }
      ]
    },
    {
      id: "kit-festinha-01",
      nome: "Kit Festinha",
      tipo: "kit",
      preco: 95.00,
      estoque: 1,
      descricao: "Deixe seu bebê pronto para celebrar com muito estilo e conforto! 🎉🎈",
      tamanhos_disponiveis: ["9-12 meses", "12-18 meses"],
      cores_disponiveis: ["Colorido", "Rosa/Dourado"],
      imagem_url: "https://images.unsplash.com/photo-1518916772884-c3e6039d191f?w=600&h=600&fit=crop",
      produtos_inclusos: [
        { nome: "Body Festa", marca: "Carter's", cor: "Colorido com confetes" },
        { nome: "Saia Tutu", marca: "Milon", cor: "Rosa" },
        { nome: "Tiara com Laço", marca: "Pimpolho", cor: "Dourado" }
      ]
    }
  ];

  // 4. Filtros
  let resultados = [...todosProdutos];

  // Filtrar por termo de busca
  if (termoBusca) {
    resultados = resultados.filter(produto => {
      const buscarEm = [
        produto.nome,
        produto.descricao,
        ...produto.produtos_inclusos.map(p => p.nome),
        ...produto.tamanhos_disponiveis,
        ...produto.cores_disponiveis
      ].join(' ').toLowerCase();

      return buscarEm.includes(termoBusca);
    });
  }

  // Filtrar por tamanho
  if (size) {
    const tamanhoLower = (size as string).toLowerCase();
    resultados = resultados.filter(produto =>
      produto.tamanhos_disponiveis.some(t =>
        t.toLowerCase().includes(tamanhoLower)
      )
    );
  }

  // Filtrar por cor
  if (color) {
    const corLower = (color as string).toLowerCase();
    resultados = resultados.filter(produto =>
      produto.cores_disponiveis.some(c =>
        c.toLowerCase().includes(corLower)
      )
    );
  }

  // Filtrar por preço máximo
  if (max_price) {
    const precoMax = parseFloat(max_price as string);
    if (!isNaN(precoMax)) {
      resultados = resultados.filter(produto => produto.preco <= precoMax);
    }
  }

  // 5. Retorno
  return res.status(200).json({
    results: resultados,
    total_encontrados: resultados.length,
    termo_busca: termoBusca || ''
  });
}
