'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Upload, X, Loader2, Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Product, ProductInsert, ProductUpdate, ProductCategory, ProductType, ProductGender } from '@/lib/supabase/types';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), { ssr: false });

interface ProductFormProps {
  product?: Product;
  mode: 'create' | 'edit';
}

const productTypes: { value: ProductType; label: string }[] = [
  { value: 'perfume', label: 'Perfume' },
  { value: 'essence-oil', label: 'Essence Oil' },
  { value: 'body-lotion', label: 'Body Lotion' },
];

const genders: { value: ProductGender | ''; label: string }[] = [
  { value: '', label: 'Not specified' },
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'unisex', label: 'Unisex' },
];

const sizes = ['10ml', '50ml', '60ml', '100ml', '150ml', '200ml'];

export default function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);
  const [error, setError] = useState('');
  const [additionalImages, setAdditionalImages] = useState<string[]>(
    product?.images ?? []
  );
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('product_categories')
      .select('slug, name')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setCategories(data.map((c) => ({ value: c.slug, label: c.name })));
        } else {
          // Fallback if table is empty
          setCategories([
            { value: 'men', label: "Men's Collection" },
            { value: 'women', label: "Women's Collection" },
            { value: 'niche', label: 'Niche Collection' },
            { value: 'essence-oil', label: 'Essence Oil' },
            { value: 'body-lotion', label: 'Body Lotion' },
          ]);
        }
      });
  }, []);

  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    sale_price: product?.sale_price?.toString() || '',
    category: product?.category || 'men' as ProductCategory,
    product_type: product?.product_type || 'perfume' as ProductType,
    size: product?.size || '50ml',
    image: product?.image || '',
    in_stock: product?.in_stock ?? true,
    is_active: product?.is_active ?? true,
    brand: product?.brand || '',
    gender: product?.gender || '' as ProductGender | '',
    tags: product?.tags?.join(', ') || '',
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, file);

    if (uploadError) {
      setError('Failed to upload image: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    setFormData(prev => ({ ...prev, image: publicUrl }));
    setUploading(false);
  };

  const handleAdditionalImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }
    if (additionalImages.length >= 5) {
      setError('Maximum 5 additional images');
      return;
    }

    setUploadingAdditional(true);
    setError('');

    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, file);

    if (uploadError) {
      setError('Failed to upload image: ' + uploadError.message);
      setUploadingAdditional(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    setAdditionalImages(prev => [...prev, publicUrl]);
    setUploadingAdditional(false);

    // Reset file input so same file can be re-selected
    if (additionalFileInputRef.current) {
      additionalFileInputRef.current.value = '';
    }
  }, [additionalImages.length]);

  const removeAdditionalImage = useCallback((index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      const productData: ProductInsert | ProductUpdate = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        category: formData.category,
        product_type: formData.product_type,
        size: formData.size,
        image: formData.image,
        images: additionalImages,
        in_stock: formData.in_stock,
        is_active: formData.is_active,
        brand: formData.brand || null,
        gender: formData.gender || null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : null,
      };

      if (mode === 'create') {
        const { error } = await supabase
          .from('products')
          .insert(productData as ProductInsert);

        if (error) {
          setError('Failed to create product: ' + error.message);
          return;
        }
      } else {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product!.id);

        if (error) {
          setError('Failed to update product: ' + error.message);
          return;
        }
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError('Failed to save product: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-white">Product Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
                placeholder="e.g. Oud Ispahan by Dior"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <RichTextEditor
                content={formData.description}
                onChange={(html) => setFormData(prev => ({ ...prev, description: html }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Brand
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
                placeholder="e.g. Dior, Chanel, Aquad'or"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
                placeholder="e.g. oud, woody, oriental"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-white">Pricing</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
                  placeholder="29.99"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sale Price (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.sale_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, sale_price: e.target.value }))}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
                  placeholder="24.99"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image Upload */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Product Image</h2>

            {formData.image ? (
              <div className="relative aspect-square w-full">
                <Image
                  src={formData.image}
                  alt="Product"
                  fill
                  className="object-cover rounded-lg"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-gold/50 transition-colors"
              >
                {uploading ? (
                  <Loader2 className="h-8 w-8 text-gold mx-auto animate-spin" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Click to upload image</p>
                    <p className="text-gray-500 text-xs mt-1">PNG, JPG up to 5MB</p>
                  </>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Or enter image URL
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                className="w-full px-4 py-2.5 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors text-sm"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Additional Images */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Additional Images</h2>
              <span className="text-xs text-gray-500">{additionalImages.length}/5</span>
            </div>

            {additionalImages.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {additionalImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={img}
                      alt={`Additional ${i + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeAdditionalImage(i)}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {additionalImages.length < 5 && (
              <div
                onClick={() => additionalFileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-700 rounded-lg p-5 text-center cursor-pointer hover:border-gold/50 transition-colors"
              >
                {uploadingAdditional ? (
                  <Loader2 className="h-6 w-6 text-gold mx-auto animate-spin" />
                ) : (
                  <>
                    <Plus className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-gray-400 text-xs">Add image</p>
                  </>
                )}
              </div>
            )}

            <input
              ref={additionalFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAdditionalImageUpload}
              className="hidden"
            />
          </div>

          {/* Product Details */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Details</h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ProductCategory }))}
                required
                className="w-full px-4 py-2.5 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold transition-colors"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Product Type *
              </label>
              <select
                value={formData.product_type}
                onChange={(e) => setFormData(prev => ({ ...prev, product_type: e.target.value as ProductType }))}
                required
                className="w-full px-4 py-2.5 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold transition-colors"
              >
                {productTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Size *
              </label>
              <select
                value={formData.size}
                onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                required
                className="w-full px-4 py-2.5 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold transition-colors"
              >
                {sizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as ProductGender | '' }))}
                className="w-full px-4 py-2.5 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold transition-colors"
              >
                {genders.map(g => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="in_stock"
                checked={formData.in_stock}
                onChange={(e) => setFormData(prev => ({ ...prev, in_stock: e.target.checked }))}
                className="w-5 h-5 rounded border-gray-700 bg-black/50 text-gold focus:ring-gold"
              />
              <label htmlFor="in_stock" className="text-sm font-medium text-gray-300">
                In Stock
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-5 h-5 rounded border-gray-700 bg-black/50 text-gold focus:ring-gold"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-300">
                Visible on site
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-800">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !formData.name || !formData.price || !formData.image}
          className="px-6 py-2.5 bg-gold text-black font-medium rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Update Product'}
        </button>
      </div>
    </form>
  );
}
