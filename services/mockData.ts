
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
  }
];

export const INITIAL_STOCK_HISTORY: StockMovement[] = [];
