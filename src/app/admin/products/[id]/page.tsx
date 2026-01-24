'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import ProductForm from '@/components/admin/ProductForm';
import type { Product } from '@/lib/supabase/types';

export default function EditProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const id = params?.id as string;
      if (!id) {
        setNotFoundState(true);
        setLoading(false);
        return;
      }

      const supabase = createClient();

      try {
        const { data, error: queryError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (queryError) {
          console.error('Edit product query error:', queryError);
          setError(queryError.message);
        } else if (!data) {
          setNotFoundState(true);
        } else {
          setProduct(data as Product);
        }
      } catch (e) {
        console.error('Edit product page error:', e);
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Product</h1>
            <p className="text-gray-400 mt-1">Loading...</p>
          </div>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading product...</p>
        </div>
      </div>
    );
  }

  if (notFoundState) {
    notFound();
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Product</h1>
            <p className="text-gray-400 mt-1">Error loading product</p>
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Error loading product</p>
            <p className="text-red-400/70 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Product</h1>
          <p className="text-gray-400 mt-1">{product.name}</p>
        </div>
      </div>

      <ProductForm mode="edit" product={product} />
    </div>
  );
}
