import { Product, Category, Kit, DashboardStats, StockMovement, BulkImportReport, Brand, ImportValidationResult, GenderType, SeasonType, AgeRangeType, AvailabilityType } from '../types';
import { supabase } from './supabase';

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

// UUID v4 generator
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export interface KitFilters {
  season?: SeasonType[];
  brand?: string[];
  gender?: GenderType[];
  category?: string[];
  ageRange?: AgeRangeType[];
  sizes?: string[];
  colors?: string[];
  priceRange?: { min: number; max: number };
  minQuantity?: number;
  material?: string[];
  style?: string[];
  availability?: AvailabilityType[];
  search?: string;
}

// === Data Mapping Helpers ===

// DB Schema: id, name, category_id, subcategory, price, cost_price, promo_price, stock(int), images(text[]), brand, gender, sku

// Map database row (snake_case) to Product (camelCase)
function mapDbToProduct(row: Record<string, unknown>): Product {
  // DB has stock as INTEGER, but frontend expects Record<string, number>
  // Convert integer stock to a single size entry for compatibility
  const stockVal = (row.stock as number) || 0;
  const stockObj: Record<string, number> = stockVal > 0 ? { 'Único': stockVal } : {};

  return {
    id: (row.id as string) || '',
    name: (row.name as string) || '',
    description: (row.description as string) || '',
    sku: (row.sku as string) || '',
    brand: (row.brand as string) || '',
    gender: (row.gender as GenderType) || 'unisex',
    categoryId: (row.category_id as string) || '',
    subcategory: (row.subcategory as string) || '',
    price: (row.price as number) || 0,
    costPrice: (row.cost_price as number) || 0,
    promoPrice: (row.promo_price as number) || undefined,
    isPromo: (row.is_promo as boolean) || false,
    images: (row.images as string[]) || [],
    colors: [],
    stock: stockObj,
    inStock: stockVal > 0,
    active: true,
    featured: false,
    createdAt: new Date().toISOString(),
  };
}

// Map Product (camelCase) to database row (snake_case)
// CRITICAL: DB has stock as INTEGER - we sum all sizes
function mapProductToDb(product: Partial<Product> & { category?: string }): Record<string, unknown> {
  const dbRow: Record<string, unknown> = {};

  if (product.id !== undefined) dbRow.id = product.id;
  if (product.name !== undefined) dbRow.name = product.name;
  if (product.description !== undefined) dbRow.description = product.description;
  if (product.sku !== undefined) dbRow.sku = product.sku;
  if (product.brand !== undefined) dbRow.brand = product.brand;
  if (product.gender !== undefined) dbRow.gender = product.gender;

  // Handle categoryId -> category_id
  if (product.categoryId !== undefined) {
    dbRow.category_id = product.categoryId;
  } else if (product.category !== undefined) {
    dbRow.category_id = product.category;
  }

  if (product.subcategory !== undefined) dbRow.subcategory = product.subcategory;
  if (product.price !== undefined) dbRow.price = product.price;
  if (product.costPrice !== undefined) dbRow.cost_price = product.costPrice;
  if (product.promoPrice !== undefined) dbRow.promo_price = product.promoPrice;
  if (product.isPromo !== undefined) dbRow.is_promo = product.isPromo;
  if (product.images !== undefined) dbRow.images = product.images;

  // CRITICAL: Convert stock object to integer sum
  if (product.stock !== undefined) {
    const stockSum = Object.values(product.stock).reduce((a, b) => a + (b || 0), 0);
    dbRow.stock = stockSum;
  }

  return dbRow;
}

// Map database row to Brand
function mapDbToBrand(row: Record<string, unknown>): Brand {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    color: row.color as string,
    textColor: row.text_color as string,
    active: row.active as boolean,
    order: row.order as number,
  };
}

// Map Brand to database row
function mapBrandToDb(brand: Partial<Brand>): Record<string, unknown> {
  const dbRow: Record<string, unknown> = {};
  if (brand.id !== undefined) dbRow.id = brand.id;
  if (brand.name !== undefined) dbRow.name = brand.name;
  if (brand.slug !== undefined) dbRow.slug = brand.slug;
  if (brand.color !== undefined) dbRow.color = brand.color;
  if (brand.textColor !== undefined) dbRow.text_color = brand.textColor;
  if (brand.active !== undefined) dbRow.active = brand.active;
  if (brand.order !== undefined) dbRow.order = brand.order;
  return dbRow;
}

// Map database row to Kit
function mapDbToKit(row: Record<string, unknown>): Kit {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    price: row.price as number,
    items: row.items as Kit['items'],
    totalPieces: row.total_pieces as number,
    images: row.images as string[],
    videos: row.videos as string[],
    brand: row.brand as string,
    gender: row.gender as GenderType,
    season: row.season as SeasonType | undefined,
    ageRange: row.age_range as AgeRangeType | undefined,
    style: row.style as string[] | undefined,
    category: row.category as string | undefined,
    minQuantity: row.min_quantity as number | undefined,
    availability: row.availability as AvailabilityType | undefined,
    sizesAvailable: row.sizes_available as string[],
    colors: row.colors as string[],
    material: row.material as string,
    active: row.active as boolean,
    createdAt: row.created_at as string,
  };
}

// Map Kit to database row
function mapKitToDb(kit: Partial<Kit>): Record<string, unknown> {
  const dbRow: Record<string, unknown> = {};
  if (kit.id !== undefined) dbRow.id = kit.id;
  if (kit.name !== undefined) dbRow.name = kit.name;
  if (kit.description !== undefined) dbRow.description = kit.description;
  if (kit.price !== undefined) dbRow.price = kit.price;
  if (kit.items !== undefined) dbRow.items = kit.items;
  if (kit.totalPieces !== undefined) dbRow.total_pieces = kit.totalPieces;
  if (kit.images !== undefined) dbRow.images = kit.images;
  if (kit.videos !== undefined) dbRow.videos = kit.videos;
  if (kit.brand !== undefined) dbRow.brand = kit.brand;
  if (kit.gender !== undefined) dbRow.gender = kit.gender;
  if (kit.season !== undefined) dbRow.season = kit.season;
  if (kit.ageRange !== undefined) dbRow.age_range = kit.ageRange;
  if (kit.style !== undefined) dbRow.style = kit.style;
  if (kit.category !== undefined) dbRow.category = kit.category;
  if (kit.minQuantity !== undefined) dbRow.min_quantity = kit.minQuantity;
  if (kit.availability !== undefined) dbRow.availability = kit.availability;
  if (kit.sizesAvailable !== undefined) dbRow.sizes_available = kit.sizesAvailable;
  if (kit.colors !== undefined) dbRow.colors = kit.colors;
  if (kit.material !== undefined) dbRow.material = kit.material;
  if (kit.active !== undefined) dbRow.active = kit.active;
  if (kit.createdAt !== undefined) dbRow.created_at = kit.createdAt;
  return dbRow;
}

// Map database row to Category
function mapDbToCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    type: row.type as Category['type'],
    icon: row.icon as string | undefined,
    color: row.color as string | undefined,
    description: row.description as string | undefined,
    active: row.active as boolean | undefined,
    order: row.order as number | undefined,
    productCount: row.product_count as number | undefined,
    parent: row.parent as string | null | undefined,
    subcategories: row.subcategories as string[] | undefined,
  };
}

// Map Category to database row
function mapCategoryToDb(category: Partial<Category>): Record<string, unknown> {
  const dbRow: Record<string, unknown> = {};
  if (category.id !== undefined) dbRow.id = category.id;
  if (category.name !== undefined) dbRow.name = category.name;
  if (category.slug !== undefined) dbRow.slug = category.slug;
  if (category.type !== undefined) dbRow.type = category.type;
  if (category.icon !== undefined) dbRow.icon = category.icon;
  if (category.color !== undefined) dbRow.color = category.color;
  if (category.description !== undefined) dbRow.description = category.description;
  if (category.active !== undefined) dbRow.active = category.active;
  if (category.order !== undefined) dbRow.order = category.order;
  if (category.productCount !== undefined) dbRow.product_count = category.productCount;
  if (category.parent !== undefined) dbRow.parent = category.parent;
  return dbRow;
}

// Map database row to StockMovement
function mapDbToStockMovement(row: Record<string, unknown>): StockMovement {
  return {
    id: row.id as string,
    productId: row.product_id as string,
    productName: row.product_name as string,
    size: row.size as string,
    quantity: row.quantity as number,
    type: row.type as StockMovement['type'],
    user: row.user as string,
    date: row.date as string,
  };
}

class ApiService {
  // === BRANDS ===
  async getBrands(): Promise<Brand[]> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching brands:', error);
      return [];
    }

    return (data || []).map(row => mapDbToBrand(row as Record<string, unknown>));
  }

  async createBrand(brandData: Omit<Brand, 'id' | 'slug'>): Promise<Brand> {
    const slug = brandData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newBrand: Brand = {
      ...brandData,
      id: slug,
      slug,
    };

    const { data, error } = await supabase
      .from('brands')
      .insert(mapBrandToDb(newBrand))
      .select()
      .single();

    if (error) {
      console.error('Error creating brand:', error);
      throw new Error('Failed to create brand');
    }

    return mapDbToBrand(data as Record<string, unknown>);
  }

  async updateBrand(id: string, updates: Partial<Brand>): Promise<Brand> {
    const { data, error } = await supabase
      .from('brands')
      .update(mapBrandToDb(updates))
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating brand:', error);
      throw new Error('Brand not found');
    }

    return mapDbToBrand(data as Record<string, unknown>);
  }

  async deleteBrand(id: string): Promise<void> {
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting brand:', error);
      throw new Error('Failed to delete brand');
    }
  }

  // === CATEGORIES ===
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return (data || []).map(row => mapDbToCategory(row as Record<string, unknown>));
  }

  async createCategory(categoryData: Omit<Category, 'id'>): Promise<Category> {
    const slug = categoryData.name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newCategory: Category = {
      ...categoryData,
      id: `cat-${generateUUID().slice(0, 8)}`,
      slug,
    };

    const { data, error } = await supabase
      .from('categories')
      .insert(mapCategoryToDb(newCategory))
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      throw new Error('Failed to create category');
    }

    return mapDbToCategory(data as Record<string, unknown>);
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(mapCategoryToDb(updates))
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      throw new Error('Category not found');
    }

    return mapDbToCategory(data as Record<string, unknown>);
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      throw new Error('Failed to delete category');
    }
  }

  // === KITS ===
  async getKits(filters?: KitFilters): Promise<Kit[]> {
    const { data, error } = await supabase
      .from('kits')
      .select('*');

    if (error) {
      console.error('Error fetching kits:', error);
      return [];
    }

    let filtered = (data || []).map(row => mapDbToKit(row as Record<string, unknown>));

    // Apply client-side filtering
    if (filters?.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(k => k.name.toLowerCase().includes(term));
    }

    if (filters?.brand && filters.brand.length > 0) {
      filtered = filtered.filter(k => filters.brand?.includes(k.brand));
    }
    if (filters?.gender && filters.gender.length > 0) {
      filtered = filtered.filter(k => filters.gender?.includes(k.gender));
    }
    if (filters?.season && filters.season.length > 0) {
      filtered = filtered.filter(k => k.season && filters.season?.includes(k.season));
    }
    if (filters?.category && filters.category.length > 0) {
      filtered = filtered.filter(k => k.category && filters.category?.includes(k.category));
    }
    if (filters?.ageRange && filters.ageRange.length > 0) {
      filtered = filtered.filter(k => k.ageRange && filters.ageRange?.includes(k.ageRange));
    }
    if (filters?.material && filters.material.length > 0) {
      filtered = filtered.filter(k => k.material && filters.material?.includes(k.material));
    }
    if (filters?.availability && filters.availability.length > 0) {
      filtered = filtered.filter(k => k.availability && filters.availability?.includes(k.availability));
    }

    if (filters?.sizes && filters.sizes.length > 0) {
      filtered = filtered.filter(k => k.sizesAvailable.some(s => filters.sizes?.includes(s.toLowerCase()) || filters.sizes?.includes(s)));
    }
    if (filters?.colors && filters.colors.length > 0) {
      filtered = filtered.filter(k => k.colors.some(c => filters.colors?.some(fc => c.toLowerCase().includes(fc.toLowerCase()))));
    }
    if (filters?.style && filters.style.length > 0) {
      filtered = filtered.filter(k => k.style?.some(s => filters.style?.includes(s)));
    }

    if (filters?.priceRange) {
      filtered = filtered.filter(k => k.price >= filters.priceRange!.min && k.price <= filters.priceRange!.max);
    }
    if (filters?.minQuantity) {
      filtered = filtered.filter(k => (k.minQuantity || 5) >= filters.minQuantity!);
    }

    return filtered;
  }

  async createKit(kit: Omit<Kit, 'id' | 'createdAt'>): Promise<Kit> {
    const newKit: Kit = {
      ...kit,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('kits')
      .insert(mapKitToDb(newKit))
      .select()
      .single();

    if (error) {
      console.error('Error creating kit:', error);
      throw new Error('Failed to create kit');
    }

    return mapDbToKit(data as Record<string, unknown>);
  }

  // === PRODUCTS ===
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return (data || []).map(row => mapDbToProduct(row as Record<string, unknown>));
  }

  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'inStock'>): Promise<Product> {
    const totalStock = Object.values(product.stock).reduce((a, b) => a + b, 0);
    const newProduct: Product = {
      ...product,
      id: generateUUID(),
      inStock: totalStock > 0,
      createdAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('products')
      .insert(mapProductToDb(newProduct))
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }

    return mapDbToProduct(data as Record<string, unknown>);
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    // If stock is being updated, recalculate inStock
    if (updates.stock) {
      const total = Object.values(updates.stock).reduce((a, b) => a + b, 0);
      updates.inStock = total > 0;
    }

    const { data, error } = await supabase
      .from('products')
      .update(mapProductToDb(updates))
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      throw new Error('Product not found');
    }

    return mapDbToProduct(data as Record<string, unknown>);
  }

  async patchProduct<K extends keyof Product>(id: string, field: K, value: Product[K]): Promise<Product> {
    const updates: Partial<Product> = { [field]: value };
    return this.updateProduct(id, updates);
  }

  async updateProductStock(id: string, size: string, quantity: number): Promise<Product> {
    // First, get the current product
    const { data: currentData, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentData) {
      console.error('Error fetching product for stock update:', fetchError);
      throw new Error('Product not found');
    }

    const currentProduct = mapDbToProduct(currentData as Record<string, unknown>);
    const newStock = {
      ...currentProduct.stock,
      [size]: quantity,
    };
    // DB expects stock as INTEGER - sum all sizes
    const totalStock = Object.values(newStock).reduce((a, b) => a + b, 0);

    // Update the product with integer stock
    const { data, error } = await supabase
      .from('products')
      .update({ stock: totalStock })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product stock:', error);
      throw new Error('Failed to update stock');
    }

    // Log stock movement (optional - may fail if table doesn't exist)
    try {
      const stockMovement = {
        id: generateUUID(),
        product_id: id,
        product_name: currentProduct.name,
        size,
        quantity: quantity - (currentProduct.stock[size] || 0),
        type: 'adjustment',
        user: 'Admin',
        date: new Date().toISOString(),
      };
      await supabase.from('stock_history').insert(stockMovement);
    } catch (e) {
      console.warn('Could not log stock movement:', e);
    }

    return mapDbToProduct(data as Record<string, unknown>);
  }

  // Database Cleanup - delete all products
  async clearAllProducts(): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .neq('id', '');
    if (error) {
      console.error('Error clearing products:', error);
      throw new Error('Failed to clear products');
    }
    console.log('All products deleted successfully');
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }

  // === BULK IMPORT ===
  async downloadTemplate(format: 'xlsx' | 'csv'): Promise<void> {
    // Generate a simple CSV template
    const headers = 'Nome,Preço,Preço de Custo,Marca,Gênero,Categoria,Estoque,SKU,Descrição';
    const exampleRow = 'Produto Exemplo,99.90,49.90,Marca X,boy,kids,10,SKU-001,Descrição do produto';
    const content = `${headers}\n${exampleRow}`;

    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv;charset=utf-8;' : 'text/csv;charset=utf-8;' });
    saveAs(blob, `template_importacao.${format === 'xlsx' ? 'csv' : 'csv'}`);
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

          // Parse headers (first line)
          const headers = this.parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());

          // Column mapping: Portuguese headers to Product fields
          const columnMap: Record<string, keyof Product | 'category'> = {
            'nome': 'name',
            'name': 'name',
            'preço': 'price',
            'preco': 'price',
            'price': 'price',
            'preço de venda': 'price',
            'preco de venda': 'price',
            'preço de custo': 'costPrice',
            'preco de custo': 'costPrice',
            'custo': 'costPrice',
            'cost': 'costPrice',
            'cost_price': 'costPrice',
            'marca': 'brand',
            'brand': 'brand',
            'gênero': 'gender',
            'genero': 'gender',
            'gender': 'gender',
            'categoria': 'category',
            'category': 'category',
            'category_id': 'categoryId',
            'estoque': 'stock',
            'stock': 'stock',
            'sku': 'sku',
            'código': 'sku',
            'codigo': 'sku',
            'descrição': 'description',
            'descricao': 'description',
            'description': 'description',
          };

          // Map header indices
          const headerMapping: { index: number; field: keyof Product | 'category' }[] = [];
          headers.forEach((h, index) => {
            const field = columnMap[h];
            if (field) {
              headerMapping.push({ index, field });
            }
          });

          const results: ImportValidationResult[] = [];

          // Parse data rows
          for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            const data: Partial<Product> & { category?: string } = {};
            const messages: string[] = [];
            let status: 'valid' | 'warning' | 'error' = 'valid';

            // Map values to fields
            headerMapping.forEach(({ index, field }) => {
              const value = values[index]?.trim();
              if (value) {
                switch (field) {
                  case 'name':
                  case 'sku':
                  case 'brand':
                  case 'description':
                  case 'categoryId':
                    (data as any)[field] = value;
                    break;
                  case 'category':
                    data.categoryId = value;
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
                      'menino': 'boy', 'boy': 'boy', 'm': 'boy',
                      'menina': 'girl', 'girl': 'girl', 'f': 'girl',
                      'unissex': 'unisex', 'unisex': 'unisex', 'u': 'unisex',
                      'bebê': 'bebe', 'bebe': 'bebe', 'baby': 'bebe', 'b': 'bebe',
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
              messages.push('Marca não informada, será vazio');
              if (status === 'valid') status = 'warning';
              data.brand = '';
            }
            if (!data.costPrice) data.costPrice = 0;
            if (!data.description) data.description = '';
            if (!data.sku) data.sku = '';
            if (!data.categoryId) data.categoryId = '';
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

  // Helper to parse CSV line respecting quotes
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
        item.messages.push('Erro ao salvar no banco de dados');
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
    // Fetch products and kits for stats calculation
    const [products, kits, categories] = await Promise.all([
      this.getProducts(),
      this.getKits(),
      this.getCategories(),
    ]);

    const totalStock = products.reduce((acc, p) => acc + Object.values(p.stock).reduce((a, b) => a + (b as number), 0), 0);
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
    const { data, error } = await supabase
      .from('stock_history')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching stock history:', error);
      return [];
    }

    return (data || []).map(row => mapDbToStockMovement(row as Record<string, unknown>));
  }
}

export const api = new ApiService();
