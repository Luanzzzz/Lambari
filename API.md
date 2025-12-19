# API - Referência Técnica

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura da API](#arquitetura-da-api)
3. [Métodos por Entidade](#métodos-por-entidade)
   - [Brands (Marcas)](#brands-marcas)
   - [Categories (Categorias)](#categories-categorias)
   - [Products (Produtos)](#products-produtos)
   - [Kits](#kits)
   - [Bulk Import (Importação)](#bulk-import-importação)
   - [Dashboard](#dashboard)
4. [Tipos TypeScript](#tipos-typescript)
5. [Validações](#validações)
6. [APIs Serverless](#apis-serverless)

---

## Visão Geral

A camada de API do Lambari Kids está implementada no arquivo [services/api.ts](services/api.ts) e utiliza **LocalStorage** como mecanismo de persistência.

**Características**:
- **CRUD completo** para todas entidades
- **Delay simulado** (100ms) para simular latência de rede
- **Validações** de dados em tempo de execução
- **Storage defensivo** com fallbacks
- **Auto-inicialização** com dados mock
- **Parser CSV** customizado para importações

**Limitações**:
- Dados persistem apenas no navegador local
- Sem autenticação ou autorização
- Sem sincronização entre dispositivos
- Limite de armazenamento (~5-10MB)

---

## Arquitetura da API

### Storage Keys

Todas as entidades são armazenadas em chaves específicas do LocalStorage:

```typescript
const STORAGE_KEYS = {
  PRODUCTS: 'lambari_products',
  BRANDS: 'lambari_brands',
  CATEGORIES: 'lambari_categories',
  KITS: 'lambari_kits',
  STOCK_HISTORY: 'lambari_stock_history'
};
```

### Funções Auxiliares

#### safeGetFromStorage

Lê dados do LocalStorage com tratamento defensivo de erros:

```typescript
const safeGetFromStorage = <T>(key: string, fallback: T[] = []): T[] => {
  try {
    const rawData = localStorage.getItem(key);
    if (rawData === null || rawData === undefined || rawData === '') {
      return fallback;
    }
    const parsed = JSON.parse(rawData);
    if (!Array.isArray(parsed)) {
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
- Chave não existe → Retorna fallback
- JSON inválido → Retorna fallback
- Não é array → Retorna fallback
- Erro de parsing → Retorna fallback

#### safeSetToStorage

Salva dados no LocalStorage com tratamento de erros:

```typescript
const safeSetToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
};
```

**Casos tratados**:
- Quota excedida → Loga erro
- Serialização falha → Loga erro

#### delay

Simula latência de rede para tornar a experiência mais realista:

```typescript
const delay = (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms));
```

**Uso**:
- Todas operações de API aguardam 100ms
- Permite testar estados de loading
- Simula comportamento de servidor real

#### initializeStorage

Inicializa o LocalStorage com dados mock na primeira execução:

```typescript
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    safeSetToStorage(STORAGE_KEYS.PRODUCTS, mockProducts);
  }
  if (!localStorage.getItem(STORAGE_KEYS.BRANDS)) {
    safeSetToStorage(STORAGE_KEYS.BRANDS, mockBrands);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    safeSetToStorage(STORAGE_KEYS.CATEGORIES, mockCategories);
  }
  if (!localStorage.getItem(STORAGE_KEYS.KITS)) {
    safeSetToStorage(STORAGE_KEYS.KITS, mockKits);
  }
};

// Executado automaticamente na importação do módulo
initializeStorage();
```

---

## Métodos por Entidade

### Brands (Marcas)

#### getBrands()

Retorna todas as marcas cadastradas.

**Assinatura**:
```typescript
getBrands(): Promise<Brand[]>
```

**Retorno**:
```typescript
[
  {
    id: "brand-1",
    name: "Tip Top",
    color: "#FF6B35"
  },
  {
    id: "brand-2",
    name: "Malwee",
    color: "#4ECDC4"
  }
]
```

**Exemplo de Uso**:
```typescript
const brands = await api.getBrands();
console.log(brands.length); // 5
```

---

#### createBrand(brand)

Cria uma nova marca.

**Assinatura**:
```typescript
createBrand(brand: Omit<Brand, 'id'>): Promise<Brand>
```

**Parâmetros**:
```typescript
{
  name: string;        // Nome da marca (obrigatório, único)
  color?: string;      // Cor hex (opcional, padrão: #4F46E5)
}
```

**Retorno**:
```typescript
{
  id: "brand-1234567890",  // ID gerado automaticamente
  name: "Nova Marca",
  color: "#4F46E5"
}
```

**Validações**:
- Nome não pode ser vazio
- Nome deve ser único
- Cor deve ser hex válido (se fornecido)

**Exemplo de Uso**:
```typescript
const newBrand = await api.createBrand({
  name: "Brandili",
  color: "#FF5733"
});
console.log(newBrand.id); // "brand-1234567890"
```

---

#### updateBrand(id, updates)

Atualiza uma marca existente.

**Assinatura**:
```typescript
updateBrand(id: string, updates: Partial<Brand>): Promise<Brand>
```

**Parâmetros**:
```typescript
id: string                  // ID da marca
updates: {
  name?: string;           // Novo nome
  color?: string;          // Nova cor
}
```

**Retorno**:
- Marca atualizada completa

**Validações**:
- Marca deve existir
- Nome deve ser único (se alterado)

**Exemplo de Uso**:
```typescript
const updated = await api.updateBrand("brand-123", {
  color: "#00FF00"
});
```

---

#### deleteBrand(id)

Exclui uma marca.

**Assinatura**:
```typescript
deleteBrand(id: string): Promise<void>
```

**Parâmetros**:
- `id`: ID da marca a excluir

**Retorno**:
- `void` (sem retorno)

**Validações**:
- Marca deve existir
- Não valida se há produtos usando a marca (feature futura)

**Exemplo de Uso**:
```typescript
await api.deleteBrand("brand-123");
```

---

### Categories (Categorias)

#### getCategories()

Retorna todas as categorias (hierárquicas).

**Assinatura**:
```typescript
getCategories(): Promise<Category[]>
```

**Retorno**:
```typescript
[
  {
    id: "cat-1",
    name: "Roupas",
    slug: "roupas",
    parentId: null,          // Categoria raiz
    type: "unisex"
  },
  {
    id: "cat-2",
    name: "Camisetas",
    slug: "camisetas",
    parentId: "cat-1",       // Filho de "Roupas"
    type: "unisex"
  }
]
```

**Exemplo de Uso**:
```typescript
const categories = await api.getCategories();
const rootCategories = categories.filter(c => !c.parentId);
```

---

#### createCategory(category)

Cria uma nova categoria.

**Assinatura**:
```typescript
createCategory(category: Omit<Category, 'id' | 'slug'>): Promise<Category>
```

**Parâmetros**:
```typescript
{
  name: string;                          // Nome (obrigatório)
  parentId?: string | null;              // ID da categoria pai (opcional)
  type: 'boy' | 'girl' | 'bebe' | 'unisex';
}
```

**Retorno**:
```typescript
{
  id: "cat-1234567890",           // Gerado automaticamente
  name: "Vestidos",
  slug: "vestidos",               // Gerado automaticamente
  parentId: "cat-123",
  type: "girl"
}
```

**Geração de Slug**:
```typescript
// "Roupas Infantis" → "roupas-infantis"
const slug = name
  .normalize('NFD')                      // Decompõe acentos
  .replace(/[\u0300-\u036f]/g, '')      // Remove acentos
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9\s-]/g, '')         // Remove especiais
  .replace(/\s+/g, '-')                  // Espaços → hífens
  .replace(/-+/g, '-');                  // Múltiplos hífens → único
```

**Validações**:
- Nome obrigatório
- Slug único
- Categoria pai deve existir (se fornecido)
- Sem referências circulares

**Exemplo de Uso**:
```typescript
const category = await api.createCategory({
  name: "Calças Jeans",
  parentId: "cat-roupas",
  type: "boy"
});
console.log(category.slug); // "calcas-jeans"
```

---

#### updateCategory(id, updates)

Atualiza uma categoria existente.

**Assinatura**:
```typescript
updateCategory(id: string, updates: Partial<Category>): Promise<Category>
```

**Parâmetros**:
```typescript
{
  name?: string;
  parentId?: string | null;
  type?: 'boy' | 'girl' | 'bebe' | 'unisex';
}
```

**Retorno**:
- Categoria atualizada completa

**Validações**:
- Categoria deve existir
- Se nome mudar, slug é regenerado
- Slug único

**Exemplo de Uso**:
```typescript
const updated = await api.updateCategory("cat-123", {
  name: "Roupas de Verão"
});
console.log(updated.slug); // "roupas-de-verao"
```

---

#### deleteCategory(id)

Exclui uma categoria.

**Assinatura**:
```typescript
deleteCategory(id: string): Promise<void>
```

**Parâmetros**:
- `id`: ID da categoria a excluir

**Validações**:
- Categoria deve existir
- Não valida subcategorias (feature futura)

**Exemplo de Uso**:
```typescript
await api.deleteCategory("cat-123");
```

---

### Products (Produtos)

#### getProducts(filters?)

Retorna produtos com filtros opcionais.

**Assinatura**:
```typescript
getProducts(filters?: {
  brand?: string;
  category?: string;
  gender?: GenderType;
  active?: boolean;
}): Promise<Product[]>
```

**Parâmetros**:
```typescript
filters: {
  brand?: string;           // Filtrar por marca
  category?: string;        // Filtrar por categoria
  gender?: GenderType;      // 'boy' | 'girl' | 'bebe' | 'unisex'
  active?: boolean;         // true = apenas ativos
}
```

**Retorno**:
```typescript
[
  {
    id: "prod-1",
    name: "Camiseta Básica",
    sku: "CAM-001",
    brand: "brand-1",
    category: "cat-camisetas",
    price: 39.90,
    costPrice: 25.00,
    gender: "unisex",
    images: ["url1", "url2"],
    videos: [],
    stock: { P: 10, M: 5, G: 0 },
    sizesAvailable: ["P", "M", "G"],
    colors: ["Branco", "Preto"],
    material: "Algodão",
    active: true,
    isPromo: false,
    createdAt: "2025-01-10T10:00:00Z"
  }
]
```

**Exemplo de Uso**:
```typescript
// Todos produtos
const all = await api.getProducts();

// Apenas ativos da marca "Tip Top"
const filtered = await api.getProducts({
  brand: "brand-tiptop",
  active: true
});

// Apenas masculino
const boys = await api.getProducts({
  gender: "boy"
});
```

---

#### createProduct(product)

Cria um novo produto.

**Assinatura**:
```typescript
createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product>
```

**Parâmetros**:
```typescript
{
  name: string;                    // Nome (obrigatório)
  sku?: string;                    // SKU (gerado se vazio)
  brand: string;                   // ID da marca
  category: string;                // ID da categoria
  price: number;                   // Preço venda (obrigatório, > 0)
  costPrice: number;               // Custo (obrigatório, > 0, < price)
  gender: GenderType;              // 'boy' | 'girl' | 'bebe' | 'unisex'
  images: string[];                // URLs de imagens (até 6)
  videos?: string[];               // URLs de vídeos (até 2)
  stock: Record<string, number>;   // { P: 10, M: 5, G: 0 }
  sizesAvailable: string[];        // ['P', 'M', 'G']
  colors: string[];                // ['Branco', 'Preto']
  material?: string;               // Material (ex: 'Algodão')
  active?: boolean;                // Padrão: true
  isPromo?: boolean;               // Padrão: false
}
```

**Retorno**:
```typescript
{
  id: "prod-1234567890",           // Gerado automaticamente
  ...productData,
  createdAt: "2025-01-19T15:30:00Z"  // Timestamp atual
}
```

**Geração de SKU**:
Se SKU não fornecido, é gerado automaticamente:
```typescript
const sku = `PRD-${Date.now()}`;
// Exemplo: "PRD-1705679400000"
```

**Validações**:
- Nome obrigatório (min 3 caracteres)
- Preço > 0
- Custo > 0 e < preço
- SKU único
- Pelo menos 1 tamanho disponível
- Marca deve existir
- Categoria deve existir

**Exemplo de Uso**:
```typescript
const product = await api.createProduct({
  name: "Camiseta Estampada",
  brand: "brand-123",
  category: "cat-camisetas",
  price: 49.90,
  costPrice: 30.00,
  gender: "unisex",
  images: ["img1.jpg", "img2.jpg"],
  stock: { P: 10, M: 15, G: 8 },
  sizesAvailable: ["P", "M", "G"],
  colors: ["Azul", "Verde"],
  material: "Algodão",
  active: true
});
```

---

#### updateProduct(id, updates)

Atualiza um produto existente (substituição completa de campos).

**Assinatura**:
```typescript
updateProduct(id: string, updates: Partial<Product>): Promise<Product>
```

**Parâmetros**:
```typescript
{
  name?: string;
  price?: number;
  costPrice?: number;
  stock?: Record<string, number>;
  active?: boolean;
  // ... qualquer campo do Product
}
```

**Retorno**:
- Produto atualizado completo

**Validações**:
- Produto deve existir
- Mesmas validações de create para campos alterados

**Exemplo de Uso**:
```typescript
const updated = await api.updateProduct("prod-123", {
  price: 59.90,
  isPromo: true
});
```

---

#### patchProduct(id, field, value)

Atualiza um único campo do produto (operação atômica).

**Assinatura**:
```typescript
patchProduct(id: string, field: keyof Product, value: any): Promise<Product>
```

**Parâmetros**:
- `id`: ID do produto
- `field`: Nome do campo a atualizar
- `value`: Novo valor

**Retorno**:
- Produto atualizado completo

**Uso Típico**:
- Edição inline de preço
- Toggle de ativo/inativo
- Atualização rápida de estoque

**Exemplo de Uso**:
```typescript
// Toggle ativo/inativo
await api.patchProduct("prod-123", "active", false);

// Atualizar preço
await api.patchProduct("prod-123", "price", 45.00);

// Marcar como promoção
await api.patchProduct("prod-123", "isPromo", true);
```

---

#### updateProductStock(id, stockUpdates)

Atualiza estoque de tamanhos específicos.

**Assinatura**:
```typescript
updateProductStock(
  id: string,
  stockUpdates: Record<string, number>
): Promise<Product>
```

**Parâmetros**:
```typescript
stockUpdates: {
  [size: string]: number;
}

// Exemplo:
{
  "P": 20,
  "M": 15,
  "G": 5
}
```

**Comportamento**:
- Faz merge com estoque existente
- Tamanhos não mencionados permanecem inalterados
- Pode adicionar novos tamanhos

**Retorno**:
- Produto atualizado completo

**Exemplo de Uso**:
```typescript
// Atualizar apenas P e M, G fica como está
await api.updateProductStock("prod-123", {
  P: 50,
  M: 30
});

// Adicionar novo tamanho
await api.updateProductStock("prod-123", {
  GG: 10
});
```

---

#### deleteProduct(id)

Exclui um produto.

**Assinatura**:
```typescript
deleteProduct(id: string): Promise<void>
```

**Parâmetros**:
- `id`: ID do produto a excluir

**Validações**:
- Produto deve existir
- Não valida se produto está em kits (feature futura)

**Exemplo de Uso**:
```typescript
await api.deleteProduct("prod-123");
```

---

### Kits

#### getKits()

Retorna todos os kits cadastrados.

**Assinatura**:
```typescript
getKits(): Promise<Kit[]>
```

**Retorno**:
```typescript
[
  {
    id: "kit-1",
    name: "Kit Verão 2025",
    description: "Combo perfeito para o verão",
    price: 120.00,
    items: [
      {
        productId: "prod-1",
        productName: "Camiseta",
        quantity: 2,
        priceAtTime: 39.90
      },
      {
        productId: "prod-2",
        productName: "Bermuda",
        quantity: 1,
        priceAtTime: 59.90
      }
    ],
    totalPieces: 3,              // Soma das quantidades
    brand: "brand-1",
    gender: "boy",
    images: ["kit1.jpg"],
    videos: [],
    sizesAvailable: ["P", "M", "G"],
    colors: [],
    material: "Algodão",
    active: true
  }
]
```

**Exemplo de Uso**:
```typescript
const kits = await api.getKits();
const activeKits = kits.filter(k => k.active);
```

---

#### createKit(kit)

Cria um novo kit.

**Assinatura**:
```typescript
createKit(kit: Omit<Kit, 'id'>): Promise<Kit>
```

**Parâmetros**:
```typescript
{
  name: string;                      // Nome do kit (obrigatório)
  description?: string;              // Descrição (opcional)
  price: number;                     // Preço final (obrigatório, > 0)
  items: KitItem[];                  // Produtos inclusos (min 1)
  totalPieces: number;               // Soma das quantidades
  brand: string;                     // ID da marca
  gender: GenderType;
  images: string[];                  // Imagens do kit montado
  videos?: string[];
  sizesAvailable: string[];
  colors?: string[];
  material?: string;
  active?: boolean;                  // Padrão: true
}
```

**Estrutura de KitItem**:
```typescript
interface KitItem {
  productId: string;        // ID do produto
  productName: string;      // Nome do produto (snapshot)
  quantity: number;         // Quantidade no kit
  priceAtTime: number;      // Preço do produto no momento (snapshot)
}
```

**Retorno**:
```typescript
{
  id: "kit-1234567890",      // Gerado automaticamente
  ...kitData
}
```

**Cálculo de totalPieces**:
```typescript
const totalPieces = items.reduce((sum, item) => sum + item.quantity, 0);
// Exemplo: [{ quantity: 2 }, { quantity: 1 }] = 3
```

**Validações**:
- Nome obrigatório
- Preço > 0
- items.length >= 1
- Todos productId devem existir
- totalPieces = soma das quantidades

**Exemplo de Uso**:
```typescript
const kit = await api.createKit({
  name: "Kit Escola",
  description: "Tudo para volta às aulas",
  price: 150.00,
  items: [
    {
      productId: "prod-camiseta",
      productName: "Camiseta Branca",
      quantity: 3,
      priceAtTime: 29.90
    },
    {
      productId: "prod-calca",
      productName: "Calça Jeans",
      quantity: 2,
      priceAtTime: 79.90
    }
  ],
  totalPieces: 5,
  brand: "brand-tiptop",
  gender: "unisex",
  images: ["kit-escola.jpg"],
  sizesAvailable: ["P", "M", "G"],
  material: "Variado"
});
```

---

#### updateKit(id, updates)

Atualiza um kit existente.

**Assinatura**:
```typescript
updateKit(id: string, updates: Partial<Kit>): Promise<Kit>
```

**Parâmetros**:
```typescript
{
  name?: string;
  price?: number;
  items?: KitItem[];
  totalPieces?: number;
  active?: boolean;
  // ... qualquer campo do Kit
}
```

**Retorno**:
- Kit atualizado completo

**Validações**:
- Kit deve existir
- Mesmas validações de create

**Exemplo de Uso**:
```typescript
const updated = await api.updateKit("kit-123", {
  price: 180.00,
  active: false
});
```

---

#### deleteKit(id)

Exclui um kit.

**Assinatura**:
```typescript
deleteKit(id: string): Promise<void>
```

**Parâmetros**:
- `id`: ID do kit a excluir

**Validações**:
- Kit deve existir

**Exemplo de Uso**:
```typescript
await api.deleteKit("kit-123");
```

---

### Bulk Import (Importação)

#### downloadTemplate()

Retorna template CSV para importação de produtos.

**Assinatura**:
```typescript
downloadTemplate(): Promise<string>
```

**Retorno**:
```csv
nome,sku,marca,categoria,preco,custo,estoque_p,estoque_m,estoque_g,genero,material,cores
Camiseta Básica,CAM-001,Tip Top,Camisetas,39.90,25.00,10,5,0,unisex,Algodão,"Branco,Preto"
Bermuda Jeans,BER-001,Malwee,Bermudas,59.90,35.00,8,12,3,boy,Jeans,"Azul,Preto"
```

**Formato das Colunas**:
1. **nome**: Nome do produto (obrigatório)
2. **sku**: SKU único (opcional, gerado se vazio)
3. **marca**: Nome da marca (obrigatório, cria se não existir)
4. **categoria**: Nome da categoria (obrigatório, deve existir)
5. **preco**: Preço de venda (obrigatório, decimal com ponto)
6. **custo**: Custo unitário (obrigatório, decimal com ponto)
7. **estoque_p**: Estoque tamanho P (número inteiro >= 0)
8. **estoque_m**: Estoque tamanho M
9. **estoque_g**: Estoque tamanho G
10. **genero**: boy | girl | bebe | unisex
11. **material**: Material do produto
12. **cores**: Lista separada por vírgula entre aspas

**Exemplo de Uso**:
```typescript
const csvTemplate = await api.downloadTemplate();
const blob = new Blob([csvTemplate], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'template-produtos.csv';
link.click();
```

---

#### parseAndValidateImport(csvText)

Faz parsing e validação de um CSV de importação.

**Assinatura**:
```typescript
parseAndValidateImport(csvText: string): Promise<ImportValidationResult>
```

**Parâmetros**:
- `csvText`: Conteúdo completo do arquivo CSV

**Retorno**:
```typescript
interface ImportValidationResult {
  valid: boolean;                    // true se todas linhas válidas
  totalRows: number;                 // Total de linhas (exceto header)
  validRows: number;                 // Linhas válidas
  invalidRows: number;               // Linhas com erro
  data: Array<{                      // Dados parseados
    row: number;                     // Número da linha
    valid: boolean;                  // Válida?
    data: Partial<Product>;          // Dados do produto
    errors: string[];                // Lista de erros (se inválida)
  }>;
}
```

**Parsing do CSV**:
```typescript
const parseCSV = (text: string): string[][] => {
  const lines = text.split('\n').filter(line => line.trim());
  return lines.map(line => {
    // Trata campos entre aspas
    const regex = /(".*?"|[^,]+)(?=\s*,|\s*$)/g;
    const fields: string[] = [];
    let match;
    while ((match = regex.exec(line)) !== null) {
      fields.push(match[0].replace(/^"|"$/g, '').trim());
    }
    return fields;
  });
};
```

**Validações por Linha**:
1. **Nome**: Não vazio, min 3 caracteres
2. **SKU**: Alfanumérico, único (se fornecido)
3. **Marca**: Existe ou será criada
4. **Categoria**: Deve existir
5. **Preço**: Número válido, > 0
6. **Custo**: Número válido, > 0, < preço
7. **Estoques**: Números inteiros, >= 0
8. **Gênero**: Deve ser 'boy', 'girl', 'bebe' ou 'unisex'

**Exemplo de Uso**:
```typescript
const file = document.querySelector('input[type="file"]').files[0];
const csvText = await file.text();
const result = await api.parseAndValidateImport(csvText);

console.log(`Total: ${result.totalRows}`);
console.log(`Válidas: ${result.validRows}`);
console.log(`Inválidas: ${result.invalidRows}`);

result.data.forEach(row => {
  if (!row.valid) {
    console.error(`Linha ${row.row}: ${row.errors.join(', ')}`);
  }
});
```

---

#### executeImport(validatedData)

Executa a importação de produtos validados.

**Assinatura**:
```typescript
executeImport(
  validatedData: Array<{ data: Partial<Product> }>
): Promise<BulkImportReport>
```

**Parâmetros**:
```typescript
validatedData: Array<{
  data: Partial<Product>;    // Dados do produto validado
}>
```

**Retorno**:
```typescript
interface BulkImportReport {
  total: number;             // Total de linhas processadas
  success: number;           // Importadas com sucesso
  failed: number;            // Falhas
  errors: Array<{
    line: number;            // Número da linha
    productName: string;     // Nome do produto
    error: string;           // Mensagem de erro
  }>;
}
```

**Processo**:
1. Para cada produto validado:
   - Gera ID único
   - Gera SKU se vazio
   - Cria marca se não existir
   - Chama `createProduct()`
2. Captura erros individuais
3. Retorna relatório completo

**Exemplo de Uso**:
```typescript
// Após parseAndValidateImport
const validData = result.data.filter(row => row.valid);
const report = await api.executeImport(validData);

console.log(`Importados: ${report.success} de ${report.total}`);
if (report.failed > 0) {
  console.error(`Falhas: ${report.failed}`);
  report.errors.forEach(err => {
    console.error(`Linha ${err.line} (${err.productName}): ${err.error}`);
  });
}
```

---

### Dashboard

#### getDashboardStats()

Retorna estatísticas agregadas para o dashboard administrativo.

**Assinatura**:
```typescript
getDashboardStats(): Promise<DashboardStats>
```

**Retorno**:
```typescript
interface DashboardStats {
  totalSales: number;                // Total vendido (R$)
  totalProducts: number;             // Total de produtos ativos
  totalOrders: number;               // Total de pedidos
  pendingOrders: number;             // Pedidos pendentes
  lowStockProducts: number;          // Produtos com estoque < 10
  salesByMonth: Array<{              // Vendas por mês
    month: string;                   // "Jan", "Fev", etc.
    sales: number;                   // Valor vendido
  }>;
  topProducts: Array<{               // Produtos mais vendidos
    id: string;
    name: string;
    sales: number;                   // Quantidade vendida
  }>;
}
```

**Cálculos**:
```typescript
// Total de produtos ativos
totalProducts = products.filter(p => p.active).length;

// Produtos com estoque baixo
lowStockProducts = products.filter(p => {
  const totalStock = Object.values(p.stock).reduce((a, b) => a + b, 0);
  return totalStock < 10;
}).length;

// Vendas por mês (mock data)
salesByMonth = [
  { month: "Jan", sales: 15000 },
  { month: "Fev", sales: 18000 },
  // ...
];
```

**Exemplo de Uso**:
```typescript
const stats = await api.getDashboardStats();

console.log(`Total vendido: R$ ${stats.totalSales.toFixed(2)}`);
console.log(`Produtos ativos: ${stats.totalProducts}`);
console.log(`Estoque baixo: ${stats.lowStockProducts} produtos`);

// Renderizar gráfico
<LineChart data={stats.salesByMonth}>
  <XAxis dataKey="month" />
  <YAxis />
  <Line dataKey="sales" />
</LineChart>
```

---

#### getStockHistory()

Retorna histórico de movimentações de estoque.

**Assinatura**:
```typescript
getStockHistory(): Promise<StockMovement[]>
```

**Retorno**:
```typescript
[
  {
    id: "mov-1",
    productId: "prod-123",
    type: "in",                     // "in" ou "out"
    quantity: 50,
    size: "M",
    date: "2025-01-15T10:30:00Z",
    reason: "Reposição fornecedor"
  },
  {
    id: "mov-2",
    productId: "prod-123",
    type: "out",
    quantity: 2,
    size: "M",
    date: "2025-01-16T14:20:00Z",
    reason: "Venda - Pedido #456"
  }
]
```

**Tipos de Movimentação**:
- **in**: Entrada de estoque (compra, devolução, ajuste positivo)
- **out**: Saída de estoque (venda, perda, ajuste negativo)

**Exemplo de Uso**:
```typescript
const history = await api.getStockHistory();
const movements = history.filter(m => m.productId === "prod-123");

movements.forEach(mov => {
  const action = mov.type === 'in' ? 'Entrada' : 'Saída';
  console.log(`${action}: ${mov.quantity} un (${mov.size}) - ${mov.reason}`);
});
```

---

## Tipos TypeScript

### Product

```typescript
interface Product {
  id: string;
  name: string;
  sku: string;
  brand: string;                    // ID da marca
  category: string;                 // ID da categoria
  price: number;
  costPrice: number;
  gender: GenderType;
  images: string[];
  videos: string[];
  stock: Record<string, number>;    // { P: 10, M: 5, G: 0 }
  sizesAvailable: string[];
  colors: string[];
  material: string;
  active: boolean;
  isPromo: boolean;
  createdAt: string;                // ISO 8601
}
```

### Brand

```typescript
interface Brand {
  id: string;
  name: string;
  color?: string;                   // Hex color
}
```

### Category

```typescript
interface Category {
  id: string;
  name: string;
  slug: string;                     // URL-friendly
  parentId?: string | null;         // Para hierarquia
  type: GenderType;
}
```

### Kit

```typescript
interface Kit {
  id: string;
  name: string;
  description?: string;
  price: number;
  items: KitItem[];
  totalPieces: number;
  brand: string;
  gender: GenderType;
  images: string[];
  videos: string[];
  sizesAvailable: string[];
  colors: string[];
  material: string;
  active: boolean;
}

interface KitItem {
  productId: string;
  productName: string;
  quantity: number;
  priceAtTime: number;
}
```

### GenderType

```typescript
type GenderType = 'boy' | 'girl' | 'bebe' | 'unisex';
```

### DashboardStats

```typescript
interface DashboardStats {
  totalSales: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockProducts: number;
  salesByMonth: Array<{
    month: string;
    sales: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
  }>;
}
```

### StockMovement

```typescript
interface StockMovement {
  id: string;
  productId: string;
  type: 'in' | 'out';
  quantity: number;
  size?: string;
  date: string;                     // ISO 8601
  reason?: string;
}
```

### ImportValidationResult

```typescript
interface ImportValidationResult {
  valid: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  data: Array<{
    row: number;
    valid: boolean;
    data: Partial<Product>;
    errors: string[];
  }>;
}
```

### BulkImportReport

```typescript
interface BulkImportReport {
  total: number;
  success: number;
  failed: number;
  errors: Array<{
    line: number;
    productName: string;
    error: string;
  }>;
}
```

---

## Validações

### Validação de Nome

```typescript
const validateName = (name: string): string | null => {
  if (!name || name.trim().length < 3) {
    return "Nome deve ter no mínimo 3 caracteres";
  }
  return null;
};
```

### Validação de Preço

```typescript
const validatePrice = (price: number): string | null => {
  if (isNaN(price) || price <= 0) {
    return "Preço deve ser maior que zero";
  }
  return null;
};
```

### Validação de Custo

```typescript
const validateCost = (cost: number, price: number): string | null => {
  if (isNaN(cost) || cost <= 0) {
    return "Custo deve ser maior que zero";
  }
  if (cost >= price) {
    return "Custo deve ser menor que o preço de venda";
  }
  return null;
};
```

### Validação de SKU

```typescript
const validateSKU = (sku: string, existingProducts: Product[]): string | null => {
  if (!sku) return null; // SKU opcional

  if (!/^[A-Z0-9-]+$/i.test(sku)) {
    return "SKU deve conter apenas letras, números e hífens";
  }

  const duplicate = existingProducts.find(p => p.sku === sku);
  if (duplicate) {
    return "SKU já existe";
  }

  return null;
};
```

### Validação de Estoque

```typescript
const validateStock = (stock: Record<string, number>): string | null => {
  for (const [size, qty] of Object.entries(stock)) {
    if (isNaN(qty) || qty < 0) {
      return `Estoque inválido para tamanho ${size}`;
    }
  }
  return null;
};
```

### Validação de Slug

```typescript
const validateSlug = (slug: string, existingSlugs: string[]): string | null => {
  if (!slug || slug.length < 2) {
    return "Slug muito curto";
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return "Slug deve conter apenas letras minúsculas, números e hífens";
  }

  if (existingSlugs.includes(slug)) {
    return "Slug já existe";
  }

  return null;
};
```

---

## APIs Serverless

O projeto inclui endpoints serverless para integração com sistemas externos (n8n, webhooks, etc.).

### /api/search

Endpoint de busca global (produtos + kits).

**Arquivo**: `api/search.ts`

**Método**: GET

**Query Parameters**:
```typescript
{
  q?: string;              // Termo de busca
  brand?: string;          // Filtrar por marca
  category?: string;       // Filtrar por categoria
  gender?: GenderType;     // Filtrar por gênero
  minPrice?: number;       // Preço mínimo
  maxPrice?: number;       // Preço máximo
  limit?: number;          // Limite de resultados (padrão: 20)
}
```

**Resposta**:
```typescript
{
  products: Product[];
  kits: Kit[];
  total: number;
}
```

**Exemplo**:
```bash
GET /api/search?q=camiseta&brand=tip-top&limit=10
```

**CORS**:
```typescript
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}
```

---

### /api/products/search

Endpoint específico para busca de produtos.

**Arquivo**: `api/products/search.ts`

**Método**: GET

**Query Parameters**:
```typescript
{
  q?: string;              // Busca no nome
  brand?: string;
  category?: string;
  gender?: GenderType;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;       // true = apenas com estoque
  active?: boolean;        // true = apenas ativos
  limit?: number;
  offset?: number;         // Paginação
}
```

**Resposta**:
```typescript
{
  products: Product[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
```

**Exemplo**:
```bash
GET /api/products/search?q=camiseta&inStock=true&active=true&limit=20&offset=0
```

---

### Configuração Vercel

**vercel.json**:
```json
{
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, PUT, DELETE, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    }
  ]
}
```

---

## Migração para Backend Real

### Considerações para Produção

Quando migrar para um backend real (Supabase, Firebase, API REST customizada):

#### 1. Autenticação e Autorização
```typescript
// Adicionar tokens JWT
headers: {
  'Authorization': `Bearer ${token}`
}

// Implementar refresh token
// Validar permissões por rota
```

#### 2. Paginação
```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Exemplo
GET /api/products?page=1&pageSize=20
```

#### 3. Cache
```typescript
// Cache de API calls
const cache = new Map();

const getCachedProducts = async () => {
  const cacheKey = 'products';
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  const data = await fetchProducts();
  cache.set(cacheKey, data);
  return data;
};
```

#### 4. Rate Limiting
```typescript
// Limitar requisições por IP/usuário
const rateLimiter = {
  maxRequests: 100,
  windowMs: 60000  // 1 minuto
};
```

#### 5. Validação Server-Side
```typescript
// Usar bibliotecas como Zod
import { z } from 'zod';

const ProductSchema = z.object({
  name: z.string().min(3),
  price: z.number().positive(),
  costPrice: z.number().positive()
});

// Validar antes de salvar
const validated = ProductSchema.parse(productData);
```

#### 6. Logs e Monitoramento
```typescript
// Implementar logging estruturado
logger.info('Product created', {
  productId: newProduct.id,
  userId: user.id,
  timestamp: new Date()
});

// Monitoramento de erros (Sentry, etc.)
```

---

**Versão da API**: 1.0
**Compatibilidade**: LocalStorage only
**Data**: 2025-01-19
**Autor**: Claude Sonnet 4.5
**Projeto**: Lambari Kids B2B
