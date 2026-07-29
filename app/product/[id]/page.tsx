import { supabase } from '@/lib/supabase';
import { ShieldCheck, Truck } from 'lucide-react';
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';

// استخدام Promise لمعالجة التحديث الجديد في Next.js وقراءة الرابط بشكل صحيح
export default async function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  // 1. انتظار فك تشفير الرابط
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  // 2. جلب المنتج وطباعة الأخطاء إن وجدت
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  // صندوق كشف الأخطاء: سيظهر إذا كانت قاعدة البيانات تمنع القراءة
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#0a0a0a] text-white">
        <div className="bg-red-900/50 p-6 rounded-lg text-center border border-red-500">
          <h2 className="text-red-400 font-bold mb-2">🚨 رسالة خطأ من قاعدة البيانات:</h2>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  // إذا لم يجد المنتج
  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#0a0a0a] text-white">
        <h2 className="text-2xl">Product not found in database</h2>
      </div>
    );
  }

  const imageUrl = product.image_urls && product.image_urls.length > 0 
    ? product.image_urls[0] 
    : 'https://images.unsplash.com/photo-1583318433420-532155e9d9e4?q=80&w=500&auto=format&fit=crop';

  return (
    <div className="bg-[#0a0a0a] min-h-screen py-16">
      <div className="container mx-auto px-6">
        <Link href="/catalog" className="text-gray-400 hover:text-[#00AEEF] mb-8 inline-block transition">
          &larr; Back to Catalog
        </Link>

        <div className="flex flex-col md:flex-row gap-12 bg-[#121212] p-6 md:p-12 rounded-2xl border border-[#1f1f1f]">
          <div className="w-full md:w-1/2 bg-[#1a1a1a] rounded-xl overflow-hidden flex items-center justify-center p-8">
            <img src={imageUrl} alt={product.title} className="max-w-full h-auto object-contain hover:scale-110 transition duration-500" />
          </div>

          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <span className="text-[#00AEEF] font-bold tracking-wider uppercase mb-2">{product.category}</span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{product.title}</h1>
            <p className="text-3xl font-light text-white mb-6">${product.price}</p>
            
            <p className="text-gray-400 mb-8 leading-relaxed">
              {product.description || "Official 2026/27 season gear. Engineered for peak performance and ultimate comfort on and off the pitch. Premium quality materials ensure durability and breathability."}
            </p>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-white font-medium">Select Size</span>
                <span className="text-[#00AEEF] text-sm cursor-pointer hover:underline">Size Guide</span>
              </div>
              <div className="flex gap-3">
                {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                  <button key={size} className="w-12 h-12 rounded border border-[#333] flex items-center justify-center text-white hover:border-[#00AEEF] hover:text-[#00AEEF] transition">
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mb-8">
              <AddToCartButton product={product} />
            </div>

            <div className="space-y-4 border-t border-[#1f1f1f] pt-6">
              <div className="flex items-center gap-3 text-gray-400">
                <Truck className="w-5 h-5 text-[#00AEEF]" />
                <span>Fast Delivery Across Lebanon</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <ShieldCheck className="w-5 h-5 text-[#00AEEF]" />
                <span>100% Authentic Products</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}