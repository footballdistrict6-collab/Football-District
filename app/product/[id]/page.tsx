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
  Sparkles,
  MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import SizeGuideModal from '@/components/SizeGuideModal';
import { trackFbEvent } from '@/lib/fbPixel';

// تمت إضافة XXL هنا للمقاسات الاحتياطية
const KIT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const BOOT_SIZES = ['38', '39', '40', '41', '42', '43', '44', '45'];
const KIDS_SIZES = ['2-4', '4-5', '5-6', '7-8', '9', '10-11', '12-13'];

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { id } = React.use(params);

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  // حالة المتغيرات والمخزون
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [selectedSize, setSelectedSize] = useState('');

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  const [isCustomized, setIsCustomized] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customNumber, setCustomNumber] = useState('');

  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const { addItem } = useCartStore();

  useEffect(() => {
    async function fetchProductAndVariants() {
      setLoading(true);
      
      // 1. جلب المنتج الأساسي
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (productData && !productError) {
        setProduct(productData);
        
        // إرسال حدث ViewContent إلى Meta Pixel
        trackFbEvent('ViewContent', {
          content_name: productData.title,
          content_category: productData.category,
          content_ids: [String(productData.id)],
          content_type: 'product',
          value: parseFloat(productData.price) || 0,
          currency: 'USD'
        });
        
        const categoryLower = productData.category?.toLowerCase() || '';
        const isBoot = categoryLower.includes('boot') || productData.category === 'Boots';
        const isKids = categoryLower === 'kids' || categoryLower.includes('kids');
        
        // 2. جلب مقاسات ومخزون هذا المنتج من قاعدة البيانات (إن وجدت)
        const { data: variantsData } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', id)
          .order('id', { ascending: true });

        let productVariants = variantsData || [];

        // 3. نظام الحماية الذكي: إذا كان المنتج قديماً ولا يمتلك مقاسات في الجدول الجديد
        if (productVariants.length === 0) {
           const fallbackSizes = isBoot ? BOOT_SIZES : isKids ? KIDS_SIZES : KIT_SIZES;
           productVariants = fallbackSizes.map((s, idx) => ({
               id: `fallback-${idx}`,
               size: s,
               stock_quantity: 999, // مخزون لا نهائي للمنتجات القديمة لتفادي تعطل المتجر
               low_stock_threshold: 2
           }));
        }

        setVariants(productVariants);

        // 4. تحديد المقاس الافتراضي (أول مقاس متوفر في المخزون)
        const firstAvailable = productVariants.find(v => v.stock_quantity > 0) || productVariants[0];
        if (firstAvailable) {
          setSelectedSize(firstAvailable.size);
          setSelectedVariant(firstAvailable);
        }
      }
      setLoading(false);
    }

    if (id) {
      fetchProductAndVariants();
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
        <Link href="/catalog" className="bg-[#00AEEF] hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const galleryImages: string[] = 
    Array.isArray(product.image_urls) && product.image_urls.length > 0
      ? product.image_urls
      : [product.imageUrl || 'https://images.unsplash.com/photo-1583318433420-532155e9d9e4?q=80&w=800&auto=format&fit=crop'];

  const mainImage = galleryImages[activeImageIndex] || galleryImages[0];

  const categoryLower = product.category?.toLowerCase() || '';
  const isPreOrder = 
    product.category === 'Special Orders' || 
    product.category === 'Pre-Order' || 
    categoryLower.includes('special') || 
    categoryLower.includes('pre-order') || 
    categoryLower.includes('preorder') ||
    product.title?.toLowerCase().includes('pre-order') ||
    product.title?.toLowerCase().includes('preorder');
  
  const isProductOutOfStock = 
    product.in_stock === false || 
    (variants.length > 0 && variants.every(v => Number(v.stock_quantity) === 0));

  const isBootCategory = categoryLower.includes('boot') || product.category === 'Boots';
  const isKidsCategory = categoryLower === 'kids' || categoryLower.includes('kids');
  const isPrintable = product.category === 'Kits' || product.category === 'Retro Kits' || isKidsCategory || categoryLower.includes('jersey');
  
  const basePrice = parseFloat(product.price) || 0;
  const finalPrice = isCustomized ? basePrice + 5.00 : basePrice;

  // --- دالة إضافة المنتج للسلة ---
  const handleAddToCart = () => {
    if (isProductOutOfStock) {
      alert('⚠️ Sorry, this product is currently Out of Stock.');
      return;
    }

    if (isCustomized && (!customName.trim() || !customNumber.trim())) {
      alert('⚠️ Please enter both the Name and Number for your custom print.');
      return;
    }

    const finalPoints = Number(product.loyalty_points_earned) > 0 ? Number(product.loyalty_points_earned) : 20;

    const cartItemId = isCustomized 
      ? `${product.id}-${selectedSize}-PRINT-${customName}-${customNumber}` 
      : `${product.id}-${selectedSize}`;
      
    const preOrderTag = isPreOrder ? '[Pre-Order] ' : '';
    const printTag = isCustomized ? ` | Print: ${customName} #${customNumber}` : '';
    const cartItemTitle = `${preOrderTag}${product.title} (Size: ${selectedSize})${printTag}`;

    addItem({
      id: cartItemId,
      variant_id: selectedVariant?.id,
      title: cartItemTitle,
      price: finalPrice.toString(),
      image: mainImage,
      quantity: 1,
      category: product.category || 'Kits',
      loyalty_points_earned: finalPoints
    });

    // إرسال حدث AddToCart إلى Meta Pixel
    trackFbEvent('AddToCart', {
      content_name: product.title,
      content_category: product.category,
      content_ids: [String(product.id)],
      content_type: 'product',
      value: finalPrice,
      currency: 'USD'
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  // --- إعداد رسالة الواتساب للطلب المباشر ---
  const whatsappMessage = encodeURIComponent(
    `Hello! I would like to order from the website:\n\n` +
    `🏆 Product: ${isPreOrder ? '[PRE-ORDER] ' : ''}${product.title}\n` +
    `📏 Size: ${selectedSize}\n` +
    `💵 Price: $${finalPrice.toFixed(2)}\n` +
    `${isPreOrder ? `✈️ Status: PRE-ORDER\n` : ''}` +
    `${isCustomized ? `👕 Customization: YES (Name: ${customName}, No:${customNumber})\n` : ''}` +
    `\nPlease confirm availability and total.`
  );
  const whatsappNumber = "96176079774"; // يمكنك تغييره لرقمك

  return (
    <div className="bg-[#0a0a0a] min-h-screen py-16 text-white">
      <div className="container mx-auto px-6 max-w-6xl">
        
        <Link href="/catalog" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* قسم الصور */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative h-[450px] md:h-[550px] bg-[#121212] border border-[#1f1f1f] rounded-2xl overflow-hidden flex items-center justify-center">
              <img src={mainImage} alt={product.title} className={`object-cover h-full w-full transition duration-500 ${isProductOutOfStock ? 'grayscale-[30%] opacity-70' : 'opacity-90 hover:opacity-100'}`} />
              
              {/* شارة Pre-Order الواضحة والمميزة */}
              {isPreOrder && (
                <span className="absolute top-4 left-4 bg-purple-600 text-white border border-purple-400/60 text-xs font-black tracking-wider uppercase px-3.5 py-1.5 rounded-lg flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.5)] z-10">
                  <Clock className="w-4 h-4 stroke-[2.5]" /> PRE-ORDER
                </span>
              )}

              {/* شارة Out of Stock */}
              {isProductOutOfStock && (
                <span className="absolute top-4 right-4 bg-red-600 text-white text-xs font-black tracking-wider uppercase px-3.5 py-1.5 rounded-lg border border-red-400/50 shadow-xl z-10">
                  OUT OF STOCK
                </span>
              )}

              <span className="absolute bottom-4 right-4 bg-black/80 text-amber-400 border border-amber-500/30 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
                <Award className="w-4 h-4" /> +{Number(product.loyalty_points_earned) > 0 ? Number(product.loyalty_points_earned) : 20} PTS
              </span>
            </div>

            {galleryImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {galleryImages.map((img, index) => (
                  <button key={index} onClick={() => setActiveImageIndex(index)} className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition shrink-0 ${activeImageIndex === index ? 'border-[#00AEEF] opacity-100 scale-95' : 'border-[#1f1f1f] opacity-60 hover:opacity-100'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* تفاصيل المنتج وخيارات الشراء */}
          <div className="lg:col-span-5 bg-[#121212] p-6 md:p-8 rounded-2xl border border-[#1f1f1f] space-y-6 sticky top-24">
            
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full border ${isPreOrder ? 'bg-purple-950/60 text-purple-400 border-purple-500/40' : 'bg-[#1a1a1a] text-[#00AEEF] border-[#333]'}`}>
                {product.category || 'Kits'}
              </span>

              {isPreOrder && (
                <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-purple-600 text-white border border-purple-400/50 flex items-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
                  <Clock className="w-3.5 h-3.5 stroke-[2.5]" /> PRE-ORDER
                </span>
              )}

              {isProductOutOfStock && (
                <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-red-950/80 text-red-300 border border-red-500/40">
                  OUT OF STOCK
                </span>
              )}

              {product.league && (
                <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-[#1a1a1a] text-gray-300 border border-[#333]">
                  ⚽ {product.league}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white leading-snug">
                {product.title}
              </h1>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-3xl font-black text-white transition-all">
                  ${finalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* تنبيه منتجات الـ Pre-Order */}
            {isPreOrder && (
              <div className="bg-purple-950/40 border border-purple-500/40 rounded-xl p-3.5 text-xs text-purple-200 flex items-center gap-3">
                <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                <span><strong>PRE-ORDER ITEM:</strong> This item is custom-ordered upon request. Estimated delivery time applies.</span>
              </div>
            )}

            {/* تنبيه نفاذ المخزون */}
            {isProductOutOfStock && (
              <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-3.5 text-xs text-red-300 flex items-center gap-2.5">
                <span>⚠️ <strong>Currently Out of Stock:</strong> This item has reached 0 inventory or is temporarily unavailable.</span>
              </div>
            )}

            {/* قسم المقاسات (ديناميكي ومرتبط بالمخزون) */}
            <div className="border-t border-[#222] pt-6">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-xs font-extrabold uppercase text-gray-400 tracking-wider">
                  Select Size {isBootCategory ? '(EU)' : isKidsCategory ? '(Age)' : '(Adult)'}
                </label>
                {!isBootCategory && (
                  <button 
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-xs text-[#00AEEF] font-bold cursor-pointer hover:underline flex items-center gap-1"
                  >
                    View Size Guide
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {variants.map((v) => {
                  const isVariantOutOfStock = isProductOutOfStock || v.stock_quantity === 0;
                  const isLowStock = v.stock_quantity > 0 && v.stock_quantity <= (v.low_stock_threshold || 2);
                  const isSelected = selectedSize === v.size;

                  return (
                    <button 
                      key={v.id} 
                      type="button" 
                      disabled={isVariantOutOfStock}
                      onClick={() => {
                        setSelectedSize(v.size);
                        setSelectedVariant(v);
                      }} 
                      className={`relative px-4 h-12 rounded-xl font-bold text-sm transition border flex items-center justify-center min-w-[3.5rem] 
                        ${isVariantOutOfStock ? 'bg-[#1a0505] text-gray-600 border-red-900/30 opacity-60 cursor-not-allowed line-through' 
                        : isSelected ? 'bg-[#00AEEF] text-white border-[#00AEEF] shadow-[0_0_15px_rgba(0,174,239,0.4)]' 
                        : 'bg-[#1a1a1a] text-gray-300 border-[#2b2b2b] hover:border-gray-500'}`}
                    >
                      {v.size}
                      
                      {/* علامة Low Stock الذكية */}
                      {isLowStock && !isVariantOutOfStock && (
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                          Only {v.stock_quantity}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {(!selectedVariant || selectedVariant.stock_quantity === 0 || isProductOutOfStock) && (
                <p className="text-red-400 text-xs font-bold mt-3">⚠️ This size is currently Out of Stock.</p>
              )}
            </div>

            {/* قسم الطباعة الشخصية */}
            {isPrintable && (
              <div className="border-t border-[#222] pt-6 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="block text-sm font-extrabold text-white tracking-wide flex items-center gap-2">
                      Personalize Your Kit <Sparkles className="w-4 h-4 text-amber-400" />
                    </label>
                    <p className="text-xs text-gray-400 mt-1">Add a custom name & number <strong className="text-green-400">(+$5.00)</strong></p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setIsCustomized(!isCustomized);
                      if (isCustomized) {
                        setCustomName('');
                        setCustomNumber('');
                      }
                    }}
                    className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none ${isCustomized ? 'bg-[#00AEEF]' : 'bg-[#333]'}`}
                  >
                    <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform duration-300 ${isCustomized ? 'translate-x-7' : ''}`} />
                  </button>
                </div>

                {isCustomized && (
                  <div className="grid grid-cols-3 gap-3 animate-fadeIn">
                    <div className="col-span-2">
                      <input 
                        type="text" 
                        maxLength={12}
                        placeholder="NAME (e.g. MESSI)"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value.toUpperCase())}
                        className="w-full bg-[#1a1a1a] border border-[#2b2b2b] rounded-xl p-3 text-white text-sm font-bold focus:border-[#00AEEF] focus:outline-none placeholder-gray-600"
                      />
                    </div>
                    <div className="col-span-1">
                      <input 
                        type="text" 
                        maxLength={2}
                        placeholder="NO (10)"
                        value={customNumber}
                        onChange={(e) => setCustomNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-[#1a1a1a] border border-[#2b2b2b] rounded-xl p-3 text-white text-sm font-bold focus:border-[#00AEEF] focus:outline-none text-center placeholder-gray-600"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* أزرار الشراء المزدوجة (الموقع والواتساب) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={isProductOutOfStock || addedToCart || !selectedVariant || selectedVariant.stock_quantity === 0}
                className={`w-full font-extrabold py-4 rounded-xl transition shadow-lg text-sm flex items-center justify-center gap-2 ${
                  isProductOutOfStock 
                    ? 'bg-[#222] text-gray-600 cursor-not-allowed'
                    : addedToCart 
                      ? 'bg-green-600 text-white shadow-[0_0_20px_rgba(22,163,74,0.4)]' 
                      : isPreOrder
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]'
                        : 'bg-[#00AEEF] hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(0,174,239,0.3)]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isProductOutOfStock ? (
                  <>Out of Stock</>
                ) : addedToCart ? (
                  <><CheckCircle2 className="w-5 h-5 animate-bounce" /> Added to Cart!</>
                ) : isPreOrder ? (
                  <><Clock className="w-5 h-5" /> Pre-Order Now — ${finalPrice.toFixed(2)}</>
                ) : (
                  <><ShoppingCart className="w-5 h-5" /> Add to Cart — ${finalPrice.toFixed(2)}</>
                )}
              </button>

              <a
                href={isProductOutOfStock ? '#' : `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                target={isProductOutOfStock ? undefined : "_blank"}
                rel={isProductOutOfStock ? undefined : "noopener noreferrer"}
                onClick={() => {
                  if (!isProductOutOfStock) {
                    trackFbEvent('Contact', {
                      content_name: product.title,
                      content_category: product.category,
                      content_ids: [String(product.id)],
                      value: finalPrice,
                      currency: 'USD'
                    });
                  }
                }}
                className={`w-full font-extrabold py-4 rounded-xl transition shadow-lg text-sm flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20b858] text-white shadow-[0_0_20px_rgba(37,211,102,0.3)] disabled:opacity-50 disabled:cursor-not-allowed ${
                  (isProductOutOfStock || !selectedVariant || selectedVariant.stock_quantity === 0) ? 'pointer-events-none opacity-50 grayscale' : ''
                }`}
              >
                <MessageCircle className="w-5 h-5" /> {isPreOrder ? 'Pre-Order on WhatsApp' : 'Order on WhatsApp'}
              </a>
            </div>

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
      
      <SizeGuideModal 
        isOpen={isSizeGuideOpen} 
        onClose={() => setIsSizeGuideOpen(false)} 
      />
    </div>
  );
}