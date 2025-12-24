import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { uploadFile, deleteFile, isBlobUrl } from '../../services/storage';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Plus, Edit2, Trash2, X, Image, ChevronUp, ChevronDown, Info, Upload, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

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

export const BannerManager: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Estado para exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingBanner, setDeletingBanner] = useState<Banner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Formulário
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    linkUrl: '',
    active: true
  });

  // Upload
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');

  const loadBanners = async () => {
    try {
      const data = await api.getBanners();
      // Ordenar por position
      const sorted = data.sort((a: Banner, b: Banner) => a.position - b.position);
      setBanners(sorted);
    } catch (e) {
      toast.error('Erro ao carregar banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleOpenModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        imageUrl: banner.imageUrl,
        linkUrl: banner.linkUrl || '',
        active: banner.active
      });
      setPreviewImage(banner.imageUrl);
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        subtitle: '',
        imageUrl: '',
        linkUrl: '',
        active: true
      });
      setPreviewImage('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setPreviewImage('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato inválido. Use JPG, PNG, WebP ou GIF.');
      return;
    }

    // Validar tamanho (50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo: 50MB');
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadFile(file, 'images');
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setFormData({ ...formData, imageUrl: result.url! });
      setPreviewImage(result.url!);
      toast.success('Imagem enviada!');
    } catch (err) {
      toast.error('Erro ao enviar imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.imageUrl) {
      toast.error('Imagem é obrigatória');
      return;
    }

    setIsSaving(true);
    try {
      if (editingBanner) {
        await api.updateBanner(editingBanner.id, {
          title: formData.title || undefined,
          subtitle: formData.subtitle || undefined,
          imageUrl: formData.imageUrl,
          linkUrl: formData.linkUrl || undefined,
          active: formData.active
        });
        toast.success('Banner atualizado!');
      } else {
        // Novo banner - position será o próximo número
        const nextPosition = banners.length > 0
          ? Math.max(...banners.map(b => b.position)) + 1
          : 0;

        await api.createBanner({
          title: formData.title || undefined,
          subtitle: formData.subtitle || undefined,
          imageUrl: formData.imageUrl,
          linkUrl: formData.linkUrl || undefined,
          position: nextPosition,
          active: formData.active
        });
        toast.success('Banner criado!');
      }
      handleCloseModal();
      loadBanners();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar banner');
    } finally {
      setIsSaving(false);
    }
  };

  // Abrir modal de exclusão
  const openDeleteModal = (banner: Banner) => {
    setDeletingBanner(banner);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeletingBanner(null);
  };

  const confirmDelete = async () => {
    if (!deletingBanner) return;

    setIsDeleting(true);
    try {
      // Deletar imagem do storage se for URL do Supabase
      if (deletingBanner.imageUrl && !isBlobUrl(deletingBanner.imageUrl)) {
        await deleteFile(deletingBanner.imageUrl);
      }

      await api.deleteBanner(deletingBanner.id);
      toast.success('Banner excluído!');
      loadBanners();
    } catch (err) {
      toast.error('Erro ao excluir banner');
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
    }
  };

  // Mover banner para cima/baixo
  const moveBanner = async (banner: Banner, direction: 'up' | 'down') => {
    const currentIndex = banners.findIndex(b => b.id === banner.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const targetBanner = banners[targetIndex];

    try {
      // Trocar posições
      await api.updateBanner(banner.id, { position: targetBanner.position });
      await api.updateBanner(targetBanner.id, { position: banner.position });

      loadBanners();
    } catch (err) {
      toast.error('Erro ao reordenar');
    }
  };

  // Toggle ativo/inativo
  const toggleActive = async (banner: Banner) => {
    try {
      await api.updateBanner(banner.id, { active: !banner.active });
      setBanners(prev => prev.map(b =>
        b.id === banner.id ? { ...b, active: !b.active } : b
      ));
      toast.success(banner.active ? 'Banner desativado' : 'Banner ativado');
    } catch (err) {
      toast.error('Erro ao alterar status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary">Gerenciar Banners</h2>
          <p className="text-gray-500 text-sm">Configure os banners exibidos na página inicial.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={20} className="mr-2" /> Novo Banner
        </Button>
      </div>

      {/* Instruções */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Dicas para banners:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li><strong>Tamanho ideal:</strong> 1920 x 600 pixels (proporção 3.2:1)</li>
              <li><strong>Formatos aceitos:</strong> JPG, PNG, WebP</li>
              <li><strong>Tamanho máximo:</strong> 50MB por imagem</li>
              <li>Use imagens de alta qualidade para melhor visualização</li>
              <li>Textos importantes devem estar centralizados na imagem</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Lista de Banners */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-48 h-24 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <Image size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">Nenhum banner cadastrado</p>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={18} className="mr-2" /> Criar Primeiro Banner
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`bg-white rounded-lg border shadow-sm p-4 transition-all ${
                !banner.active ? 'opacity-60 bg-gray-50' : ''
              }`}
            >
              <div className="flex gap-4 items-center">
                {/* Preview da Imagem */}
                <div className="w-48 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title || 'Banner'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/192x96?text=Erro';
                    }}
                  />
                </div>

                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                    <h3 className="font-semibold text-gray-900 truncate">
                      {banner.title || 'Sem título'}
                    </h3>
                  </div>
                  {banner.subtitle && (
                    <p className="text-sm text-gray-500 truncate">{banner.subtitle}</p>
                  )}
                  {banner.linkUrl && (
                    <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                      <LinkIcon size={12} />
                      <span className="truncate">{banner.linkUrl}</span>
                    </div>
                  )}
                </div>

                {/* Status */}
                <button
                  onClick={() => toggleActive(banner)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    banner.active
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                  }`}
                >
                  {banner.active ? 'ATIVO' : 'INATIVO'}
                </button>

                {/* Reordenar */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveBanner(banner, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Mover para cima"
                  >
                    <ChevronUp size={18} />
                  </button>
                  <button
                    onClick={() => moveBanner(banner, 'down')}
                    disabled={index === banners.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Mover para baixo"
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(banner)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(banner)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Criação/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl animate-[fadeIn_0.2s_ease-out] max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="font-bold text-xl text-primary">
                {editingBanner ? 'Editar Banner' : 'Novo Banner'}
              </h3>
              <button onClick={handleCloseModal}>
                <X size={24} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Instruções resumidas */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                <strong>Tamanho ideal:</strong> 1920 x 600 pixels (JPG, PNG ou WebP)
              </div>

              {/* Upload de Imagem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem do Banner *
                </label>

                {previewImage ? (
                  <div className="relative">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage('');
                        setFormData({ ...formData, imageUrl: '' });
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    {isUploading ? (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-gray-500">Enviando...</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Clique para enviar uma imagem</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (máx. 50MB)</p>
                      </div>
                    )}
                  </label>
                )}
              </div>

              {/* Título */}
              <Input
                label="Título (opcional)"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Promoção de Verão"
              />

              {/* Subtítulo */}
              <Input
                label="Subtítulo (opcional)"
                value={formData.subtitle}
                onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Ex: Até 50% de desconto"
              />

              {/* Link */}
              <div>
                <Input
                  label="Link (opcional)"
                  value={formData.linkUrl}
                  onChange={e => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="Ex: /kits ou https://..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  Use links internos (ex: /kits) ou externos (ex: https://...)
                </p>
              </div>

              {/* Ativo */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="bannerActive"
                  checked={formData.active}
                  onChange={e => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 accent-primary"
                />
                <label htmlFor="bannerActive" className="text-sm font-medium text-gray-700">
                  Banner ativo (visível na página inicial)
                </label>
              </div>

              {/* Botões */}
              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  fullWidth
                  onClick={handleCloseModal}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  fullWidth
                  disabled={isSaving || isUploading || !formData.imageUrl}
                >
                  {isSaving ? 'Salvando...' : editingBanner ? 'Atualizar' : 'Criar Banner'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Excluir Banner"
        message={`Tem certeza que deseja excluir o banner "${deletingBanner?.title || 'Sem título'}"? Esta ação não pode ser desfeita.`}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
