"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useCartStore } from '@/store/cart';
import { 
  ShoppingCart, 
  Award, 
  ShieldCheck, 
  Truck, 
  Clock, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import Link from 'next/link';

// المقاسات المتاحة من S إلى XL فقط
const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL'];

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  // فك الـ params بأمان لتوافق Next.js 15+ و 16
  const { id } = React.use(params);

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('L');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  const { addItem } = useCartStore();

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (data && !error) {
        setProduct(data);
      }
      setLoading(false);
    }

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen text-white flex items-center justify-center">
        <div className="text-center text-gray-400">Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen text-white flex flex-col items-center justify-center px-6">
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-gray-400 mb-6">The kit or item you are looking for does not exist.</p>
        <Link 
          href="/catalog" 
          className="bg-[#00AEEF] hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition"
        >
          Back to Catalog
        </Link>
      </div>
    );
  }

  // إعداد معرض الصور
  const galleryImages: string[] = 
    Array.isArray(product.image_urls) && product.image_urls.length > 0
      ? product.image_urls
      : [product.imageUrl || 'https://images.unsplash.com/photo-1583318433420-532155e9d9e4?q=80&w=800&auto=format&fit=crop'];

  const mainImage = galleryImages[activeImageIndex] || galleryImages[0];

  // فحص هل المنتج هو Special Order (Pre-Order)
  const isSpecialOrder = 
    product.category === 'Special Orders' || 
    product.category?.toLowerCase().includes('special');

  const handleAddToCart = () => {
    const finalPoints = Number(product.loyalty_points_earned) > 0 
      ? Number(product.loyalty_points_earned) 
      : 20;

    addItem({
      id: `${product.id}-${selectedSize}`,
      title: isSpecialOrder 
        ? `[Pre-Order] ${product.title} (Size: ${selectedSize})` 
        : `${product.title} (Size: ${selectedSize})`,
      price: product.price?.toString() || '0',
      image: mainImage,
      quantity: 1,
      loyalty_points_earned: finalPoints
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen py-16 text-white">
      <div className="container mx-auto px-6 max-w-6xl">
        
        {/* زر العودة للكتالوج */}
        <Link 
          href="/catalog" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* معرض الصور (العمود الأيسر - 7 أعمدة) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative h-[450px] md:h-[550px] bg-[#121212] border border-[#1f1f1f] rounded-2xl overflow-hidden flex items-center justify-center">
              <img 
                src={mainImage} 
                alt={product.title} 
                className="object-cover h-full w-full opacity-90 hover:opacity-100 transition duration-500"
              />

              {/* شارة Pre-Order إن وجد */}
              {isSpecialOrder && (
                <span className="absolute top-4 left-4 bg-purple-950/90 text-purple-300 border border-purple-500/50 text-xs font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xl">
                  <Clock className="w-4 h-4" /> PRE-ORDER ITEM
                </span>
              )}

              {/* شارة نقاط الولاء */}
              <span className="absolute bottom-4 right-4 bg-black/80 text-amber-400 border border-amber-500/30 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
                <Award className="w-4 h-4" /> +{Number(product.loyalty_points_earned) > 0 ? Number(product.loyalty_points_earned) : 20} PTS
              </span>
            </div>

            {/* صور مصغرة (Thumbnails) في حال وجود أكثر من صورة */}
            {galleryImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {galleryImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                      activeImageIndex === index 
                        ? 'border-[#00AEEF] opacity-100 scale-95' 
                        : 'border-[#1f1f1f] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* تفاصيل المنتج (العمود الأيمن - 5 أعمدة) */}
          <div className="lg:col-span-5 bg-[#121212] p-6 md:p-8 rounded-2xl border border-[#1f1f1f] space-y-6 sticky top-24">
            
            {/* الكاتيغوري والدوري */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full border ${
                isSpecialOrder 
                  ? 'bg-purple-950/60 text-purple-400 border-purple-500/40' 
                  : 'bg-[#1a1a1a] text-[#00AEEF] border-[#333]'
              }`}>
                {product.category || 'Kits'}
              </span>
              {product.league && (
                <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-[#1a1a1a] text-gray-300 border border-[#333]">
                  ⚽ {product.league}
                </span>
              )}
            </div>

            {/* عنوان المنتج وسعره */}
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white leading-snug">
                {product.title}
              </h1>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-3xl font-black text-white">
                  ${product.price}
                </span>
                <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold px-2.5 py-1 rounded-md">
                  +{Number(product.loyalty_points_earned) > 0 ? Number(product.loyalty_points_earned) : 20} Loyalty PTS
                </span>
              </div>
            </div>

            {/* شرح إضافي لطلب Pre-Order */}
            {isSpecialOrder && (
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 text-xs text-purple-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-purple-300">
                  <Clock className="w-4 h-4" /> Special Pre-Order Information
                </p>
                <p>
                  This item is imported upon request. Delivery within Lebanon typically takes between 10 to 14 business days.
                </p>
              </div>
            )}

            {/* خيار اختيار المقاس (S إلى XL فقط) */}
            <div className="border-y border-[#222] py-6">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-xs font-extrabold uppercase text-gray-400 tracking-wider">
                  Select Size (Adult)
                </label>
                <span className="text-xs text-[#00AEEF] font-semibold cursor-pointer hover:underline">
                  Size Guide
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {AVAILABLE_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-12 rounded-xl font-bold text-sm transition border flex items-center justify-center ${
                      selectedSize === size
                        ? 'bg-[#00AEEF] text-white border-[#00AEEF] shadow-[0_0_15px_rgba(0,174,239,0.4)]'
                        : 'bg-[#1a1a1a] text-gray-300 border-[#2b2b2b] hover:border-gray-500'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* زر الإضافة إلى السلة */}
            <button
              onClick={handleAddToCart}
              disabled={addedToCart}
              className={`w-full font-extrabold py-5 rounded-xl transition shadow-lg text-lg flex items-center justify-center gap-3 ${
                addedToCart
                  ? 'bg-green-600 text-white shadow-[0_0_20px_rgba(22,163,74,0.4)]'
                  : 'bg-[#00AEEF] hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(0,174,239,0.3)]'
              }`}
            >
              {addedToCart ? (
                <>
                  <CheckCircle2 className="w-6 h-6 animate-bounce" /> Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-6 h-6" /> 
                  {isSpecialOrder ? `Pre-Order Now — Size ${selectedSize}` : `Add to Cart — Size ${selectedSize}`}
                </>
              )}
            </button>

            {/* مميزات الخدمة */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#222] text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#00AEEF] shrink-0" />
                <span>Fast Lebanon Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00AEEF] shrink-0" />
                <span>Cash on Delivery</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}