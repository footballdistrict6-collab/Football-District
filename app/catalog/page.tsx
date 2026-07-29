// هذا السطر يجبر الموقع على جلب البيانات الحية في كل مرة وعدم استخدام نسخة قديمة
export const dynamic = 'force-dynamic';

import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

export default async function Catalog() {
  // جلب البيانات مع التقاط أي خطأ محتمل
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="bg-[#0a0a0a] min-h-screen py-20">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wide mb-2">
          26/27 <span className="text-[#00AEEF]">Catalog</span>
        </h1>
        <p className="text-gray-400 mb-12">Browse the official kits for the new season.</p>
        
        {/* صندوق كشف الأخطاء: سيظهر فقط إذا كان هناك مشكلة حقيقية */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-6 rounded-lg mb-8">
            <h2 className="font-bold text-xl mb-2">🚨 رسالة خطأ من قاعدة البيانات:</h2>
            <p>{error.message}</p>
          </div>
        )}

        {/* إذا لم يكن هناك خطأ ولكن قاعدة البيانات فارغة */}
        {!error && (!products || products.length === 0) ? (
          <div className="text-center py-20 bg-[#121212] rounded-lg border border-[#1f1f1f]">
            <h3 className="text-xl text-white mb-2">The catalog is currently empty.</h3>
            <p className="text-gray-400">Products added from your dashboard will appear here automatically.</p>
          </div>
        ) : null}

        {/* إذا كان هناك منتجات، اعرضها في شبكة */}
        {products && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard 
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.price}
                category={product.category}
                imageUrl={product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : 'https://images.unsplash.com/photo-1583318433420-532155e9d9e4?q=80&w=500&auto=format&fit=crop'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}