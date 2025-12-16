
import { Product, Category, Kit, DashboardStats, StockMovement, BulkImportReport, KitItem, Brand, ImportValidationResult, GenderType, SeasonType, AgeRangeType, AvailabilityType } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_KITS, INITIAL_STOCK_HISTORY, INITIAL_BRANDS } from './mockData';

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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

class ApiService {
  private products: Product[] = [...INITIAL_PRODUCTS];
  private kits: Kit[] = [...INITIAL_KITS];
  private categories: Category[] = [...INITIAL_CATEGORIES];
  private stockHistory: StockMovement[] = [...INITIAL_STOCK_HISTORY];
  private brands: Brand[] = [...INITIAL_BRANDS];

  // --- BRANDS ---
  async getBrands(): Promise<Brand[]> {
    await delay(200);
    return this.brands.sort((a, b) => a.order - b.order);
  }

  async createBrand(brandData: Omit<Brand, 'id' | 'slug'>): Promise<Brand> {
    await delay(300);
    const slug = brandData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newBrand: Brand = {
      ...brandData,
      id: slug, 
      slug,
    };
    this.brands.push(newBrand);
    return newBrand;
  }

  async updateBrand(id: string, updates: Partial<Brand>): Promise<Brand> {
    await delay(300);
    const index = this.brands.findIndex(b => b.id === id);
    if (index === -1) throw new Error("Brand not found");
    this.brands[index] = { ...this.brands[index], ...updates };
    return this.brands[index];
  }

  async deleteBrand(id: string): Promise<void> {
    await delay(300);
    this.brands = this.brands.filter(b => b.id !== id);
  }

  // --- KITS ---
  async getKits(filters?: KitFilters): Promise<Kit[]> {
    await delay(300);
    let filtered = [...this.kits];

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
    await delay(500);
    const newKit: Kit = {
      ...kit,
      id: 'k' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    this.kits = [newKit, ...this.kits];
    return newKit;
  }

  // --- PRODUCTS ---
  async getProducts(): Promise<Product[]> {
    await delay(300);
    return this.products;
  }

  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'inStock'>): Promise<Product> {
    await delay(500);
    const totalStock = Object.values(product.stock).reduce((a, b) => a + b, 0);
    
    const newProduct: Product = {
      ...product,
      id: 'p' + Math.random().toString(36).substr(2, 9),
      inStock: totalStock > 0, 
      createdAt: new Date().toISOString(),
    };
    this.products = [newProduct, ...this.products];
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
      await delay(400);
      const index = this.products.findIndex(p => p.id === id);
      if (index === -1) throw new Error("Product not found");
      
      this.products[index] = { ...this.products[index], ...updates };
      
      if (updates.stock) {
        const total = Object.values(updates.stock).reduce((a, b) => a + b, 0);
        this.products[index].inStock = total > 0;
      }

      return this.products[index];
  }

  async patchProduct(id: string, field: keyof Product, value: any): Promise<Product> {
    await delay(200);
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Product not found");
    
    // @ts-ignore
    this.products[index][field] = value;
    return this.products[index];
  }

  async updateProductStock(id: string, size: string, quantity: number): Promise<Product> {
    await delay(200);
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Product not found");
    
    const oldQty = this.products[index].stock[size] || 0;
    this.products[index].stock = {
      ...this.products[index].stock,
      [size]: quantity
    };
    
    const total = Object.values(this.products[index].stock).reduce((a, b) => a + b, 0);
    this.products[index].inStock = total > 0;

    this.stockHistory.unshift({
      id: 'h' + Math.random(),
      productId: id,
      productName: this.products[index].name,
      size,
      quantity: quantity - oldQty,
      type: 'adjustment',
      user: 'Admin',
      date: new Date().toISOString()
    });

    return this.products[index];
  }

  async deleteProduct(id: string): Promise<void> {
    await delay(400);
    this.products = this.products.filter(p => p.id !== id);
  }

  // --- BULK IMPORT ---
  async downloadTemplate(format: 'xlsx' | 'csv'): Promise<void> {
    console.log("Download template triggered");
  }

  async parseAndValidateImport(file: File): Promise<ImportValidationResult[]> {
    return [];
  }

  async executeImport(validations: ImportValidationResult[]): Promise<BulkImportReport> {
    return {
        totalRows: 0,
        successCount: 0,
        warningCount: 0,
        errorCount: 0,
        createdProducts: 0,
        createdCategories: 0,
        createdBrands: 0,
        validations: [],
        timestamp: new Date().toISOString()
    };
  }
  
  async importProductsBulk(file: File): Promise<BulkImportReport> {
     return this.executeImport([]);
  }

  // --- DASHBOARD ---
  async getCategories(): Promise<Category[]> {
    await delay(200);
    return this.categories;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    await delay(300);
    const totalStock = this.products.reduce((acc, p) => acc + Object.values(p.stock).reduce((a,b)=>a+(b as number),0), 0);
    const lowStock = this.products.filter(p => {
        const total = Object.values(p.stock).reduce((a,b)=>a+(b as number),0);
        return total > 0 && total < 10;
    }).length;

    const history = Array.from({length: 30}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
            name: date.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}),
            value: Math.floor(Math.random() * 2000) + 500
        };
    });

    const topProducts = [
        { name: 'Kit Verão Premium', sales: 23, revenue: 5750 },
        { name: 'Kit Inverno Básico', sales: 18, revenue: 3240 },
        { name: 'Kit Escola', sales: 15, revenue: 2250 },
        { name: 'Kit Bebê Conforto', sales: 12, revenue: 1800 },
        { name: 'Vestido Festa Luxo', sales: 10, revenue: 1500 }
    ];
    
    return {
      totalKits: this.kits.length,
      totalProducts: this.products.length,
      totalCategories: this.categories.length,
      lowStockItems: lowStock,
      lowStock: lowStock,
      outOfStockItems: this.products.filter(p => !p.inStock).length,
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
      topProducts: topProducts
    };
  }

  async getStockHistory(): Promise<StockMovement[]> {
    await delay(300);
    return this.stockHistory;
  }
}

export const api = new ApiService();
