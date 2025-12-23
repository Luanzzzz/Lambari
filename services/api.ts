import { Product, Category, Kit, DashboardStats, StockMovement, BulkImportReport, Brand, ImportValidationResult, GenderType } from '../types';
import { INITIAL_BRANDS, INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_KITS, INITIAL_STOCK_HISTORY } from './mockData';
import { supabase } from './supabase';

// ============================================
// INTERFACES
// ============================================

export interface KitFilters {
  search?: string;
  gender?: string | string[];
  brand?: string | string[];
  category?: string | string[];
  priceRange?: [number, number];
  season?: string;
  ageRange?: string;
  availability?: string;
}

// ============================================
// SUPABASE API
// All entities fully migrated to Supabase ✅
// No LocalStorage dependencies remaining
// ============================================

const STORAGE_KEYS = {
  PRODUCTS: 'lambari_products',
  BRANDS: 'lambari_brands',
  CATEGORIES: 'lambari_categories',
  KITS: 'lambari_kits',
  STOCK_HISTORY: 'lambari_stock_history',
};

// Simulate network delay for realistic UI behavior
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize localStorage with mock data on first load (browser only)
const initializeStorage = () => {
  // Skip initialization in Node.js environment (e.g., during tests)
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }

  // All entities now use Supabase - no localStorage initialization needed
  // if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
  //   localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  // }
  // if (!localStorage.getItem(STORAGE_KEYS.BRANDS)) {
  //   localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(INITIAL_BRANDS));
  // }
  // if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
  //   localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  // }
  // if (!localStorage.getItem(STORAGE_KEYS.KITS)) {
  //   localStorage.setItem(STORAGE_KEYS.KITS, JSON.stringify(INITIAL_KITS));
  // }
  // if (!localStorage.getItem(STORAGE_KEYS.STOCK_HISTORY)) {
  //   localStorage.setItem(STORAGE_KEYS.STOCK_HISTORY, JSON.stringify(INITIAL_STOCK_HISTORY));
  // }
};

// Initialize on module load
initializeStorage();

// Helper: Generate simple ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Helper: Save to localStorage
const saveToStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Helper: Get from localStorage
const getFromStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// Local helper to save files without external dependencies
const saveAs = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// ============================================
// HELPERS: Transformação DB ↔ TypeScript
// ============================================

/**
 * Transforma objeto do banco (snake_case) para TypeScript (camelCase)
 */
const transformProductFromDB = (dbProduct: any): Product => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || '',
    sku: dbProduct.sku,
    brand: dbProduct.brand,
    category: dbProduct.category,
    subcategory: dbProduct.subcategory,
    price: parseFloat(dbProduct.price),
    costPrice: dbProduct.cost_price ? parseFloat(dbProduct.cost_price) : 0,
    promoPrice: dbProduct.promo_price ? parseFloat(dbProduct.promo_price) : undefined,
    isPromo: dbProduct.is_promo || false,
    gender: dbProduct.gender,
    images: dbProduct.images || [],
    mainImage: dbProduct.main_image,
    colors: dbProduct.colors || [],
    stock: dbProduct.stock || {},
    inStock: dbProduct.in_stock,
    active: dbProduct.active,
    featured: dbProduct.featured || false,
    createdAt: dbProduct.created_at,
  };
};

const transformBrandFromDB = (dbBrand: any): Brand => {
  return {
    id: dbBrand.id,
    name: dbBrand.name,
    slug: dbBrand.slug,
    color: dbBrand.color,
    textColor: dbBrand.text_color,
    active: dbBrand.active,
    order: dbBrand.order,
  };
};

const transformCategoryFromDB = (dbCategory: any): Category => {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    slug: dbCategory.slug,
    type: dbCategory.type,
    icon: dbCategory.icon,
    color: dbCategory.color,
    description: dbCategory.description,
    active: dbCategory.active,
    order: dbCategory.order,
    parent: dbCategory.parent_id,
  };
};

const transformKitFromDB = (dbKit: any): Kit => {
  console.log('🔄 Transformando kit do DB:', dbKit.name);

  // CRITICAL FIX: Garantir que arrays existam e sejam arrays válidos
  const ensureArray = (value: any): any[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    // Se for string, tentar parsear JSON
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    // Se for objeto com length, converter para array
    if (typeof value === 'object' && 'length' in value) {
      return Array.from(value);
    }
    console.warn('⚠️ Valor não é array:', value);
    return [];
  };

  const images = ensureArray(dbKit.images);
  const videos = ensureArray(dbKit.videos);
  const sizesAvailable = ensureArray(dbKit.sizes_available);
  const colors = ensureArray(dbKit.colors);
  const style = ensureArray(dbKit.style);

  const transformedKit: Kit = {
    id: dbKit.id,
    name: dbKit.name || '',
    description: dbKit.description || '',
    price: parseFloat(dbKit.price) || 0,
    totalPieces: dbKit.total_pieces || 0,
    items: [], // Kit items are loaded separately
    images: images,
    videos: videos,
    brand: dbKit.brand || '',
    gender: dbKit.gender || 'unisex',
    season: dbKit.season,
    ageRange: dbKit.age_range,
    style: style,
    category: dbKit.category,
    minQuantity: dbKit.min_quantity,
    availability: dbKit.availability,
    sizesAvailable: sizesAvailable,
    colors: colors,
    material: dbKit.material || '',
    active: dbKit.active !== false,
    createdAt: dbKit.created_at,
  };

  console.log('✅ Kit transformado:', {
    name: transformedKit.name,
    images: transformedKit.images.length,
    videos: transformedKit.videos.length,
  });

  return transformedKit;
};

const transformStockMovementFromDB = (dbMovement: any): StockMovement => {
  return {
    id: dbMovement.id,
    productId: dbMovement.product_id,
    productName: dbMovement.product_name || '',
    size: dbMovement.size || '',
    quantity: dbMovement.quantity_change,
    type: dbMovement.movement_type,
    user: dbMovement.user_id || 'Sistema',
    date: dbMovement.created_at,
  };
};

// Interfaces temporárias (até migrar types.ts)
interface Seller {
  id: string;
  name: string;
  whatsapp: string;
  email?: string;
  active: boolean;
  orderCount: number;
  createdAt: string;
}

interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  position: number;
  active: boolean;
  createdAt: string;
}

const transformSellerFromDB = (dbSeller: any): Seller => {
  return {
    id: dbSeller.id,
    name: dbSeller.name,
    whatsapp: dbSeller.whatsapp,
    email: dbSeller.email,
    active: dbSeller.active,
    orderCount: dbSeller.order_count || 0,
    createdAt: dbSeller.created_at,
  };
};

const transformBannerFromDB = (dbBanner: any): Banner => {
  return {
    id: dbBanner.id,
    title: dbBanner.title,
    subtitle: dbBanner.subtitle,
    imageUrl: dbBanner.image_url,
    linkUrl: dbBanner.link_url,
    position: dbBanner.position || 0,
    active: dbBanner.active,
    createdAt: dbBanner.created_at,
  };
};

const transformOrderFromDB = (dbOrder: any): Order => {
  // Mapear status do DB para o tipo Order
  let orderStatus: Order['status'] = 'pending';
  switch (dbOrder.status) {
    case 'pending_whatsapp':
    case 'confirmed':
      orderStatus = 'confirmed';
      break;
    case 'preparing':
      orderStatus = 'preparing';
      break;
    case 'shipped':
      orderStatus = 'in_transit';
      break;
    case 'delivered':
      orderStatus = 'delivered';
      break;
    case 'cancelled':
      orderStatus = 'cancelled';
      break;
    default:
      orderStatus = 'pending';
  }

  return {
    id: dbOrder.id,
    date: dbOrder.created_at,
    total: parseFloat(dbOrder.total),
    status: orderStatus,
    items: dbOrder.order_items?.map((item: any) => ({
      name: item.item_name || 'Produto',
      quantity: item.quantity,
      price: parseFloat(item.unit_price),
    })) || [],
    customer: {
      name: dbOrder.customer_name,
      company: dbOrder.customer_city || '',
      email: '',
      phone: dbOrder.customer_phone,
    },
  };
};

// ============================================
// API SERVICE CLASS
// ============================================

class ApiService {
  // === BRANDS ===
  async getBrands(): Promise<Brand[]> {
    await delay();

    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;

      return (data || []).map(transformBrandFromDB);
    } catch (error: any) {
      console.error('Erro ao buscar marcas:', error.message);
      throw new Error('Falha ao carregar marcas do servidor');
    }
  }

  async createBrand(brandData: Omit<Brand, 'id' | 'slug'>): Promise<Brand> {
    await delay();

    try {
      const slug = brandData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const { data, error } = await supabase
        .from('brands')
        .insert([{
          name: brandData.name,
          slug,
          color: brandData.color,
          text_color: brandData.textColor,
          active: brandData.active !== false,
          order: brandData.order || 0,
        }])
        .select()
        .single();

      if (error) throw error;

      return transformBrandFromDB(data);
    } catch (error: any) {
      console.error('Erro ao criar marca:', error.message);
      throw new Error('Falha ao criar marca no servidor');
    }
  }

  async updateBrand(id: string, updates: Partial<Brand>): Promise<Brand> {
    await delay();

    try {
      const dbUpdates: any = {};

      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.textColor !== undefined) dbUpdates.text_color = updates.textColor;
      if (updates.active !== undefined) dbUpdates.active = updates.active;
      if (updates.order !== undefined) dbUpdates.order = updates.order;

      const { data, error } = await supabase
        .from('brands')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return transformBrandFromDB(data);
    } catch (error: any) {
      console.error('Erro ao atualizar marca:', error.message);
      throw new Error('Falha ao atualizar marca no servidor');
    }
  }

  async deleteBrand(id: string): Promise<void> {
    await delay();

    try {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Erro ao deletar marca:', error.message);
      throw new Error('Falha ao deletar marca do servidor');
    }
  }

  // === CATEGORIES ===
  async getCategories(): Promise<Category[]> {
    await delay();

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;

      return (data || []).map(transformCategoryFromDB);
    } catch (error: any) {
      console.error('Erro ao buscar categorias:', error.message);
      throw new Error('Falha ao carregar categorias do servidor');
    }
  }

  async createCategory(categoryData: Omit<Category, 'id'>): Promise<Category> {
    await delay();

    try {
      const slug = categoryData.name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: categoryData.name,
          slug,
          type: categoryData.type,
          icon: categoryData.icon,
          color: categoryData.color,
          description: categoryData.description,
          active: categoryData.active !== false,
          order: categoryData.order || 0,
          parent_id: categoryData.parent || null,
        }])
        .select()
        .single();

      if (error) throw error;

      return transformCategoryFromDB(data);
    } catch (error: any) {
      console.error('Erro ao criar categoria:', error.message);
      throw new Error('Falha ao criar categoria no servidor');
    }
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    await delay();

    try {
      const dbUpdates: any = {};

      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.active !== undefined) dbUpdates.active = updates.active;
      if (updates.order !== undefined) dbUpdates.order = updates.order;
      if (updates.parent !== undefined) dbUpdates.parent_id = updates.parent;

      const { data, error } = await supabase
        .from('categories')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return transformCategoryFromDB(data);
    } catch (error: any) {
      console.error('Erro ao atualizar categoria:', error.message);
      throw new Error('Falha ao atualizar categoria no servidor');
    }
  }

  async deleteCategory(id: string): Promise<void> {
    await delay();

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Erro ao deletar categoria:', error.message);
      throw new Error('Falha ao deletar categoria do servidor');
    }
  }

  // === KITS ===
  async getKits(filters?: KitFilters): Promise<Kit[]> {
    await delay();

    console.log('📦 API: Buscando kits...', filters ? 'com filtros' : 'sem filtros');

    try {
      const { data, error } = await supabase
        .from('kits')
        .select('*')
        .order('created_at', { ascending: false});

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }

      console.log('📦 Kits retornados do Supabase:', data?.length || 0);

      // CRITICAL FIX: Garantir que data é array
      if (!data || !Array.isArray(data)) {
        console.warn('⚠️ Data não é array:', data);
        return [];
      }

      // Transformar cada kit com tratamento de erro individual
      const kits: Kit[] = [];

      for (const dbKit of data) {
        try {
          const kit = transformKitFromDB(dbKit);
          kits.push(kit);
        } catch (err) {
          console.error('❌ Erro ao transformar kit:', dbKit.name, err);
          // Continua processando outros kits
        }
      }

      // Log detalhado de cada kit
      kits.forEach(kit => {
        console.log(`   Kit: ${kit.name}`, {
          images: kit.images?.length || 0,
          videos: kit.videos?.length || 0,
        });
      });

      // Aplicar filtros se fornecidos
      let filteredKits = kits;

      if (filters) {
        // Filtro por search (nome)
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredKits = filteredKits.filter(kit =>
            kit.name.toLowerCase().includes(searchLower) ||
            kit.description?.toLowerCase().includes(searchLower)
          );
        }

        // Filtro por gênero
        if (filters.gender) {
          const genders = Array.isArray(filters.gender) ? filters.gender : [filters.gender];
          if (genders.length > 0) {
            filteredKits = filteredKits.filter(kit => genders.includes(kit.gender));
          }
        }

        // Filtro por marca
        if (filters.brand) {
          const brands = Array.isArray(filters.brand) ? filters.brand : [filters.brand];
          if (brands.length > 0) {
            filteredKits = filteredKits.filter(kit => brands.includes(kit.brand));
          }
        }

        // Filtro por categoria
        if (filters.category) {
          const categories = Array.isArray(filters.category) ? filters.category : [filters.category];
          if (categories.length > 0) {
            filteredKits = filteredKits.filter(kit => categories.includes(kit.category || ''));
          }
        }

        // Filtro por faixa de preço
        if (filters.priceRange) {
          const [min, max] = filters.priceRange;
          filteredKits = filteredKits.filter(kit => kit.price >= min && kit.price <= max);
        }

        // Filtro por temporada
        if (filters.season) {
          filteredKits = filteredKits.filter(kit => kit.season === filters.season);
        }

        // Filtro por faixa etária
        if (filters.ageRange) {
          filteredKits = filteredKits.filter(kit => kit.ageRange === filters.ageRange);
        }

        // Filtro por disponibilidade
        if (filters.availability) {
          filteredKits = filteredKits.filter(kit => kit.availability === filters.availability);
        }

        console.log('📦 Kits após aplicar filtros:', filteredKits.length);
      }

      return filteredKits;
    } catch (error: any) {
      console.error('❌ Erro ao buscar kits:', error.message);
      throw new Error('Falha ao carregar kits do servidor');
    }
  }

  async createKit(kit: Omit<Kit, 'id' | 'createdAt'>): Promise<Kit> {
    await delay();

    try {
      const { data, error } = await supabase
        .from('kits')
        .insert([{
          name: kit.name,
          description: kit.description,
          price: kit.price,
          total_pieces: kit.totalPieces,
          images: kit.images || [],
          videos: kit.videos || [],
          brand: kit.brand,
          gender: kit.gender,
          season: kit.season,
          age_range: kit.ageRange,
          style: kit.style || [],
          category: kit.category,
          min_quantity: kit.minQuantity,
          availability: kit.availability,
          sizes_available: kit.sizesAvailable || [],
          colors: kit.colors || [],
          material: kit.material,
          active: kit.active !== false,
        }])
        .select()
        .single();

      if (error) throw error;

      return transformKitFromDB(data);
    } catch (error: any) {
      console.error('Erro ao criar kit:', error.message);
      throw new Error('Falha ao criar kit no servidor');
    }
  }

  async updateKit(id: string, updates: Partial<Kit>): Promise<Kit> {
    await delay();

    try {
      const dbUpdates: any = {};

      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.totalPieces !== undefined) dbUpdates.total_pieces = updates.totalPieces;
      if (updates.images !== undefined) dbUpdates.images = updates.images;
      if (updates.videos !== undefined) dbUpdates.videos = updates.videos;
      if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
      if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
      if (updates.season !== undefined) dbUpdates.season = updates.season;
      if (updates.ageRange !== undefined) dbUpdates.age_range = updates.ageRange;
      if (updates.style !== undefined) dbUpdates.style = updates.style;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.minQuantity !== undefined) dbUpdates.min_quantity = updates.minQuantity;
      if (updates.availability !== undefined) dbUpdates.availability = updates.availability;
      if (updates.sizesAvailable !== undefined) dbUpdates.sizes_available = updates.sizesAvailable;
      if (updates.colors !== undefined) dbUpdates.colors = updates.colors;
      if (updates.material !== undefined) dbUpdates.material = updates.material;
      if (updates.active !== undefined) dbUpdates.active = updates.active;

      const { data, error } = await supabase
        .from('kits')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return transformKitFromDB(data);
    } catch (error: any) {
      console.error('Erro ao atualizar kit:', error.message);
      throw new Error('Falha ao atualizar kit no servidor');
    }
  }

  async deleteKit(id: string): Promise<void> {
    await delay();

    console.log('🗑️ API: Tentando deletar kit', id);

    try {
      const { error, status, statusText } = await supabase
        .from('kits')
        .delete()
        .eq('id', id);

      console.log('📡 Resposta do Supabase:', { error, status, statusText });

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }

      console.log('✅ Kit deletado com sucesso no Supabase');
    } catch (error: any) {
      console.error('❌ Erro ao deletar kit:', error.message);
      throw new Error('Falha ao deletar kit do servidor');
    }
  }

  // === PRODUCTS ===
  async getProducts(): Promise<Product[]> {
    await delay();

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(transformProductFromDB);
    } catch (error: any) {
      console.error('Erro ao buscar produtos:', error.message);
      throw new Error('Falha ao carregar produtos do servidor');
    }
  }

  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'inStock'>): Promise<Product> {
    await delay();

    try {
      const totalStock = Object.values(product.stock).reduce((a, b) => a + b, 0);

      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: product.name,
          description: product.description || '',
          sku: product.sku,
          brand: product.brand,
          category: product.category,
          subcategory: product.subcategory,
          price: product.price,
          cost_price: product.costPrice,
          promo_price: product.promoPrice,
          is_promo: product.isPromo || false,
          gender: product.gender,
          images: product.images || [],
          main_image: product.mainImage,
          colors: product.colors || [],
          stock: product.stock || {},
          in_stock: totalStock > 0,
          active: product.active !== false,
          featured: product.featured || false,
        }])
        .select()
        .single();

      if (error) throw error;

      return transformProductFromDB(data);
    } catch (error: any) {
      console.error('Erro ao criar produto:', error.message);
      throw new Error('Falha ao criar produto no servidor');
    }
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    await delay();

    try {
      // Transformar camelCase para snake_case
      const dbUpdates: any = {};

      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.sku !== undefined) dbUpdates.sku = updates.sku;
      if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.subcategory !== undefined) dbUpdates.subcategory = updates.subcategory;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.costPrice !== undefined) dbUpdates.cost_price = updates.costPrice;
      if (updates.promoPrice !== undefined) dbUpdates.promo_price = updates.promoPrice;
      if (updates.isPromo !== undefined) dbUpdates.is_promo = updates.isPromo;
      if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
      if (updates.images !== undefined) dbUpdates.images = updates.images;
      if (updates.mainImage !== undefined) dbUpdates.main_image = updates.mainImage;
      if (updates.colors !== undefined) dbUpdates.colors = updates.colors;
      if (updates.stock !== undefined) {
        dbUpdates.stock = updates.stock;
        const total = Object.values(updates.stock).reduce((a, b) => a + (b as number), 0);
        dbUpdates.in_stock = total > 0;
      }
      if (updates.inStock !== undefined) dbUpdates.in_stock = updates.inStock;
      if (updates.active !== undefined) dbUpdates.active = updates.active;
      if (updates.featured !== undefined) dbUpdates.featured = updates.featured;

      const { data, error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return transformProductFromDB(data);
    } catch (error: any) {
      console.error('Erro ao atualizar produto:', error.message);
      throw new Error('Falha ao atualizar produto no servidor');
    }
  }

  async patchProduct<K extends keyof Product>(id: string, field: K, value: Product[K]): Promise<Product> {
    await delay(150); // Delay menor para operações rápidas

    try {
      // Converter camelCase para snake_case se necessário
      const fieldMap: Record<string, string> = {
        'isPromo': 'is_promo',
        'promoPrice': 'promo_price',
        'costPrice': 'cost_price',
        'mainImage': 'main_image',
        'inStock': 'in_stock',
      };

      const dbField = fieldMap[field as string] || field;

      const { data, error } = await supabase
        .from('products')
        .update({ [dbField]: value })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return transformProductFromDB(data);
    } catch (error: any) {
      console.error(`Erro ao atualizar ${String(field)}:`, error.message);
      throw new Error(`Falha ao atualizar ${String(field)} do produto`);
    }
  }

  async updateProductStock(id: string, size: string, quantity: number): Promise<Product> {
    await delay();

    try {
      // Buscar produto atual para calcular o novo estoque
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (!product) throw new Error('Product not found');

      // Atualizar estoque
      const newStock = {
        ...product.stock,
        [size]: quantity,
      };

      const totalStock = Object.values(newStock).reduce((a, b) => a + (b as number), 0);

      // Atualizar no Supabase
      const { data: updated, error: updateError } = await supabase
        .from('products')
        .update({
          stock: newStock,
          in_stock: totalStock > 0,
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Log stock movement no Supabase
      try {
        const quantityChange = quantity - (product.stock[size] || 0);
        await supabase
          .from('stock_movements')
          .insert([{
            product_id: id,
            movement_type: 'adjustment',
            quantity_change: quantityChange,
            size,
            user_id: 'Admin',
          }]);
      } catch (e) {
        console.warn('Could not log stock movement:', e);
      }

      return transformProductFromDB(updated);
    } catch (error: any) {
      console.error('Erro ao atualizar estoque:', error.message);
      throw new Error('Falha ao atualizar estoque do produto');
    }
  }

  async deleteProduct(id: string): Promise<void> {
    await delay();

    console.log('🗑️ API: Tentando deletar produto', id);

    try {
      const { error, status, statusText } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      console.log('📡 Resposta do Supabase:', { error, status, statusText });

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }

      console.log('✅ Produto deletado com sucesso no Supabase');
    } catch (error: any) {
      console.error('❌ Erro ao deletar produto:', error.message);
      throw new Error('Falha ao deletar produto do servidor');
    }
  }

  // === STOCK HISTORY ===
  async getStockHistory(): Promise<StockMovement[]> {
    await delay();

    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          products (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(movement => ({
        ...transformStockMovementFromDB(movement),
        productName: movement.products?.name || 'Produto Removido',
      }));
    } catch (error: any) {
      console.error('Erro ao buscar histórico de estoque:', error.message);
      throw new Error('Falha ao carregar histórico de estoque');
    }
  }

  async createStockMovement(movement: Omit<StockMovement, 'id' | 'date'>): Promise<StockMovement> {
    await delay();

    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .insert([{
          product_id: movement.productId,
          movement_type: movement.type,
          quantity_change: movement.quantity,
          size: movement.size,
          user_id: movement.user,
        }])
        .select(`
          *,
          products (name)
        `)
        .single();

      if (error) throw error;

      return {
        ...transformStockMovementFromDB(data),
        productName: data.products?.name || 'Produto Removido',
      };
    } catch (error: any) {
      console.error('Erro ao criar movimentação de estoque:', error.message);
      throw new Error('Falha ao registrar movimentação de estoque');
    }
  }

  // === SELLERS ===
  async getSellers(): Promise<Seller[]> {
    await delay();

    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      return (data || []).map(transformSellerFromDB);
    } catch (error: any) {
      console.error('Erro ao buscar vendedores:', error.message);
      throw new Error('Falha ao carregar vendedores');
    }
  }

  async createSeller(seller: Omit<Seller, 'id' | 'createdAt' | 'orderCount'>): Promise<Seller> {
    await delay();

    try {
      const { data, error } = await supabase
        .from('sellers')
        .insert([{
          name: seller.name,
          whatsapp: seller.whatsapp,
          email: seller.email,
          active: seller.active !== false,
        }])
        .select()
        .single();

      if (error) throw error;

      return transformSellerFromDB(data);
    } catch (error: any) {
      console.error('Erro ao criar vendedor:', error.message);
      throw new Error('Falha ao criar vendedor');
    }
  }

  async updateSeller(id: string, updates: Partial<Seller>): Promise<Seller> {
    await delay();

    try {
      const dbUpdates: any = {};

      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.whatsapp !== undefined) dbUpdates.whatsapp = updates.whatsapp;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.active !== undefined) dbUpdates.active = updates.active;

      const { data, error } = await supabase
        .from('sellers')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return transformSellerFromDB(data);
    } catch (error: any) {
      console.error('Erro ao atualizar vendedor:', error.message);
      throw new Error('Falha ao atualizar vendedor');
    }
  }

  async deleteSeller(id: string): Promise<void> {
    await delay();

    try {
      const { error } = await supabase
        .from('sellers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Erro ao deletar vendedor:', error.message);
      throw new Error('Falha ao deletar vendedor');
    }
  }

  // === BANNERS ===
  async getBanners(): Promise<Banner[]> {
    await delay();

    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;

      return (data || []).map(transformBannerFromDB);
    } catch (error: any) {
      console.error('Erro ao buscar banners:', error.message);
      throw new Error('Falha ao carregar banners');
    }
  }

  async createBanner(banner: Omit<Banner, 'id' | 'createdAt'>): Promise<Banner> {
    await delay();

    try {
      const { data, error } = await supabase
        .from('banners')
        .insert([{
          title: banner.title,
          subtitle: banner.subtitle,
          image_url: banner.imageUrl,
          link_url: banner.linkUrl,
          position: banner.position || 0,
          active: banner.active !== false,
        }])
        .select()
        .single();

      if (error) throw error;

      return transformBannerFromDB(data);
    } catch (error: any) {
      console.error('Erro ao criar banner:', error.message);
      throw new Error('Falha ao criar banner');
    }
  }

  async updateBanner(id: string, updates: Partial<Banner>): Promise<Banner> {
    await delay();

    try {
      const dbUpdates: any = {};

      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.subtitle !== undefined) dbUpdates.subtitle = updates.subtitle;
      if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
      if (updates.linkUrl !== undefined) dbUpdates.link_url = updates.linkUrl;
      if (updates.position !== undefined) dbUpdates.position = updates.position;
      if (updates.active !== undefined) dbUpdates.active = updates.active;

      const { data, error } = await supabase
        .from('banners')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return transformBannerFromDB(data);
    } catch (error: any) {
      console.error('Erro ao atualizar banner:', error.message);
      throw new Error('Falha ao atualizar banner');
    }
  }

  async deleteBanner(id: string): Promise<void> {
    await delay();

    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Erro ao deletar banner:', error.message);
      throw new Error('Falha ao deletar banner');
    }
  }

  // === ORDERS ===
  async getOrders(): Promise<Order[]> {
    await delay();

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            item_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(transformOrderFromDB);
    } catch (error: any) {
      console.error('Erro ao buscar pedidos:', error.message);
      throw new Error('Falha ao carregar pedidos');
    }
  }

  async createOrder(order: Omit<Order, 'id'>): Promise<Order> {
    await delay();

    try {
      // Mapear status do Order para o DB
      let dbStatus = 'pending_whatsapp';
      switch (order.status) {
        case 'confirmed':
          dbStatus = 'confirmed';
          break;
        case 'preparing':
          dbStatus = 'preparing';
          break;
        case 'in_transit':
          dbStatus = 'shipped';
          break;
        case 'delivered':
          dbStatus = 'delivered';
          break;
        case 'cancelled':
          dbStatus = 'cancelled';
          break;
        default:
          dbStatus = 'pending_whatsapp';
      }

      // Gerar order_number único
      const now = new Date();
      const year = now.getFullYear();
      const orderNumber = `LMB-${year}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;

      // Criar o pedido
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          order_number: orderNumber,
          customer_name: order.customer.name,
          customer_phone: order.customer.phone,
          customer_city: order.customer.company, // Usando company como city temporariamente
          total: order.total,
          status: dbStatus,
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Criar os items do pedido
      if (order.items && order.items.length > 0) {
        const orderItems = order.items.map((item, index) => ({
          order_id: orderData.id,
          item_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity,
          // Se productIds foi passado, usar o ID correspondente
          product_id: (order as any).productIds?.[index] || null,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }

      // Buscar o pedido completo com items
      const { data: fullOrder, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            item_name
          )
        `)
        .eq('id', orderData.id)
        .single();

      if (fetchError) throw fetchError;

      return transformOrderFromDB(fullOrder);
    } catch (error: any) {
      console.error('Erro ao criar pedido:', error.message);
      throw new Error('Falha ao criar pedido');
    }
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    await delay();

    try {
      const dbUpdates: any = {};

      if (updates.status !== undefined) {
        // Mapear status
        switch (updates.status) {
          case 'confirmed':
            dbUpdates.status = 'confirmed';
            break;
          case 'preparing':
            dbUpdates.status = 'preparing';
            break;
          case 'in_transit':
            dbUpdates.status = 'shipped';
            break;
          case 'delivered':
            dbUpdates.status = 'delivered';
            break;
          case 'cancelled':
            dbUpdates.status = 'cancelled';
            break;
          case 'pending':
            dbUpdates.status = 'pending_whatsapp';
            break;
        }
      }

      if (updates.total !== undefined) dbUpdates.total = updates.total;
      if (updates.customer?.name !== undefined) dbUpdates.customer_name = updates.customer.name;
      if (updates.customer?.phone !== undefined) dbUpdates.customer_phone = updates.customer.phone;
      if (updates.customer?.company !== undefined) dbUpdates.customer_city = updates.customer.company;

      const { data, error } = await supabase
        .from('orders')
        .update(dbUpdates)
        .eq('id', id)
        .select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            item_name
          )
        `)
        .single();

      if (error) throw error;

      return transformOrderFromDB(data);
    } catch (error: any) {
      console.error('Erro ao atualizar pedido:', error.message);
      throw new Error('Falha ao atualizar pedido');
    }
  }

  async deleteOrder(id: string): Promise<void> {
    await delay();

    try {
      // order_items serão deletados automaticamente por CASCADE
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Erro ao deletar pedido:', error.message);
      throw new Error('Falha ao deletar pedido');
    }
  }

  // === BULK IMPORT ===
  async downloadTemplate(format: 'xlsx' | 'csv'): Promise<void> {
    const headers = 'Nome,Preço,Preço de Custo,Marca,Gênero,Categoria,Estoque,SKU,Descrição';
    const exampleRow = 'Produto Exemplo,99.90,49.90,Marca X,boy,Conjuntos,10,SKU-001,Descrição do produto';
    const content = `${headers}\n${exampleRow}`;

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `template_importacao.csv`);
  }

  async parseAndValidateImport(file: File): Promise<ImportValidationResult[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split(/\r?\n/).filter(line => line.trim());

          if (lines.length < 2) {
            resolve([]);
            return;
          }

          const headers = this.parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());

          const columnMap: Record<string, keyof Product> = {
            'nome': 'name',
            'name': 'name',
            'preço': 'price',
            'preco': 'price',
            'price': 'price',
            'preço de custo': 'costPrice',
            'preco de custo': 'costPrice',
            'custo': 'costPrice',
            'marca': 'brand',
            'brand': 'brand',
            'gênero': 'gender',
            'genero': 'gender',
            'gender': 'gender',
            'categoria': 'category',
            'category': 'category',
            'estoque': 'stock',
            'stock': 'stock',
            'sku': 'sku',
            'descrição': 'description',
            'descricao': 'description',
            'description': 'description',
          };

          const headerMapping: { index: number; field: keyof Product }[] = [];
          headers.forEach((h, index) => {
            const field = columnMap[h];
            if (field) {
              headerMapping.push({ index, field });
            }
          });

          const results: ImportValidationResult[] = [];

          for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            const data: Partial<Product> = {};
            const messages: string[] = [];
            let status: 'valid' | 'warning' | 'error' = 'valid';

            headerMapping.forEach(({ index, field }) => {
              const value = values[index]?.trim();
              if (value) {
                switch (field) {
                  case 'name':
                  case 'sku':
                  case 'brand':
                  case 'description':
                  case 'category':
                    (data as any)[field] = value;
                    break;
                  case 'price':
                  case 'costPrice':
                    const numVal = parseFloat(value.replace(',', '.'));
                    if (!isNaN(numVal)) {
                      (data as any)[field] = numVal;
                    }
                    break;
                  case 'gender':
                    const genderMap: Record<string, GenderType> = {
                      'menino': 'boy', 'boy': 'boy',
                      'menina': 'girl', 'girl': 'girl',
                      'unissex': 'unisex', 'unisex': 'unisex',
                      'bebê': 'bebe', 'bebe': 'bebe',
                    };
                    data.gender = genderMap[value.toLowerCase()] || 'unisex';
                    break;
                  case 'stock':
                    const stockVal = parseInt(value, 10);
                    if (!isNaN(stockVal)) {
                      data.stock = { 'Único': stockVal };
                    }
                    break;
                }
              }
            });

            // Validate required fields
            if (!data.name) {
              messages.push('Nome do produto é obrigatório');
              status = 'error';
            }
            if (!data.price || data.price <= 0) {
              messages.push('Preço inválido ou ausente');
              status = 'error';
            }

            // Set defaults
            if (!data.stock) data.stock = { 'Único': 0 };
            if (!data.gender) data.gender = 'unisex';
            if (!data.brand) {
              messages.push('Marca não informada');
              if (status === 'valid') status = 'warning';
              data.brand = '';
            }
            if (!data.costPrice) data.costPrice = 0;
            if (!data.description) data.description = '';
            if (!data.sku) data.sku = '';
            if (!data.category) data.category = '';
            data.images = [];
            data.colors = [];
            data.isPromo = false;
            data.active = true;
            data.featured = false;

            results.push({
              row: i + 1,
              status,
              messages,
              data,
              originalData: values,
            });
          }

          resolve(results);
        } catch (err) {
          console.error('CSV parse error:', err);
          reject(err);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if ((char === ',' || char === ';') && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  async executeImport(validations: ImportValidationResult[]): Promise<BulkImportReport> {
    const validItems = validations.filter(v => v.status === 'valid' || v.status === 'warning');

    let successCount = 0;
    let errorCount = 0;

    for (const item of validItems) {
      try {
        await this.createProduct(item.data as Omit<Product, 'id' | 'createdAt' | 'inStock'>);
        successCount++;
        item.status = 'valid';
      } catch (err) {
        console.error('Failed to import product:', item.data.name, err);
        errorCount++;
        item.status = 'error';
        item.messages.push('Erro ao salvar');
      }
    }

    const errorItems = validations.filter(v => v.status === 'error').length;
    const warningItems = validations.filter(v => v.status === 'warning').length;

    return {
      totalRows: validations.length,
      successCount,
      warningCount: warningItems,
      errorCount: errorCount + (errorItems - errorCount),
      createdProducts: successCount,
      createdCategories: 0,
      createdBrands: 0,
      validations,
      timestamp: new Date().toISOString(),
    };
  }

  async importProductsBulk(file: File): Promise<BulkImportReport> {
    const validations = await this.parseAndValidateImport(file);
    return this.executeImport(validations);
  }

  // === DASHBOARD ===
  async getDashboardStats(): Promise<DashboardStats> {
    await delay();
    const products = getFromStorage<Product>(STORAGE_KEYS.PRODUCTS);
    const kits = getFromStorage<Kit>(STORAGE_KEYS.KITS);
    const categories = getFromStorage<Category>(STORAGE_KEYS.CATEGORIES);

    const totalStock = products.reduce((acc, p) => {
      return acc + Object.values(p.stock).reduce((a, b) => a + (b as number), 0);
    }, 0);

    const lowStock = products.filter(p => {
      const total = Object.values(p.stock).reduce((a, b) => a + (b as number), 0);
      return total > 0 && total < 10;
    }).length;

    const history = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        name: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        value: Math.floor(Math.random() * 2000) + 500,
      };
    });

    const topProducts = [
      { name: 'Kit Verão Premium', sales: 23, revenue: 5750 },
      { name: 'Kit Inverno Básico', sales: 18, revenue: 3240 },
      { name: 'Kit Escola', sales: 15, revenue: 2250 },
      { name: 'Kit Bebê Conforto', sales: 12, revenue: 1800 },
      { name: 'Vestido Festa Luxo', sales: 10, revenue: 1500 },
    ];

    return {
      totalKits: kits.length,
      totalProducts: products.length,
      totalCategories: categories.length,
      lowStockItems: lowStock,
      lowStock: lowStock,
      outOfStockItems: products.filter(p => !p.inStock).length,
      totalStockCount: totalStock,
      viewsToday: Math.floor(Math.random() * 500) + 100,
      totalSales: 25450.00,
      totalProfit: 8230.00,
      averageMargin: 32.4,
      ordersCount: 47,
      salesGrowth: 15,
      profitGrowth: 22,
      marginGrowth: 2.1,
      ordersGrowth: 12,
      salesHistory: history,
      topProducts: topProducts,
    };
  }

  async getStockHistory(): Promise<StockMovement[]> {
    await delay();
    const history = getFromStorage<StockMovement>(STORAGE_KEYS.STOCK_HISTORY);
    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // === UTILITY ===
  async clearAllProducts(): Promise<void> {
    await delay();

    try {
      // Deletar todos os produtos do Supabase
      const { error } = await supabase
        .from('products')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (workaround)

      if (error) throw error;

      console.log('All products deleted from Supabase');
    } catch (error: any) {
      console.error('Erro ao limpar produtos:', error.message);
      throw new Error('Falha ao limpar produtos do servidor');
    }
  }
}

export const api = new ApiService();
