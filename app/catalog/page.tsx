"use client";

import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { useSearchParams } from 'next/navigation';

function CatalogContent() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get('category');
  const urlSearch = searchParams.get('search');

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    } else {
      setSelectedCategory('All');
    }
  }, [urlCategory]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

      if (data) {
        setProducts(data);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  // تصفية المنتجات حسب الفئة المختارة وحسب كلمة البحث إن وجدت
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = !urlSearch || p.title?.toLowerCase().includes(urlSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    'All',
    'Home Jerseys',
    'Away Jerseys',
    'Third Jerseys',
    'Retro Jerseys',
    'Equipment'
  ];

  return (
    <div className="bg-[#0a0a0a] min-h-screen py-16 text-white">
      <div className="container mx-auto px-6">
        
        {/* الترويسة */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight mb-3">
            {urlSearch 
              ? `SEARCH RESULTS FOR: "${urlSearch}"` 
              : selectedCategory === 'All' 
                ? '26/27 CATALOG' 
                : selectedCategory.toUpperCase()}
          </h1>
          <p className="text-gray-400">
            Browse the official kits and gear for the season.
          </p>
        </div>

        {/* أزرار الفلترة السريعة (Filter Tabs) */}
        <div className="flex flex-wrap gap-2 mb-12 border-b border-[#1f1f1f] pb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-[#00AEEF] text-white shadow-[0_0_15px_rgba(0,174,239,0.3)]'
                  : 'bg-[#121212] text-gray-400 hover:text-white hover:bg-[#1a1a1a] border border-[#1f1f1f]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* شبكة عرض المنتجات */}
        {loading ? (
          <div className="py-20 text-center text-gray-400">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-[#121212] rounded-2xl border border-[#1f1f1f]">
            <p className="text-xl font-bold mb-2">No items found</p>
            <p className="text-gray-400">Try searching for a different team or selecting another category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => {
              const imgUrl = Array.isArray(product.image_urls) && product.image_urls.length > 0 
                ? product.image_urls[0] 
                : product.imageUrl || 'https://images.unsplash.com/photo-1583318433420-532155e9d9e4?q=80&w=500&auto=format&fit=crop';

              return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={product.price?.toString() || '0'}
                  category={product.category || 'Jerseys'}
                  imageUrl={imgUrl}
                  loyaltyPoints={Number(product.loyalty_points_earned) || 20}
                />
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="bg-[#0a0a0a] min-h-screen py-20 text-center text-white">Loading...</div>}>
      <CatalogContent />
    </Suspense>
  );
}