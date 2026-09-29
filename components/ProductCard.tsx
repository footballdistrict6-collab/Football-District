"use client";

import Link from 'next/link';
import { ShoppingCart, Award, Clock } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { trackFbEvent } from '@/lib/fbPixel';

interface ProductCardProps {
  id: string | number;
  title: string;
  price: string;
  category: string;
  imageUrl: string;
  loyaltyPoints?: number;
  inStock?: boolean;
}

export default function ProductCard({ 
  id, 
  title, 
  price, 
  category, 
  imageUrl, 
  loyaltyPoints = 20,
  inStock = true
}: ProductCardProps) {
  const { addItem } = useCartStore();

  // فحص هل المنتج متاح للطلب المسبق (Pre-Order)
  const isPreOrder = 
    category === 'Special Orders' || 
    category === 'Pre-Order' || 
    category?.toLowerCase().includes('special') || 
    category?.toLowerCase().includes('pre-order') || 
    category?.toLowerCase().includes('preorder') ||
    title?.toLowerCase().includes('pre-order') ||
    title?.toLowerCase().includes('preorder');

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!inStock) {
      alert("⚠️ Sorry, this item is currently Out of Stock.");
      return;
    }

    const finalPoints = Number(loyaltyPoints) > 0 ? Number(loyaltyPoints) : 20;

    addItem({
      id: `${id}-L`,
      title: isPreOrder ? `[Pre-Order] ${title}` : title,
      price: price.toString(),
      image: imageUrl || 'https://images.unsplash.com/photo-1583318433420-532155e9d9e4?q=80&w=500&auto=format&fit=crop',
      quantity: 1,
      loyalty_points_earned: finalPoints
    });

    // إرسال حدث AddToCart إلى Meta Pixel
    trackFbEvent('AddToCart', {
      content_name: title,
      content_category: category,
      content_ids: [String(id)],
      content_type: 'product',
      value: parseFloat(price) || 0,
      currency: 'USD'
    });

    alert(isPreOrder ? `✅ Added to cart as Pre-Order (+${finalPoints} PTS)` : `✅ Added to cart (+${finalPoints} PTS)`);
  };

  return (
    <Link href={`/product/${id}`} className="block group">
      <div className={`bg-[#121212] border border-[#1f1f1f] rounded-lg overflow-hidden group-hover:border-[#00AEEF] transition duration-300 ${!inStock ? 'opacity-80' : ''}`}>
        
        {/* صورة المنتج والشارات */}
        <div className="h-64 bg-[#1a1a1a] flex items-center justify-center overflow-hidden relative">
          <img 
            src={imageUrl} 
            alt={title} 
            className={`object-cover h-full w-full group-hover:scale-105 transition duration-500 ${!inStock ? 'grayscale-[40%] opacity-70' : 'opacity-80 group-hover:opacity-100'}`} 
          />

          {/* شارة Pre-Order الواضحة والمميزة */}
          {isPreOrder && (
            <span className="absolute top-2.5 left-2.5 bg-purple-600 text-white border border-purple-400/60 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.5)] z-10">
              <Clock className="w-3 h-3 stroke-[2.5]" /> PRE-ORDER
            </span>
          )}

          {/* شارة Out of Stock في حال نفاذ الكمية */}
          {!inStock && (
            <span className="absolute top-2.5 right-2.5 bg-red-600/95 text-white text-[10px] font-black tracking-wider uppercase px-2 py-1 rounded-md border border-red-400/50 shadow-lg z-10">
              OUT OF STOCK
            </span>
          )}

          {/* شارة نقاط الولاء */}
          <span className="absolute bottom-2 right-2 bg-black/80 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
            <Award className="w-3 h-3" /> +{Number(loyaltyPoints) > 0 ? Number(loyaltyPoints) : 20} PTS
          </span>
        </div>

        {/* تفاصيل المنتج */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold uppercase tracking-wider ${isPreOrder ? 'text-purple-400' : 'text-[#00AEEF]'}`}>
              {category}
            </span>
            {isPreOrder && (
              <span className="text-[9px] font-extrabold uppercase bg-purple-950/80 text-purple-300 border border-purple-500/40 px-1.5 py-0.2 rounded">
                PRE-ORDER
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-white mb-3 truncate">{title}</h3>

          <div className="flex justify-between items-center mt-4">
            <span className="text-xl font-bold text-white">${price}</span>
            <button 
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`p-2.5 rounded-full transition shadow-md ${
                !inStock 
                  ? 'bg-[#222] text-gray-600 cursor-not-allowed' 
                  : isPreOrder
                    ? 'bg-purple-950/80 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40'
                    : 'bg-[#1f1f1f] hover:bg-[#00AEEF] text-white'
              }`}
              title={!inStock ? "Out of Stock" : isPreOrder ? "Pre-Order Item" : "Add to Cart"}
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </Link>
  );
}