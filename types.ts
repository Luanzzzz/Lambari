
export type GenderType = 'boy' | 'girl' | 'unisex' | 'bebe';
export type SeasonType = 'verao' | 'inverno' | 'primavera' | 'outono' | 'todas';
export type AgeRangeType = 'rn' | 'baby' | 'toddler' | 'kids' | 'tweens' | 'teens';
export type AvailabilityType = 'em_estoque' | 'pronta_entrega' | 'pre_venda' | 'promocao';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  color: string; // Hex code
  textColor: string; // Hex code for contrast
  active: boolean;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  brand: string;
  gender: GenderType;
  categoryId: string;
  subcategory?: string;

  price: number;
  costPrice: number;
  promoPrice?: number;
  isPromo: boolean;

  images: string[];
  mainImage?: string;
  colors: string[];

  stock: Record<string, number>;
  inStock: boolean;
  active: boolean;
  featured: boolean;

  createdAt: string;
}

export interface KitItem {
  productId: string;
  productName: string;
  quantity: number;
  priceAtTime?: number;
}

export interface Kit {
  id: string;
  name: string;
  description: string;
  price: number;
  items: KitItem[];
  totalPieces: number;

  images: string[];
  videos: string[];

  brand: string;
  gender: GenderType;
  season?: SeasonType;
  ageRange?: AgeRangeType;
  style?: string[];
  category?: string;
  minQuantity?: number;
  availability?: AvailabilityType;

  sizesAvailable: string[];
  colors: string[];
  material: string;

  active: boolean;
  createdAt: string;
}

export type CategoryType = 'season' | 'brand' | 'gender' | 'product' | 'product_sub';

export interface Category {
  id: string;
  name: string;
  slug: string;
  type?: CategoryType;
  icon?: string;
  color?: string;
  description?: string;
  active?: boolean;
  order?: number;
  productCount?: number;
  parent?: string | null;
  children?: Category[];
  subcategories?: string[]; // Legacy support
}

export interface UserProfile {
  id: string;
  name: string;
  company?: string;
  cnpj?: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  memberSince: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isAdmin: boolean;
}

export interface TrackingStep {
  status: string;
  date: string | null;
  completed: boolean;
}

export interface TrackingInfo {
  code: string;
  carrier: string;
  estimatedDelivery?: string;
  deliveredDate?: string;
  timeline: TrackingStep[];
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'in_transit' | 'delivered' | 'cancelled';
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  customer: {
    name: string;
    company: string;
    email: string;
    phone: string;
  };
  tracking?: TrackingInfo;
}

export interface DashboardStats {
  totalKits: number;
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalStockCount: number;
  viewsToday: number;
  totalCategories: number;
  lowStock: number;

  totalSales: number;
  totalProfit: number;
  averageMargin: number;
  ordersCount: number;

  salesGrowth: number;
  profitGrowth: number;
  marginGrowth: number;
  ordersGrowth: number;

  salesHistory: { name: string; value: number }[];
  topProducts: { name: string; sales: number; revenue: number }[];
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  size: string;
  quantity: number;
  type: 'adjustment' | 'sale' | 'return' | 'import';
  user: string;
  date: string;
}

export interface ImportValidationResult {
  row: number;
  status: 'valid' | 'warning' | 'error';
  messages: string[];
  data: Partial<Product>;
  originalData: any;
}

export interface BulkImportReport {
  totalRows: number;
  successCount: number;
  warningCount: number;
  errorCount: number;
  createdProducts: number;
  createdCategories: number;
  createdBrands: number;
  validations: ImportValidationResult[];
  timestamp: string;
}
