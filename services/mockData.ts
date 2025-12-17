
import { Product, Category, Kit, StockMovement, Brand, UserProfile, Order } from '../types';

export const INITIAL_BRANDS: Brand[] = [
  {
    id: 'premium',
    name: 'Premium',
    slug: 'premium',
    color: '#1E40AF',
    textColor: '#FFFFFF',
    active: true,
    order: 1
  },
  {
    id: 'basic',
    name: 'Básico',
    slug: 'basico',
    color: '#3B82F6',
    textColor: '#FFFFFF',
    active: true,
    order: 2
  },
  {
    id: 'luxury',
    name: 'Lambari Luxury',
    slug: 'luxury',
    color: '#F59E0B',
    textColor: '#FFFFFF',
    active: true,
    order: 3
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Conjuntos', slug: 'conjuntos', subcategories: ['Verão', 'Inverno'] },
  { id: '2', name: 'Vestidos', slug: 'vestidos', subcategories: ['Festa', 'Dia a Dia'] },
  { id: '3', name: 'Pijamas', slug: 'pijamas', subcategories: ['Curto', 'Longo'] },
  { id: '4', name: 'Acessórios', slug: 'acessorios', subcategories: ['Laços', 'Bonés'] },
];

export const MOCK_USER_PROFILE: UserProfile = {
  id: 'CLT-001',
  name: 'João Silva',
  company: 'Loja Infantil Silva LTDA',
  cnpj: '12.345.678/0001-90',
  email: 'joao@lojassilva.com.br',
  phone: '(11) 98765-4321',
  address: {
    street: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567'
  },
  memberSince: '2023-01-15'
};

export const MOCK_ORDERS: Order[] = [
  {
    id: 'LK-2025-00123',
    date: '2025-12-10T14:30:00',
    total: 2450.00,
    status: 'in_transit',
    customer: {
      name: 'João Silva',
      company: 'Loja Silva',
      email: 'joao@email.com',
      phone: '(11) 99999-9999'
    },
    items: [
      { name: 'Kit Verão Conforto 2025', quantity: 1, price: 349.90 },
      { name: 'Kit Esportivo Ativo', quantity: 2, price: 299.90 },
      { name: 'Kit Casual Unissex', quantity: 5, price: 189.90 }
    ],
    tracking: {
      code: 'LK-2025-00123',
      carrier: 'Transportadora XYZ',
      estimatedDelivery: '2025-12-17',
      timeline: [
        { status: 'Pedido Confirmado', date: '2025-12-10T14:30:00', completed: true },
        { status: 'Separando Estoque', date: '2025-12-11T09:15:00', completed: true },
        { status: 'Em Trânsito', date: '2025-12-12T16:00:00', completed: true },
        { status: 'Saiu para Entrega', date: null, completed: false },
        { status: 'Entregue', date: null, completed: false }
      ]
    }
  },
  {
    id: 'LK-2025-00089',
    date: '2025-11-25T10:15:00',
    total: 1890.00,
    status: 'delivered',
    customer: {
      name: 'Maria Oliveira',
      company: 'Baby Store',
      email: 'maria@email.com',
      phone: '(11) 88888-8888'
    },
    items: [
      { name: 'Kit Inverno Baby', quantity: 3, price: 289.90 },
      { name: 'Kit Pijamas Sonhos', quantity: 4, price: 229.90 }
    ],
    tracking: {
      code: 'LK-2025-00089',
      carrier: 'Transportadora ABC',
      estimatedDelivery: '2025-12-02',
      deliveredDate: '2025-12-01',
      timeline: [
        { status: 'Pedido Confirmado', date: '2025-11-25T10:15:00', completed: true },
        { status: 'Separando Estoque', date: '2025-11-26T08:30:00', completed: true },
        { status: 'Em Trânsito', date: '2025-11-27T14:20:00', completed: true },
        { status: 'Saiu para Entrega', date: '2025-12-01T07:45:00', completed: true },
        { status: 'Entregue', date: '2025-12-01T15:30:00', completed: true }
      ]
    }
  }
];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_KITS: Kit[] = [
  {
    id: '1',
    name: "Kit Verão Conforto 2025",
    brand: "premium",
    gender: "boy",
    season: 'verao',
    category: 'conjuntos',
    ageRange: 'kids',
    style: ['casual', 'escola'],
    minQuantity: 15,
    availability: 'em_estoque',
    price: 349.90,
    totalPieces: 15,
    sizesAvailable: ["4", "6", "8", "10"],
    colors: ["Azul", "Branco", "Vermelho"],
    material: "algodao",
    description: "Kit completo para verão contendo: 5 Camisetas variadas, 5 Bermudas em cores sortidas, 3 Conjuntos completos, 2 Bodies de algodão.",
    images: [
      "https://placehold.co/600x800/EEE/31343C?text=Kit+Verao+1",
      "https://placehold.co/600x800/EEE/31343C?text=Kit+Verao+2"
    ],
    videos: ["#"],
    items: [],
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: "Kit Inverno Aconchego Baby",
    brand: "basic",
    gender: "bebe",
    season: 'inverno',
    category: 'conjuntos',
    ageRange: 'baby',
    style: ['inverno', 'casual'],
    minQuantity: 20,
    availability: 'pronta_entrega',
    price: 289.90,
    totalPieces: 20,
    sizesAvailable: ["RN", "PP", "P", "M"],
    colors: ["Rosa", "Bege", "Cinza"],
    material: "malha",
    description: "Kit perfeito para bebês contendo: 8 Bodies manga longa, 6 Calças confortáveis, 4 Macacões, 2 Mantas térmicas.",
    images: [
      "https://placehold.co/600x800/EEE/31343C?text=Inverno+Baby+1",
      "https://placehold.co/600x800/EEE/31343C?text=Inverno+Baby+2"
    ],
    videos: [],
    items: [],
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: "Kit Primavera Flores",
    brand: "luxury",
    gender: "girl",
    season: 'primavera',
    category: 'vestidos',
    ageRange: 'kids',
    style: ['festa', 'social'],
    minQuantity: 10,
    availability: 'em_estoque',
    price: 599.90,
    totalPieces: 10,
    sizesAvailable: ["2", "4", "6", "8", "10"],
    colors: ["Rosa", "Lilás", "Branco"],
    material: "viscose",
    description: "Coleção especial para festas: 4 Vestidos de festa, 3 Saias rodadas, 2 Conjuntos elegantes, 1 Casaco social.",
    images: [
      "https://placehold.co/600x800/EEE/31343C?text=Primavera+1",
      "https://placehold.co/600x800/EEE/31343C?text=Primavera+2"
    ],
    videos: ["#"],
    items: [],
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: "Kit Esportivo Ativo",
    brand: "premium",
    gender: "boy",
    season: 'verao',
    category: 'conjuntos',
    ageRange: 'tweens',
    style: ['esportivo'],
    minQuantity: 18,
    availability: 'promocao',
    price: 299.90,
    totalPieces: 18,
    sizesAvailable: ["10", "12", "14"],
    colors: ["Preto", "Azul", "Cinza"],
    material: "poliester",
    description: "Kit esportivo completo: 6 Camisetas dry-fit, 6 Bermudas esportivas, 4 Shorts de treino, 2 Jaquetas leves.",
    images: [
      "https://placehold.co/600x800/EEE/31343C?text=Esportivo+1",
      "https://placehold.co/600x800/EEE/31343C?text=Esportivo+2"
    ],
    videos: [],
    items: [],
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: "Kit Casual Básico Unissex",
    brand: "basic",
    gender: "unisex",
    season: 'primavera',
    category: 'camisetas',
    ageRange: 'kids',
    style: ['casual', 'escola'],
    minQuantity: 25,
    availability: 'em_estoque',
    price: 189.90,
    totalPieces: 25,
    sizesAvailable: ["4", "6", "8", "10", "12"],
    colors: ["Branco", "Preto", "Cinza", "Marinho"],
    material: "algodao",
    description: "Kit básico essencial: 10 Camisetas lisas, 8 Camisetas estampadas, 5 Regatas, 2 Polos.",
    images: [
      "https://placehold.co/600x800/EEE/31343C?text=Casual+Unissex+1"
    ],
    videos: [],
    items: [],
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    name: "Kit Praia & Piscina Diversão",
    brand: "premium",
    gender: "girl",
    season: 'verao',
    category: 'acessorios',
    ageRange: 'kids',
    style: ['praia'],
    minQuantity: 12,
    availability: 'pre_venda',
    price: 269.90,
    totalPieces: 12,
    sizesAvailable: ["4", "6", "8", "10"],
    colors: ["Rosa", "Azul", "Amarelo"],
    material: "poliester",
    description: "Coleção verão praia: 6 Maiôs estampados, 4 Biquínis infantis, 2 Saídas de praia.",
    images: [
      "https://placehold.co/600x800/EEE/31343C?text=Praia+1"
    ],
    videos: ["#"],
    items: [],
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '7',
    name: "Kit Pijamas Sonhos Felizes",
    brand: "basic",
    gender: "unisex",
    season: 'inverno',
    category: 'pijamas',
    ageRange: 'toddler',
    style: ['dormir'],
    minQuantity: 20,
    availability: 'em_estoque',
    price: 229.90,
    totalPieces: 20,
    sizesAvailable: ["2", "4", "6", "8"],
    colors: ["Azul", "Rosa", "Verde"],
    material: "algodao",
    description: "Kit de pijamas confortáveis: 8 Pijamas completos, 4 Camisolas, 3 Shorts de dormir.",
    images: [
      "https://placehold.co/600x800/EEE/31343C?text=Pijamas+1"
    ],
    videos: [],
    items: [],
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '9',
    name: "Kit Inverno Quentinho",
    brand: "premium",
    gender: "unisex",
    season: 'inverno',
    category: 'moletons',
    ageRange: 'teens',
    style: ['inverno', 'casual'],
    minQuantity: 15,
    availability: 'em_estoque',
    price: 399.90,
    totalPieces: 15,
    sizesAvailable: ["12", "14", "16"],
    colors: ["Vermelho", "Azul", "Preto"],
    material: "moletom",
    description: "Kit inverno completo: 5 Moletons com capuz, 4 Calças de moletom, 3 Jaquetas corta-vento, 3 Gorros.",
    images: [
      "https://placehold.co/600x800/EEE/31343C?text=Inverno+1"
    ],
    videos: [],
    items: [],
    active: true,
    createdAt: new Date().toISOString()
  },
  // === KITS PARA N8N API ===
  {
    id: '10',
    name: "Kit Verão Tropical",
    brand: "premium",
    gender: "bebe",
    season: 'verao',
    category: 'conjuntos',
    ageRange: 'baby',
    style: ['verao', 'casual'],
    minQuantity: 3,
    availability: 'em_estoque',
    price: 89.90,
    totalPieces: 3,
    sizesAvailable: ["6-9 meses", "9-12 meses"],
    colors: ["Azul/Amarelo", "Verde/Laranja"],
    material: "algodao",
    description: "Kit completo para aproveitar o verão com conforto e estilo. Peças leves e frescas para os dias quentes. Inclui Body Manga Curta Tropical (Carter's), Shorts Saruel (Tip Top), Chapéu de Praia (Pimpolho).",
    images: [
      "https://placehold.co/600x800/87CEEB/31343C?text=Kit+Verao+Tropical"
    ],
    videos: [],
    items: [
      { productId: 'body-tropical', productName: "Body Manga Curta Tropical", quantity: 1 },
      { productId: 'shorts-saruel', productName: "Shorts Saruel", quantity: 1 },
      { productId: 'chapeu-praia', productName: "Chapéu de Praia", quantity: 1 }
    ],
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '11',
    name: "Kit Inverno Quentinho Baby",
    brand: "basic",
    gender: "bebe",
    season: 'inverno',
    category: 'conjuntos',
    ageRange: 'rn',
    style: ['inverno', 'casual'],
    minQuantity: 5,
    availability: 'em_estoque',
    price: 120.00,
    totalPieces: 5,
    sizesAvailable: ["RN", "1-3 meses"],
    colors: ["Rosa/Branco", "Azul/Cinza", "Bege"],
    material: "plush",
    description: "Kit aconchegante para os dias frios. Peças macias e quentinhas para manter seu bebê protegido. Inclui Macacão Plush (Gerber), Body Térmico (Carter's), Calça com Pé (Tip Top), Touca e Luvas (Pimpolho).",
    images: [
      "https://placehold.co/600x800/FFB6C1/31343C?text=Kit+Inverno+Baby"
    ],
    videos: [],
    items: [
      { productId: 'macacao-plush', productName: "Macacão Plush com Capuz", quantity: 1 },
      { productId: 'body-termico', productName: "Body Manga Longa Térmico", quantity: 1 },
      { productId: 'calca-pe', productName: "Calça com Pé", quantity: 1 },
      { productId: 'touca-malha', productName: "Touca de Malha", quantity: 1 },
      { productId: 'luvas-rn', productName: "Luvas Antiarranhão", quantity: 1 }
    ],
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '12',
    name: "Kit Passeio Chique",
    brand: "luxury",
    gender: "boy",
    season: 'primavera',
    category: 'conjuntos',
    ageRange: 'baby',
    style: ['social', 'festa'],
    minQuantity: 2,
    availability: 'em_estoque',
    price: 150.00,
    totalPieces: 4,
    sizesAvailable: ["3-6 meses"],
    colors: ["Marinho/Branco", "Bordô/Bege"],
    material: "algodao",
    description: "Kit elegante para passeios especiais. Peças sofisticadas para seu bebê arrasar em qualquer ocasião. Inclui Conjunto Social (Paola Da Vinci), Sapatinho Mocassim (Pimpolho), Blazer Mini e Gravata Borboleta (Tip Top).",
    images: [
      "https://placehold.co/600x800/1E3A5F/FFFFFF?text=Kit+Passeio+Chique"
    ],
    videos: [],
    items: [
      { productId: 'conjunto-social', productName: "Conjunto Social Camisa + Calça", quantity: 1 },
      { productId: 'sapatinho-mocassim', productName: "Sapatinho Mocassim", quantity: 1 },
      { productId: 'blazer-mini', productName: "Blazer Mini", quantity: 1 },
      { productId: 'gravata-borboleta', productName: "Gravata Borboleta", quantity: 1 }
    ],
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '13',
    name: "Kit Primeiros Dias",
    brand: "basic",
    gender: "unisex",
    season: 'todas',
    category: 'conjuntos',
    ageRange: 'rn',
    style: ['casual', 'basico'],
    minQuantity: 10,
    availability: 'em_estoque',
    price: 78.50,
    totalPieces: 7,
    sizesAvailable: ["RN"],
    colors: ["Branco", "Amarelo Claro", "Verde Água"],
    material: "suedine",
    description: "Kit essencial para recém-nascidos. Tudo que você precisa para os primeiros dias do bebê em casa. Inclui Body Kimono (3 un - Gerber), Calça com Pé (2 un - Carter's), Touca (Pimpolho), Meias RN (Tip Top).",
    images: [
      "https://placehold.co/600x800/FFFACD/31343C?text=Kit+Primeiros+Dias"
    ],
    videos: [],
    items: [
      { productId: 'body-kimono', productName: "Body Kimono Manga Longa", quantity: 3 },
      { productId: 'calca-pe-rn', productName: "Calça com Pé RN", quantity: 2 },
      { productId: 'touca-suedine', productName: "Touca Suedine", quantity: 1 },
      { productId: 'meias-rn', productName: "Par de Meias RN", quantity: 1 }
    ],
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '14',
    name: "Kit Festinha",
    brand: "luxury",
    gender: "girl",
    season: 'todas',
    category: 'vestidos',
    ageRange: 'baby',
    style: ['festa', 'social'],
    minQuantity: 1,
    availability: 'promocao',
    price: 95.00,
    totalPieces: 4,
    sizesAvailable: ["9-12 meses"],
    colors: ["Rosa/Dourado", "Azul/Prata"],
    material: "tule",
    description: "Kit especial para festas e comemorações. Seu bebê será a estrela de qualquer evento! Inclui Vestido de Festa (Paraíso), Tiara com Laço (Pimpolho), Sapatilha de Festa e Calcinha Tapa Fralda (Tip Top/Carter's).",
    images: [
      "https://placehold.co/600x800/FFD700/31343C?text=Kit+Festinha"
    ],
    videos: [],
    items: [
      { productId: 'vestido-festa', productName: "Vestido de Festa com Tule", quantity: 1 },
      { productId: 'tiara-laco', productName: "Tiara com Laço", quantity: 1 },
      { productId: 'sapatilha-festa', productName: "Sapatilha de Festa", quantity: 1 },
      { productId: 'calcinha-tapa-fralda', productName: "Calcinha Tapa Fralda", quantity: 1 }
    ],
    active: true,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_STOCK_HISTORY: StockMovement[] = [];
