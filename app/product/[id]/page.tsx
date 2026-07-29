"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCartStore } from '@/store/cart';
import { ShieldCheck, Truck, RefreshCw, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('L');
  const [added, setAdded] = useState(false);

  const { addItem } = useCartStore();

  useEffect(() => {
    async function fetchProduct() {
      if (!productId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (data) {
        setProduct(data);
        const images = Array.isArray(data.image_urls) && data.image_urls.length > 0 
          ? data.image_urls 
          : ['https://images.unsplash.com/photo-1583318433420-532155e9d9e4?q=80&w=500&auto=format&fit=crop'];
        setSelectedImage(images[0]);
      }
      setLoading(false);
    }

    fetchProduct();
  }, [productId]);

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Link href="/catalog" className="text-[#00AEEF] underline">Return to Catalog</Link>
      </div>
    );
  }

  const galleryImages = Array.isArray(product.image_urls) && product.image_urls.length > 0 
    ? product.image_urls 
    : ['https://images.unsplash.com/photo-1583318433420-532155e9d9e4?q=80&w=500&auto=format&fit=crop'];

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedSize}`,
      title: `${product.title} (Size: ${selectedSize})`,
      price: product.price?.toString() || '0',
      image: galleryImages[0],
      quantity: 1
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const sizes = ['S', 'M', 'L', 'XL', '2XL'];

  return (
    <div className="bg-[#0a0a0a] min-h-screen py-12 text-white">
      <div className="container mx-auto px-6 max-w-6xl">
        
        <Link href="/catalog" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* معرض الصور التفاعلي (Image Gallery) */}
          <div className="space-y-4">
            {/* الصورة الرئيسية الكبيرة */}
            <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl overflow-hidden aspect-square flex items-center justify-center relative">
              <img 
                src={selectedImage} 
                alt={product.title} 
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>

            {/* الصور المصغرة للتنقل بين تفاصيل البدلة */}
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {galleryImages.map((url: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(url)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition ${
                      selectedImage === url 
                        ? 'border-[#00AEEF] opacity-100 scale-95' 
                        : 'border-[#1f1f1f] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Detail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* معلومات البدلة واختيار المقاس وزر الشراء */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#00AEEF] bg-[#121212] px-3 py-1 rounded-full border border-[#1f1f1f]">
                {product.category || 'Jerseys'} • 26/27 SEASON
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold uppercase mt-4 mb-2 tracking-tight">
                {product.title}
              </h1>
              <p className="text-3xl font-black text-[#00AEEF]">${product.price}</p>
            </div>

            <p className="text-gray-400 leading-relaxed">
              {product.description || 'Official player-version football jersey engineered for peak athletic performance. Breathable, sweat-wicking fabric with authentic crest and match-day detailing.'}
            </p>

            {/* اختيار المقاس */}
            <div className="pt-4 border-t border-[#1f1f1f]">
              <label className="block text-sm font-bold uppercase mb-3 text-gray-300">
                Select Size: <span className="text-[#00AEEF]">{selectedSize}</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-12 rounded-xl font-extrabold text-sm transition border ${
                      selectedSize === size
                        ? 'bg-[#00AEEF] text-white border-[#00AEEF] shadow-[0_0_15px_rgba(0,174,239,0.3)]'
                        : 'bg-[#121212] text-gray-400 border-[#1f1f1f] hover:border-gray-500 hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* زر إضافة للسلة */}
            <div className="pt-4">
              <button
                onClick={handleAddToCart}
                disabled={added}
                className={`w-full py-5 rounded-xl font-extrabold uppercase tracking-wide text-lg transition shadow-lg flex items-center justify-center gap-2 ${
                  added 
                    ? 'bg-green-600 text-white' 
                    : 'bg-[#00AEEF] hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(0,174,239,0.3)]'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-6 h-6" /> Added To Cart!
                  </>
                ) : (
                  'Add To Cart'
                )}
              </button>
            </div>

            {/* شريط الضمان والتوصيل */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#1f1f1f] text-sm text-gray-400">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#00AEEF]" />
                <span>Fast Lebanon Delivery</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#00AEEF]" />
                <span>Cash on Delivery</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}