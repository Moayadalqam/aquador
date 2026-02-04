'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ProductCategoryRow, ProductCategoryInsert, ProductCategoryUpdate } from '@/lib/supabase/types';
import {
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  GripVertical,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';

interface CategoryWithCount extends ProductCategoryRow {
  product_count: number;
}

type ModalMode = 'create' | 'edit' | null;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingCategory, setEditingCategory] = useState<ProductCategoryRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    is_active: true,
  });

  const supabase = createClient();

  const fetchCategories = useCallback(async () => {
    try {
      // Fetch categories
      const { data: cats, error: catError } = await supabase
        .from('product_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (catError) throw catError;

      // Fetch product counts per category slug
      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('category');

      if (prodError) throw prodError;

      const counts = (products || []).reduce((acc, p: { category: string }) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const withCounts: CategoryWithCount[] = (cats || []).map((cat) => ({
        ...cat,
        product_count: counts[cat.slug] || 0,
      }));

      setCategories(withCounts);
      setError(null);
    } catch (e) {
      console.error('Categories fetch error:', e);
      setError(e instanceof Error ? e.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const openCreateModal = () => {
    setFormData({ name: '', slug: '', description: '', is_active: true });
    setEditingCategory(null);
    setModalMode('create');
  };

  const openEditModal = (category: ProductCategoryRow) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      is_active: category.is_active,
    });
    setEditingCategory(category);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingCategory(null);
    setError(null);
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      // Auto-generate slug only on create, not edit
      ...(modalMode === 'create' ? { slug: generateSlug(name) } : {}),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (modalMode === 'create') {
        const newCategory: ProductCategoryInsert = {
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          description: formData.description.trim() || null,
          is_active: formData.is_active,
          display_order: categories.length + 1,
        };

        const { error: insertError } = await supabase
          .from('product_categories')
          .insert(newCategory);

        if (insertError) throw insertError;
      } else if (modalMode === 'edit' && editingCategory) {
        const updates: ProductCategoryUpdate = {
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          description: formData.description.trim() || null,
          is_active: formData.is_active,
          updated_at: new Date().toISOString(),
        };

        const { error: updateError } = await supabase
          .from('product_categories')
          .update(updates)
          .eq('id', editingCategory.id);

        if (updateError) throw updateError;
      }

      closeModal();
      await fetchCategories();
    } catch (e) {
      console.error('Save error:', e);
      setError(e instanceof Error ? e.message : 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);

    try {
      const { error: deleteError } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', deleteId);

      if (deleteError) throw deleteError;

      setDeleteId(null);
      await fetchCategories();
    } catch (e) {
      console.error('Delete error:', e);
      setError(e instanceof Error ? e.message : 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (category: CategoryWithCount) => {
    try {
      const { error: updateError } = await supabase
        .from('product_categories')
        .update({ is_active: !category.is_active, updated_at: new Date().toISOString() })
        .eq('id', category.id);

      if (updateError) throw updateError;
      await fetchCategories();
    } catch (e) {
      console.error('Toggle error:', e);
      setError(e instanceof Error ? e.message : 'Failed to update category');
    }
  };

  const categoryToDelete = categories.find((c) => c.id === deleteId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-gray-400 mt-1">Manage product categories</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gold text-black font-medium rounded-lg hover:bg-amber-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Error banner */}
      {error && !modalMode && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-400 font-medium">Error</p>
            <p className="text-red-400/70 text-sm mt-1">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Categories table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-gold animate-spin" />
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4 w-10">
                  #
                </th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">
                  Category
                </th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">
                  Slug
                </th>
                <th className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">
                  Products
                </th>
                <th className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">
                  Status
                </th>
                <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="hover:bg-gray-800/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <GripVertical className="h-4 w-4 text-gray-600 group-hover:text-gray-400" />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{category.name}</p>
                      {category.description && (
                        <p className="text-gray-500 text-sm mt-0.5 line-clamp-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded">
                      {category.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gold font-semibold text-lg">
                      {category.product_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleActive(category)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        category.is_active
                          ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {category.is_active ? (
                        <>
                          <Eye className="h-3 w-3" /> Active
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" /> Hidden
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/shop/${category.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                        title="View on storefront"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => openEditModal(category)}
                        className="p-2 text-gray-400 hover:text-gold hover:bg-gray-800 rounded-lg transition-colors"
                        title="Edit category"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(category.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No categories yet. Click &quot;Add Category&quot; to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">
                {modalMode === 'create' ? 'New Category' : 'Edit Category'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {error && modalMode && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
                  placeholder="e.g. Unisex Collection"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors font-mono text-sm"
                  placeholder="e.g. unisex-collection"
                />
                <p className="text-gray-500 text-xs mt-1.5">
                  Used in URLs: /shop/{formData.slug || 'slug'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors resize-none"
                  placeholder="Brief description of this category..."
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, is_active: !prev.is_active }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.is_active ? 'bg-gold' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.is_active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <label className="text-sm font-medium text-gray-300">
                  {formData.is_active ? 'Active — visible on storefront' : 'Hidden — not visible on storefront'}
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !formData.name.trim() || !formData.slug.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gold text-black font-medium rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {modalMode === 'create' ? 'Create Category' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          />
          <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Delete Category</h3>
            <p className="text-gray-400 text-sm">
              Are you sure you want to delete{' '}
              <span className="text-white font-medium">
                {categoryToDelete?.name}
              </span>
              ?
              {(categoryToDelete?.product_count ?? 0) > 0 && (
                <span className="block mt-2 text-amber-400">
                  This category has {categoryToDelete?.product_count} product(s).
                  Products will keep their current category value but it won&apos;t
                  appear in the admin dropdown.
                </span>
              )}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
