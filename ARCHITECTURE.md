# Arquitetura e Decisões Técnicas

## Índice

1. [Visão Geral](#visão-geral)
2. [Decisões Arquiteturais](#decisões-arquiteturais)
3. [Padrões de Código](#padrões-de-código)
4. [Defensive Coding](#defensive-coding)
5. [Performance](#performance)
6. [Segurança](#segurança)
7. [Trade-offs e Limitações](#trade-offs-e-limitações)
8. [Roadmap Técnico](#roadmap-técnico)

---

## Visão Geral

Este documento detalha as decisões arquiteturais, padrões de código e práticas de engenharia utilizadas no projeto **Lambari Kids B2B**.

**Princípios Fundamentais**:
- **Simplicidade**: Código fácil de entender e manter
- **Separação de Responsabilidades**: Componentes com propósito único
- **Defensive Coding**: Proteção contra erros e dados inválidos
- **UX Responsiva**: Feedback visual imediato
- **Escalabilidade Preparada**: Estrutura pronta para migração

---

## Decisões Arquiteturais

### 1. Supabase como Backend

**Decisão**: Utilizar Supabase (PostgreSQL) como camada de persistência de dados.

**Motivação**:
- **Banco de dados real**: PostgreSQL robusto e escalável
- **Autenticação integrada**: Sistema de auth pronto (preparado para uso futuro)
- **Row Level Security (RLS)**: Controle de acesso a nível de banco de dados
- **APIs automáticas**: REST e Realtime geradas automaticamente
- **Relacionamentos complexos**: JOINs, FKs, CASCADE deletes
- **Backup e recuperação**: Dados seguros e versionados
- **Multi-dispositivo**: Acesso aos mesmos dados de qualquer lugar

**Estrutura do Banco de Dados**:
```sql
-- Entidades principais
products         → Produtos do catálogo
brands           → Marcas dos produtos
categories       → Categorias de produtos
kits             → Kits de produtos
sellers          → Vendedores
banners          → Banners promocionais
orders           → Pedidos de clientes
order_items      → Itens dos pedidos (FK para orders)
stock_movements  → Histórico de movimentações de estoque
```

**Row Level Security (RLS)**:
Todas as tabelas possuem políticas RLS para controle de acesso:
```sql
-- Exemplo: Somente produtos ativos são públicos
CREATE POLICY "Produtos ativos são públicos"
  ON products FOR SELECT
  USING (active = true);

-- Políticas temporárias para desenvolvimento (INSERT/UPDATE/DELETE com true)
-- IMPORTANTE: Substituir por autenticação real em produção
```

**API Layer** ([services/api.ts](services/api.ts)):
```typescript
// Transformers para converter snake_case ↔ camelCase
const transformProductFromDB = (dbProduct: any): Product => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    sku: dbProduct.sku,
    price: parseFloat(dbProduct.price),
    category: dbProduct.category_id,
    // ... conversão de campos
  };
};

// CRUD operations com Supabase client
async getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(transformProductFromDB);
}
```

**Relacionamentos**:
- **orders → order_items**: CASCADE delete (ao deletar pedido, itens são removidos)
- **order_items → products/kits**: CHECK constraint (deve ter product_id OU kit_id)
- **products → brands**: FK brand_id
- **products → categories**: FK category_id

**Migrações**:
Todas as migrações SQL estão versionadas em `supabase/migrations/`:
- `001_initial_schema.sql` - Schema inicial
- `002_allow_crud_products_brands_categories.sql` - RLS para produtos, marcas, categorias
- `003_allow_crud_kits.sql` - RLS para kits
- `004_allow_crud_stock_sellers_orders_banners.sql` - RLS para demais entidades

**Próximos Passos (Produção)**:
- [ ] Implementar autenticação real (Supabase Auth)
- [ ] Substituir políticas RLS temporárias (`WITH CHECK (true)`) por autenticação
- [ ] Adicionar rate limiting
- [ ] Configurar backups automáticos
- [ ] Adicionar monitoramento e logs

---

### 2. HashRouter ao invés de BrowserRouter

**Decisão**: Utilizar HashRouter do React Router v6.

**Motivação**:
- **Compatibilidade com GitHub Pages**: Funciona sem configuração de servidor
- **Deploy simplificado**: Não requer rewrites ou redirecionamentos
- **Sem 404 em refresh**: URLs com `#` não geram requisições ao servidor

**Formato de URLs**:
```
BrowserRouter: https://site.com/admin/products
HashRouter:    https://site.com/#/admin/products
             └─ servidor ─┘└─── cliente ───┘
```

**Trade-offs**:
| Vantagem | Desvantagem |
|----------|-------------|
| Funciona em qualquer servidor | URLs menos "limpas" |
| Sem configuração | Problema com SEO (se aplicável) |
| Sem 404 em refresh | `#` pode confundir usuários |

**Alternativa (BrowserRouter)**:
```typescript
// Requer configuração no servidor
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}

// Alterar App.tsx
import { BrowserRouter } from 'react-router-dom';
```

---

### 3. Component-Based Architecture

**Decisão**: Arquitetura baseada em componentes com clara separação.

**Estrutura**:
```
┌─────────────────────────────────┐
│      PRESENTATION LAYER         │
│   (Pages, Components, UI)       │
└─────────────────────────────────┘
           ↓ props/events
┌─────────────────────────────────┐
│     BUSINESS LOGIC LAYER        │
│    (Context, Custom Hooks)      │
└─────────────────────────────────┘
           ↓ api calls
┌─────────────────────────────────┐
│      DATA ACCESS LAYER          │
│       (services/api.ts)         │
└─────────────────────────────────┘
           ↓ storage ops
┌─────────────────────────────────┐
│     PERSISTENCE LAYER           │
│       (LocalStorage)            │
└─────────────────────────────────┘
```

**Categorias de Componentes**:

#### Componentes de Página (Pages)
- **Responsabilidade**: Orquestrar UI e lógica de negócio
- **Localização**: `pages/admin/*`, `pages/customer/*`
- **Características**: Stateful, fazem chamadas de API, gerenciam formulários
- **Exemplo**: ProductList, Dashboard, KitForm

#### Componentes UI (UI Components)
- **Responsabilidade**: Apresentação pura, sem lógica de negócio
- **Localização**: `components/ui/*`
- **Características**: Stateless (ou estado apenas de UI), reutilizáveis, testáveis
- **Exemplo**: Button, Input, MediaUploader

#### Layouts
- **Responsabilidade**: Estrutura comum de páginas
- **Localização**: `layouts/*`
- **Características**: Sidebar, header, footer
- **Exemplo**: AdminLayout

**Princípios**:
- **Single Responsibility**: Cada componente faz uma coisa
- **Composição**: Componentes pequenos combinados em maiores
- **Reusabilidade**: UI components usados em múltiplos lugares
- **Testabilidade**: Componentes pequenos são fáceis de testar

---

### 4. Context API ao invés de Redux

**Decisão**: Usar Context API para estado global.

**Motivação**:
- **Simplicidade**: Menos boilerplate que Redux
- **Built-in**: Parte do React, sem dependências extras
- **Suficiente para o escopo**: Aplicação de tamanho médio
- **Curva de aprendizado**: Mais fácil para novos desenvolvedores

**Implementação (ShopContext)**:
```typescript
// context/ShopContext.tsx
interface ShopContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { productId: product.id, productName: product.name, quantity, price: product.price }];
    });
  };

  // ... outros métodos

  return (
    <ShopContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </ShopContext.Provider>
  );
};
```

**Uso em Componentes**:
```typescript
const { cart, addToCart } = useContext(ShopContext);

<Button onClick={() => addToCart(product, 1)}>
  Adicionar ao Carrinho
</Button>
```

**Quando Considerar Redux**:
- Aplicação muito grande (>50 componentes)
- Estado global complexo com muitas entidades
- Necessidade de time-travel debugging
- Middlewares complexos (sagas, thunks)

---

### 5. TailwindCSS via CDN

**Decisão**: Incluir TailwindCSS via CDN ao invés de build customizado.

**Motivação**:
- **Setup zero**: Apenas adicionar `<script>` no HTML
- **Sem configuração**: Funciona imediatamente
- **Prototipagem rápida**: Ideal para desenvolvimento inicial

**Implementação**:
```html
<!-- index.html -->
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          primary: '#4F46E5',
          secondary: '#10B981'
        }
      }
    }
  }
</script>
```

**Trade-offs**:
| Vantagem | Desvantagem |
|----------|-------------|
| Setup instantâneo | Arquivo maior (~3MB) |
| Sem build step | Sem purge de classes não usadas |
| Configuração inline | Sem autocomplete do VS Code |

**Migração para Build Customizado**:
```bash
# Instalar TailwindCSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init

# tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5'
      }
    }
  }
}

# Remover CDN, importar CSS
import './index.css';
```

---

### 6. Serverless APIs com Vercel

**Decisão**: Usar Vercel Functions para endpoints de API.

**Motivação**:
- **Escalabilidade automática**: Sem gerenciamento de servidores
- **Deploy integrado**: Push para GitHub → deploy automático
- **Custo efetivo**: Paga apenas pelo uso
- **Integração com n8n**: Webhooks e automações

**Estrutura**:
```
api/
├── search.ts              # GET /api/search
└── products/
    ├── search.ts          # GET /api/products/search
    ├── types.ts           # Tipos compartilhados
    └── mockKits.ts        # Dados mock para API
```

**Exemplo de Function**:
```typescript
// api/search.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Query params
  const { q, brand, limit = '20' } = req.query;

  // Buscar dados (mock ou banco real)
  const results = await searchProducts({
    query: q as string,
    brand: brand as string,
    limit: parseInt(limit as string)
  });

  return res.status(200).json(results);
}
```

**Vantagens**:
- Deploy automático no push
- Edge runtime (latência baixa)
- Logs integrados
- Fácil integração com frontend

---

## Padrões de Código

### 1. Estrutura de Componentes

Todos componentes seguem a mesma estrutura:

```typescript
// Imports (agrupados por tipo)
import React, { useState, useEffect } from 'react';         // React
import { api } from '../../services/api';                    // Services
import { Product, Brand } from '../../types';                // Types
import { Button } from '../../components/ui/Button';         // Components
import { Plus, Edit2 } from 'lucide-react';                  // Icons
import toast from 'react-hot-toast';                         // Libraries

// Interfaces (Props e tipos locais)
interface ComponentProps {
  initialData?: Product;
  onSuccess: () => void;
  onClose: () => void;
}

// Component
export const ComponentName: React.FC<ComponentProps> = ({
  initialData,
  onSuccess,
  onClose
}) => {
  // 1. STATE (agrupado por categoria)
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 2. EFFECTS
  useEffect(() => {
    loadData();
  }, []);

  // 3. HANDLERS (alfabético)
  const handleDelete = async (id: string) => {
    // lógica
  };

  const handleSubmit = async () => {
    // lógica
  };

  const loadData = async () => {
    // lógica
  };

  // 4. COMPUTED VALUES
  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 5. RENDER
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

---

### 2. Naming Conventions

**Componentes**: PascalCase
```typescript
ProductForm.tsx
KitManager.tsx
MediaUploader.tsx
```

**Funções/Variáveis**: camelCase
```typescript
const loadProducts = async () => {};
const filteredProducts = products.filter(...);
const handleSubmit = () => {};
```

**Constantes**: UPPER_SNAKE_CASE
```typescript
const STORAGE_KEYS = {
  PRODUCTS: 'lambari_products'
};

const MAX_IMAGES = 6;
const DEFAULT_MARGIN = 35;
```

**Tipos/Interfaces**: PascalCase
```typescript
interface Product {}
type GenderType = 'boy' | 'girl' | 'bebe' | 'unisex';
interface DashboardStats {}
```

**Handlers**: `handle` prefix
```typescript
const handleClick = () => {};
const handleFormSubmit = () => {};
const handlePriceChange = (e) => {};
```

**Loaders**: `load` prefix
```typescript
const loadProducts = async () => {};
const loadCategories = async () => {};
```

**Booleans**: `is` / `has` / `should` prefix
```typescript
const isLoading = true;
const hasErrors = false;
const shouldShowModal = true;
```

---

### 3. Padrões de Estado

#### Estado Local
```typescript
// Valores simples
const [name, setName] = useState('');
const [price, setPrice] = useState(0);

// Arrays
const [products, setProducts] = useState<Product[]>([]);

// Objetos
const [formData, setFormData] = useState<FormData>({
  name: '',
  price: 0
});

// Booleans de UI
const [loading, setLoading] = useState(false);
const [isModalOpen, setIsModalOpen] = useState(false);
```

#### Atualizações Imutáveis
```typescript
// CORRETO: Imutável
setProducts(prev => [...prev, newProduct]);
setProducts(prev => prev.filter(p => p.id !== id));
setProducts(prev => prev.map(p => p.id === id ? { ...p, price: newPrice } : p));

// ERRADO: Mutável
products.push(newProduct);
setProducts(products);
```

---

### 4. Padrões de Formulários

#### Controlled Components
```typescript
const [name, setName] = useState('');

<input
  type="text"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
```

#### Validação
```typescript
const [errors, setErrors] = useState<Record<string, string>>({});

const validate = () => {
  const newErrors: Record<string, string> = {};

  if (!name || name.length < 3) {
    newErrors.name = "Nome deve ter no mínimo 3 caracteres";
  }

  if (price <= 0) {
    newErrors.price = "Preço deve ser maior que zero";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async () => {
  if (!validate()) {
    toast.error("Corrija os erros antes de salvar");
    return;
  }

  // Salvar...
};
```

#### Feedback Visual
```typescript
<input
  className={`border ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
{errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
```

---

### 5. Padrões de Modal/Wizard

#### View Switching
```typescript
const [view, setView] = useState<'list' | 'form'>('list');

if (view === 'form') {
  return <Form onClose={() => setView('list')} />;
}

return (
  <div>
    <button onClick={() => setView('form')}>Novo</button>
    <List />
  </div>
);
```

#### Wizard Multi-Step
```typescript
const [activeTab, setActiveTab] = useState(0);

const tabs = ['Informações', 'Grade', 'Mídia', 'Preço'];

<div>
  {/* Navegação de Tabs */}
  <div className="flex gap-2">
    {tabs.map((tab, idx) => (
      <button
        key={idx}
        onClick={() => setActiveTab(idx)}
        className={activeTab === idx ? 'active' : ''}
      >
        {tab}
      </button>
    ))}
  </div>

  {/* Conteúdo da Tab Ativa */}
  {activeTab === 0 && <InformationTab />}
  {activeTab === 1 && <GradeTab />}
  {activeTab === 2 && <MediaTab />}
  {activeTab === 3 && <PriceTab />}

  {/* Navegação */}
  <button onClick={() => setActiveTab(prev => prev - 1)}>Anterior</button>
  <button onClick={() => setActiveTab(prev => prev + 1)}>Próximo</button>
</div>
```

---

## Defensive Coding

Técnicas de programação defensiva para prevenir erros.

### 1. Safe Setters

Garantir que sempre trabalhamos com arrays válidos:

```typescript
// MediaUploader.tsx
const safeFiles = Array.isArray(files) ? files : [];

// KitForm.tsx
const safeSetKitImages = (images: string[]) => {
  setKitImages(Array.isArray(images) ? images : []);
};

const safeSetKitVideos = (videos: string[]) => {
  setKitVideos(Array.isArray(videos) ? videos : []);
};
```

**Por quê?**
- Previne crashes quando props são `undefined` ou `null`
- Permite que componentes sejam mais tolerantes a dados inválidos
- Evita `TypeError: Cannot read property 'map' of undefined`

---

### 2. Optional Chaining

Acessar propriedades aninhadas com segurança:

```typescript
// SEM optional chaining (pode crashar)
const totalStock = product.stock.P;
// ❌ Error se product ou stock for undefined

// COM optional chaining (seguro)
const totalStock = product?.stock?.P || 0;
// ✅ Retorna 0 se qualquer parte for undefined
```

**Uso em Arrays**:
```typescript
const firstProduct = products?.[0];
const productName = products?.[0]?.name || 'Sem nome';
```

---

### 3. Nullish Coalescing

Valores padrão para null/undefined:

```typescript
// || (OR lógico) - falsy values (0, '', false, null, undefined)
const price = product.price || 0;
// ⚠️ Se price for 0, retorna 0 (pode ser o valor desejado)

// ?? (Nullish coalescing) - apenas null/undefined
const price = product.price ?? 0;
// ✅ Se price for 0, mantém 0. Só substitui se null/undefined
```

**Quando usar**:
- Use `||` para strings vazias e false
- Use `??` para números que podem ser 0

---

### 4. Array Validation

Sempre validar arrays antes de iterar:

```typescript
// RUIM
products.map(p => <ProductCard {...p} />)
// ❌ Crash se products for undefined

// BOM
{Array.isArray(products) && products.map(p => <ProductCard {...p} />)}
// ✅ Renderiza vazio se products for inválido

// MELHOR
{(products || []).map(p => <ProductCard {...p} />)}
// ✅ Fallback para array vazio
```

---

### 5. Safe Storage Access

Tratar erros de localStorage:

```typescript
const safeGetFromStorage = <T>(key: string, fallback: T[] = []): T[] => {
  try {
    const rawData = localStorage.getItem(key);

    // Verificar se existe
    if (rawData === null || rawData === undefined || rawData === '') {
      return fallback;
    }

    // Parsear JSON
    const parsed = JSON.parse(rawData);

    // Validar tipo
    if (!Array.isArray(parsed)) {
      console.warn(`Invalid data type for ${key}, expected array`);
      return fallback;
    }

    return parsed;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return fallback;
  }
};
```

**Casos tratados**:
- Chave não existe
- JSON malformado
- Tipo inválido (não array)
- Quota excedida (em setItem)
- Erros de permissão (modo privado)

---

### 6. Input Sanitization

Sanitizar inputs de usuário:

```typescript
// Normalização Unicode (para slugs)
const generateSlug = (name: string): string => {
  return name
    .normalize('NFD')                      // Decompõe acentos
    .replace(/[\u0300-\u036f]/g, '')      // Remove marcas diacríticas
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')         // Remove caracteres especiais
    .replace(/\s+/g, '-')                  // Espaços → hífens
    .replace(/-+/g, '-')                   // Múltiplos hífens → único
    .replace(/^-|-$/g, '');                // Remove hífens início/fim
};

// Exemplo:
generateSlug("Roupas Infantis!") // "roupas-infantis"
generateSlug("Camisão Básico")    // "camisao-basico"
```

**Por quê?**
- URLs sempre funcionam (sem acentos/caracteres especiais)
- Consistência em comparações
- SEO friendly

---

### 7. Error Boundaries

Capturar erros de renderização (React):

```typescript
class ErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error caught by boundary:', error, info);
    // Enviar para serviço de logging (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2>Algo deu errado.</h2>
          <button onClick={() => window.location.reload()}>
            Recarregar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Uso:
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## Performance

### 1. Skeleton Loading

Placeholders animados durante carregamento:

```typescript
{loading ? (
  [...Array(5)].map((_, i) => (
    <div key={i} className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
    </div>
  ))
) : (
  products.map(p => <ProductCard key={p.id} {...p} />)
)}
```

**Benefícios**:
- UX melhor que spinner genérico
- Usuário sabe que conteúdo está carregando
- Dá sensação de rapidez

---

### 2. Optimistic UI

Atualizar UI antes de confirmar no servidor:

```typescript
const toggleActive = async (product: Product) => {
  const newState = !product.active;

  // 1. Atualiza UI IMEDIATAMENTE
  setProducts(prev => prev.map(p =>
    p.id === product.id ? { ...p, active: newState } : p
  ));

  try {
    // 2. Persiste no backend
    await api.patchProduct(product.id, 'active', newState);
    toast.success(newState ? "Ativado" : "Desativado");
  } catch (error) {
    // 3. Reverte se falhar
    setProducts(prev => prev.map(p =>
      p.id === product.id ? { ...p, active: !newState } : p
    ));
    toast.error("Erro ao atualizar");
  }
};
```

**Benefícios**:
- UI responde instantaneamente
- Sensação de aplicação rápida
- Reverte apenas se erro ocorrer

---

### 3. Debouncing de Busca

Evitar requisições excessivas em busca em tempo real:

```typescript
import { useState, useEffect } from 'react';

const [searchTerm, setSearchTerm] = useState('');
const [debouncedTerm, setDebouncedTerm] = useState('');

// Debounce de 300ms
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedTerm(searchTerm);
  }, 300);

  return () => clearTimeout(timer);
}, [searchTerm]);

// Busca quando debouncedTerm muda
useEffect(() => {
  if (debouncedTerm) {
    searchProducts(debouncedTerm);
  }
}, [debouncedTerm]);

<input
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Buscar produtos..."
/>
```

**Benefícios**:
- Reduz requisições (espera usuário parar de digitar)
- Melhora performance
- Economiza recursos

---

### 4. Memoização

Evitar recálculos desnecessários:

```typescript
import { useMemo } from 'react';

const ExpensiveComponent = ({ products, filters }) => {
  // Recalcula APENAS quando products ou filters mudarem
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Lógica complexa de filtro
      return matchesFilters(p, filters);
    });
  }, [products, filters]);

  return (
    <div>
      {filteredProducts.map(p => <ProductCard {...p} />)}
    </div>
  );
};
```

**Quando usar**:
- Cálculos complexos
- Filtragens/ordenações em arrays grandes
- Criação de objetos/arrays que são passados como props

---

### 5. Lazy Loading de Rotas

Carregar componentes apenas quando necessário:

```typescript
import { lazy, Suspense } from 'react';

// Lazy import
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProductList = lazy(() => import('./pages/admin/ProductList'));

// Uso com Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/admin" element={<Dashboard />} />
    <Route path="/admin/products" element={<ProductList />} />
  </Routes>
</Suspense>
```

**Benefícios**:
- Bundle inicial menor
- Carregamento mais rápido da página inicial
- Código carregado sob demanda

---

### 6. Virtualização de Listas

Para listas muito longas (>100 itens):

```typescript
import { FixedSizeList } from 'react-window';

const ProductListVirtualized = ({ products }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <ProductCard {...products[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={products.length}
      itemSize={100}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

**Benefícios**:
- Renderiza apenas itens visíveis
- Performance constante independente do tamanho da lista
- Scroll suave mesmo com 10.000+ itens

---

## Segurança

### 1. Sanitização de Slugs

Prevenir injeção de caracteres especiais:

```typescript
const generateSlug = (name: string): string => {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')  // Remove TUDO exceto a-z, 0-9, espaço e hífen
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};
```

**Previne**:
- Injeção de scripts (`<script>`)
- Quebra de URL (`../../../`)
- Caracteres inválidos

---

### 2. Validação de Inputs

Nunca confiar em dados do usuário:

```typescript
const createProduct = async (data: any) => {
  // Validar SEMPRE no backend
  if (!data.name || data.name.length < 3) {
    throw new Error("Nome inválido");
  }

  if (typeof data.price !== 'number' || data.price <= 0) {
    throw new Error("Preço inválido");
  }

  if (data.costPrice >= data.price) {
    throw new Error("Custo deve ser menor que preço");
  }

  // Continuar...
};
```

---

### 3. CORS Configurado

Controlar origens permitidas nas APIs serverless:

```typescript
// api/search.ts
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS restritivo
  const allowedOrigins = [
    'https://lambarikids.com',
    'https://www.lambarikids.com'
  ];

  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  // Métodos permitidos
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ...
}
```

---

### 4. Sanitização de HTML

Se renderizar HTML de usuário (não recomendado):

```typescript
import DOMPurify from 'dompurify';

const renderDescription = (html: string) => {
  const clean = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
};
```

**Melhor alternativa**: Usar Markdown ao invés de HTML.

---

## Trade-offs e Limitações

### Limitações Atuais

#### 1. LocalStorage

**Limitação**:
- ~5-10MB de armazenamento
- Apenas navegador local
- Sem sincronização

**Impacto**:
- Impossível usar em produção real
- Dados perdidos ao limpar cache

**Migração necessária para**:
- Supabase, Firebase ou API REST customizada

---

#### 2. Sem Autenticação Real

**Limitação**:
- Qualquer um pode acessar `/admin`
- Sem controle de permissões

**Impacto**:
- Não pode ser usado em produção
- Demo/protótipo apenas

**Implementação futura**:
```typescript
// Adicionar autenticação
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;

  return children;
};

<Route path="/admin" element={
  <ProtectedRoute>
    <AdminLayout />
  </ProtectedRoute>
} />
```

---

#### 3. Sem Paginação

**Limitação**:
- Carrega todos produtos de uma vez
- Performance degrada com muitos produtos

**Impacto**:
- Lento com >500 produtos
- Alto uso de memória

**Implementação futura**:
```typescript
const getProducts = async (page = 1, pageSize = 20) => {
  const response = await fetch(`/api/products?page=${page}&pageSize=${pageSize}`);
  return response.json();
};
```

---

#### 4. Sem Cache

**Limitação**:
- Recarrega dados a cada renderização
- Múltiplas requisições desnecessárias

**Impacto**:
- Lentidão perceptível
- Dados obsoletos

**Implementação futura**:
```typescript
// React Query
import { useQuery } from '@tanstack/react-query';

const { data: products, isLoading } = useQuery({
  queryKey: ['products'],
  queryFn: api.getProducts,
  staleTime: 5 * 60 * 1000  // Cache por 5 minutos
});
```

---

## Roadmap Técnico

### Fase 1: Fundação (Atual)

- [x] Arquitetura de componentes
- [x] LocalStorage para persistência
- [x] CRUD completo
- [x] Defensive coding básico
- [x] UI responsiva

### Fase 2: Produção Básica

- [ ] Migrar para Supabase/backend real
- [ ] Implementar autenticação (JWT)
- [ ] Adicionar paginação
- [ ] Implementar cache (React Query)
- [ ] Testes unitários básicos

### Fase 3: Otimização

- [ ] Code splitting agressivo
- [ ] Virtualização de listas
- [ ] PWA (Service Worker)
- [ ] Lazy loading de imagens
- [ ] Memoização avançada

### Fase 4: Produção Avançada

- [ ] Testes E2E (Playwright)
- [ ] CI/CD completo
- [ ] Monitoramento (Sentry)
- [ ] Analytics (Google Analytics)
- [ ] A/B testing

### Fase 5: Escala

- [ ] CDN para assets
- [ ] Edge functions
- [ ] Rate limiting
- [ ] Multi-tenancy
- [ ] Internacionalização

---

**Versão**: 1.0
**Data**: 2025-01-19
**Autor**: Claude Sonnet 4.5
**Projeto**: Lambari Kids B2B
