
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Product, Kit, KitItem, Brand, GenderType } from '../../types';
import { Save, Trash, Search, Package, Plus, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { MediaUploader } from '../../components/ui/MediaUploader';
import toast from 'react-hot-toast';

interface KitFormProps {
    initialData?: Kit;
    onClose: () => void;
    onSuccess: () => void;
}

export const KitForm: React.FC<KitFormProps> = ({ initialData, onClose, onSuccess }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Kit Form State
    const [kitName, setKitName] = useState(initialData?.name || '');
    const [kitDescription, setKitDescription] = useState(initialData?.description || '');
    const [kitPrice, setKitPrice] = useState<number>(initialData?.price || 0);
    const [kitItems, setKitItems] = useState<KitItem[]>(initialData?.items || []);
    const [kitBrand, setKitBrand] = useState<string>(initialData?.brand || '');
    const [kitGender, setKitGender] = useState<GenderType>(initialData?.gender || 'unisex');
    const [kitImages, setKitImages] = useState<string[]>(initialData?.images || []);
    const [kitVideos, setKitVideos] = useState<string[]>(initialData?.videos || []);

    // Pricing State
    const [targetMargin, setTargetMargin] = useState<string>('35');
    const [showCostDetails, setShowCostDetails] = useState(false);

    // Defensive: Safe setter functions that ensure arrays
    const safeSetKitImages = (images: string[]) => {
        setKitImages(Array.isArray(images) ? images : []);
    };

    const safeSetKitVideos = (videos: string[]) => {
        setKitVideos(Array.isArray(videos) ? videos : []);
    };

    useEffect(() => {
        const loadData = async () => {
            const [prods, brandsData] = await Promise.all([
                api.getProducts(),
                api.getBrands()
            ]);
            setProducts(prods);
            setBrands(brandsData);

            if (!initialData && brandsData.length > 0 && !kitBrand) {
                setKitBrand(brandsData[0].id);
            }
            setLoading(false);
        };
        loadData();
    }, [initialData]);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addToKit = (product: Product) => {
        setKitItems(prev => {
            const existing = prev.find(i => i.productId === product.id);
            if (existing) {
                return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { productId: product.id, productName: product.name, quantity: 1, priceAtTime: product.price }];
        });
    };

    const removeFromKit = (productId: string) => {
        setKitItems(prev => prev.filter(i => i.productId !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setKitItems(prev => prev.map(i => {
            if (i.productId === productId) {
                return { ...i, quantity: Math.max(1, i.quantity + delta) };
            }
            return i;
        }));
    };

    // Pricing Logic
    const totalCost = kitItems.reduce((acc, item) => {
        const product = products.find(p => p.id === item.productId);
        const cost = product?.costPrice || (product?.price ? product.price * 0.6 : 0);
        return acc + (cost * item.quantity);
    }, 0);

    const suggestedPrice = totalCost / (1 - (parseFloat(targetMargin || '0') / 100));
    const currentMargin = kitPrice > 0 ? ((kitPrice - totalCost) / kitPrice) * 100 : 0;
    const currentProfit = kitPrice - totalCost;

    const handleApplySuggested = () => {
        if (isFinite(suggestedPrice)) {
            setKitPrice(parseFloat(suggestedPrice.toFixed(2)));
        }
    };

    const handleSaveKit = async () => {
        if (!kitName || kitItems.length === 0 || kitPrice <= 0) {
            toast.error('Preencha os campos obrigatórios e adicione produtos.');
            return;
        }

        try {
            const totalPieces = kitItems.reduce((acc, item) => acc + item.quantity, 0);

            const kitData: any = {
                name: kitName,
                description: kitDescription,
                price: kitPrice,
                items: kitItems,
                totalPieces,
                brand: kitBrand,
                gender: kitGender,
                images: kitImages,
                videos: kitVideos,
                sizesAvailable: ['P', 'M', 'G'], // Simplified for demo
                colors: [],
                material: 'Algodão',
                active: true
            };

            if (initialData) {
                await api.updateKit(initialData.id, kitData);
                toast.success('Kit atualizado com sucesso!');
            } else {
                await api.createKit(kitData);
                toast.success('Kit criado com sucesso!');
            }
            onSuccess();
        } catch (e) {
            console.error(e);
            toast.error('Erro ao salvar kit');
        }
    };

    const getBrandName = (id: string) => brands.find(b => b.id === id)?.name || id;

    const getMarginColor = (m: number) => {
        if (m < 20) return 'text-red-600 bg-red-50';
        if (m < 35) return 'text-yellow-600 bg-yellow-50';
        return 'text-green-600 bg-green-50';
    };

    return (
        <div className="flex flex-col gap-6 bg-white rounded-lg h-full">
            <header className="flex justify-between items-center pb-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={onClose}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h2 className="text-xl font-bold text-primary">{initialData ? 'Editar Kit' : 'Novo Kit'}</h2>
                        <p className="text-gray-500 text-sm">{initialData ? 'Altere as informações do kit' : 'Crie combos exclusivos'}</p>
                    </div>
                </div>
                <Button onClick={handleSaveKit} className="gap-2">
                    <Save size={18} /> Salvar Kit
                </Button>
            </header>

            <div className="flex gap-6 flex-1 overflow-hidden min-h-[600px]">
                {/* Left: Product Selector */}
                <div className="w-1/2 md:w-5/12 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none bg-white text-gray-900"
                                placeholder="Buscar produtos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {loading ? <p>Carregando...</p> : filteredProducts.map(p => (
                            <div key={p.id} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg hover:bg-blue-50 transition-colors group">
                                <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                                    {p.images[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200" />}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-sm text-primary">{p.name}</h4>
                                    <div className="flex gap-2 text-xs text-gray-500">
                                        <span className="capitalize">{getBrandName(p.brand)}</span>
                                        <span>•</span>
                                        <span className="font-mono text-gray-700">R$ {p.costPrice?.toFixed(2) || '0.00'}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => addToKit(p)}
                                    className="bg-white border border-primary text-primary rounded-full p-2 hover:bg-primary hover:text-white transition-colors"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Kit Configuration */}
                <div className="w-1/2 md:w-7/12 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-y-auto">
                    <div className="p-6 space-y-6">

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Kit *</label>
                                <input
                                    className="w-full px-4 py-2 border border-gray-300 rounded outline-none focus:border-primary bg-white text-gray-900"
                                    placeholder="Ex: Kit Verão 2025"
                                    value={kitName}
                                    onChange={e => setKitName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded outline-none focus:border-primary bg-white text-gray-900"
                                    value={kitBrand}
                                    onChange={(e: any) => setKitBrand(e.target.value)}
                                >
                                    {brands.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded outline-none focus:border-primary bg-white text-gray-900"
                                    value={kitGender}
                                    onChange={(e: any) => setKitGender(e.target.value)}
                                >
                                    <option value="unisex">Unissex</option>
                                    <option value="boy">Menino</option>
                                    <option value="girl">Menina</option>
                                    <option value="bebe">Bebê</option>
                                </select>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-bold text-gray-700 text-sm">
                                Precificação / Margem
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-500">Custo Total</span>
                                    <span className="font-bold text-gray-700">R$ {totalCost.toFixed(2)}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Mg. Alvo (%)</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-primary bg-white text-gray-900"
                                            value={targetMargin}
                                            onChange={e => setTargetMargin(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Sugerido</label>
                                        <div className="flex gap-2">
                                            <div className="flex-1 px-3 py-2 bg-gray-100 border border-gray-200 rounded text-gray-500 text-sm flex items-center">
                                                R$ {isFinite(suggestedPrice) ? suggestedPrice.toFixed(2) : '0.00'}
                                            </div>
                                            <Button size="sm" variant="secondary" onClick={handleApplySuggested} disabled={!isFinite(suggestedPrice)}>
                                                Usar
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <label className="block text-sm font-bold text-primary mb-1">Preço Final *</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary bg-white text-gray-900 font-bold"
                                        value={kitPrice}
                                        onChange={e => setKitPrice(parseFloat(e.target.value))}
                                    />
                                    <div className="flex justify-between items-center mt-2 text-xs">
                                        <span className={`px-2 py-1 rounded font-bold ${getMarginColor(currentMargin)}`}>
                                            Margem: {currentMargin.toFixed(1)}%
                                        </span>
                                        <span className="font-medium text-green-700">
                                            Lucro: R$ {currentProfit.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Media */}
                        <div className="space-y-4 border-t border-gray-100 pt-4">
                            <label className="block text-sm font-medium text-gray-700">Imagens</label>
                            <MediaUploader
                                type="image"
                                files={kitImages}
                                onFilesChange={safeSetKitImages}
                                maxFiles={6}
                            />
                        </div>

                        {/* Videos */}
                        <div className="space-y-4 border-t border-gray-100 pt-4">
                            <label className="block text-sm font-medium text-gray-700">Vídeos</label>
                            <MediaUploader
                                type="video"
                                files={kitVideos}
                                onFilesChange={safeSetKitVideos}
                                maxFiles={3}
                            />
                        </div>

                        <div className="space-y-4 border-t border-gray-100 pt-4">
                            <label className="block text-sm font-medium text-gray-700">Descrição</label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-300 rounded outline-none focus:border-primary h-24 resize-none bg-white text-gray-900"
                                value={kitDescription}
                                onChange={e => setKitDescription(e.target.value)}
                            />
                        </div>

                        {/* Items List */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-bold text-primary mb-4 flex items-center gap-2 text-sm">
                                <Package size={18} /> Itens ({kitItems.length})
                            </h3>

                            <div className="space-y-2">
                                {kitItems.map((item, idx) => (
                                    <div key={idx} className="bg-white p-2 rounded border border-gray-200 flex items-center justify-between text-sm">
                                        <span className="font-medium text-gray-700 truncate max-w-[150px]">{item.productName}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center border border-gray-200 rounded">
                                                <button onClick={() => updateQuantity(item.productId, -1)} className="px-2 hover:bg-gray-100">-</button>
                                                <span className="px-2 font-bold">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.productId, 1)} className="px-2 hover:bg-gray-100">+</button>
                                            </div>
                                            <button onClick={() => removeFromKit(item.productId)} className="text-red-400 hover:text-red-600">
                                                <Trash size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
