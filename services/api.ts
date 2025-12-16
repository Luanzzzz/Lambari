import { Product, Category, Kit, DashboardStats, StockMovement, BulkImportReport, Brand, ImportValidationResult, GenderType } from '../types';
import { INITIAL_BRANDS, INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_KITS, INITIAL_STOCK_HISTORY } from './mockData';

// ============================================
// LOCAL STORAGE API - NO SUPABASE
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

// Initialize localStorage with mock data on first load
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BRANDS)) {
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(INITIAL_BRANDS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.KITS)) {
    localStorage.setItem(STORAGE_KEYS.KITS, JSON.stringify(INITIAL_KITS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STOCK_HISTORY)) {
    localStorage.setItem(STORAGE_KEYS.STOCK_HISTORY, JSON.stringify(INITIAL_STOCK_HISTORY));
  }
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
// API SERVICE CLASS
// ============================================

class ApiService {
  // === BRANDS ===
  async getBrands(): Promise<Brand[]> {
    await delay();
    return getFromStorage<Brand>(STORAGE_KEYS.BRANDS);
  }

  async createBrand(brandData: Omit<Brand, 'id' | 'slug'>): Promise<Brand> {
    await delay();
    const slug = brandData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newBrand: Brand = {
      ...brandData,
      id: generateId(),
      slug,
    };

    const brands = getFromStorage<Brand>(STORAGE_KEYS.BRANDS);
    brands.push(newBrand);
    saveToStorage(STORAGE_KEYS.BRANDS, brands);

    return newBrand;
  }

  async updateBrand(id: string, updates: Partial<Brand>): Promise<Brand> {
    await delay();
    const brands = getFromStorage<Brand>(STORAGE_KEYS.BRANDS);
    const index = brands.findIndex(b => b.id === id);

    if (index === -1) throw new Error('Brand not found');

    brands[index] = { ...brands[index], ...updates };
    saveToStorage(STORAGE_KEYS.BRANDS, brands);

    return brands[index];
  }

  async deleteBrand(id: string): Promise<void> {
    await delay();
    const brands = getFromStorage<Brand>(STORAGE_KEYS.BRANDS);
    const filtered = brands.filter(b => b.id !== id);
    saveToStorage(STORAGE_KEYS.BRANDS, filtered);
  }

  // === CATEGORIES ===
  async getCategories(): Promise<Category[]> {
    await delay();
    return getFromStorage<Category>(STORAGE_KEYS.CATEGORIES);
  }

  async createCategory(categoryData: Omit<Category, 'id'>): Promise<Category> {
    await delay();
    const slug = categoryData.name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newCategory: Category = {
      ...categoryData,
      id: generateId(),
      slug,
    };

    const categories = getFromStorage<Category>(STORAGE_KEYS.CATEGORIES);
    categories.push(newCategory);
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);

    return newCategory;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    await delay();
    const categories = getFromStorage<Category>(STORAGE_KEYS.CATEGORIES);
    const index = categories.findIndex(c => c.id === id);

    if (index === -1) throw new Error('Category not found');

    categories[index] = { ...categories[index], ...updates };
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);

    return categories[index];
  }

  async deleteCategory(id: string): Promise<void> {
    await delay();
    const categories = getFromStorage<Category>(STORAGE_KEYS.CATEGORIES);
    const filtered = categories.filter(c => c.id !== id);
    saveToStorage(STORAGE_KEYS.CATEGORIES, filtered);
  }

  // === KITS ===
  async getKits(): Promise<Kit[]> {
    await delay();
    return getFromStorage<Kit>(STORAGE_KEYS.KITS);
  }

  async createKit(kit: Omit<Kit, 'id' | 'createdAt'>): Promise<Kit> {
    await delay();
    const newKit: Kit = {
      ...kit,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    const kits = getFromStorage<Kit>(STORAGE_KEYS.KITS);
    kits.push(newKit);
    saveToStorage(STORAGE_KEYS.KITS, kits);

    return newKit;
  }

  // === PRODUCTS ===
  async getProducts(): Promise<Product[]> {
    await delay();
    return getFromStorage<Product>(STORAGE_KEYS.PRODUCTS);
  }

  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'inStock'>): Promise<Product> {
    await delay();
    const totalStock = Object.values(product.stock).reduce((a, b) => a + b, 0);

    const newProduct: Product = {
      ...product,
      id: generateId(),
      inStock: totalStock > 0,
      createdAt: new Date().toISOString(),
    };

    const products = getFromStorage<Product>(STORAGE_KEYS.PRODUCTS);
    products.push(newProduct);
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);

    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    await delay();
    const products = getFromStorage<Product>(STORAGE_KEYS.PRODUCTS);
    const index = products.findIndex(p => p.id === id);

    if (index === -1) throw new Error('Product not found');

    // If stock is being updated, recalculate inStock
    if (updates.stock) {
      const total = Object.values(updates.stock).reduce((a, b) => a + b, 0);
      updates.inStock = total > 0;
    }

    products[index] = { ...products[index], ...updates };
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);

    return products[index];
  }

  async patchProduct<K extends keyof Product>(id: string, field: K, value: Product[K]): Promise<Product> {
    const updates: Partial<Product> = { [field]: value };
    return this.updateProduct(id, updates);
  }

  async updateProductStock(id: string, size: string, quantity: number): Promise<Product> {
    await delay();
    const products = getFromStorage<Product>(STORAGE_KEYS.PRODUCTS);
    const index = products.findIndex(p => p.id === id);

    if (index === -1) throw new Error('Product not found');

    const product = products[index];
    const newStock = {
      ...product.stock,
      [size]: quantity,
    };

    const totalStock = Object.values(newStock).reduce((a, b) => a + b, 0);

    products[index] = {
      ...product,
      stock: newStock,
      inStock: totalStock > 0,
    };

    saveToStorage(STORAGE_KEYS.PRODUCTS, products);

    // Log stock movement
    try {
      const stockHistory = getFromStorage<StockMovement>(STORAGE_KEYS.STOCK_HISTORY);
      const stockMovement: StockMovement = {
        id: generateId(),
        productId: id,
        productName: product.name,
        size,
        quantity: quantity - (product.stock[size] || 0),
        type: 'adjustment',
        user: 'Admin',
        date: new Date().toISOString(),
      };
      stockHistory.push(stockMovement);
      saveToStorage(STORAGE_KEYS.STOCK_HISTORY, stockHistory);
    } catch (e) {
      console.warn('Could not log stock movement:', e);
    }

    return products[index];
  }

  async deleteProduct(id: string): Promise<void> {
    await delay();
    const products = getFromStorage<Product>(STORAGE_KEYS.PRODUCTS);
    const filtered = products.filter(p => p.id !== id);
    saveToStorage(STORAGE_KEYS.PRODUCTS, filtered);
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
    saveToStorage(STORAGE_KEYS.PRODUCTS, []);
    console.log('All products deleted from localStorage');
  }
}

export const api = new ApiService();
