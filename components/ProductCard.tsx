"use client";

import Link from 'next/link';
import { ShoppingCart, Award } from 'lucide-react';
import { useCartStore } from '@/store/cart';

interface ProductCardProps {
  id: string | number;
  title: string;
  price: string;
  category: string;
  imageUrl: string;
  loyaltyPoints?: number;
}

export default function ProductCard({ 
  id, 
  title, 
  price, 
  category, 
  imageUrl, 
  loyaltyPoints = 20 
}: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // لمنع الرابط من فتح صفحة المنتج عند الضغط على أيقونة السلة
    e.stopPropagation();

    addItem({
      id: `${id}-L`, // المقاس الافتراضي عند الإضافة السريعة
      title: title,
      price: price.toString(),
      image: imageUrl || 'https://images.unsplash.com/photo-1583318433420-532155e9d9e4?q=80&w=500&auto=format&fit=crop',
      quantity: 1,
      // حفظ النقاط الحقيقية الخاصة بهذا القميص في السلة
      loyalty_points_earned: Number(loyaltyPoints) || 20
    });

    alert(`✅ Added to cart (+${loyaltyPoints} PTS)`);
  };

  return (
    <Link href={`/product/${id}`} className="block group">
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-lg overflow-hidden group-hover:border-[#00AEEF] transition duration-300">
        
        {/* صورة المنتج */}
        <div className="h-64 bg-[#1a1a1a] flex items-center justify-center overflow-hidden relative">
          <img 
            src={imageUrl} 
            alt={title} 
            className="object-cover h-full w-full group-hover:scale-105 transition duration-500 opacity-80 group-hover:opacity-100" 
          />
          {/* شارة توضح للزبون كم نقطة سيربح من هذا القميص */}
          <span className="absolute bottom-2 right-2 bg-black/80 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
            <Award className="w-3 h-3" /> +{loyaltyPoints} PTS
          </span>
        </div>

        {/* تفاصيل المنتج */}
        <div className="p-5">
          <span className="text-[#00AEEF] text-xs font-bold uppercase tracking-wider">{category}</span>
          <h3 className="text-lg font-semibold text-white mt-1 mb-3 truncate">{title}</h3>

          <div className="flex justify-between items-center mt-4">
            <span className="text-xl font-bold text-white">${price}</span>
            <button 
              onClick={handleAddToCart}
              className="bg-[#1f1f1f] hover:bg-[#00AEEF] text-white p-2.5 rounded-full transition shadow-md"
              title="Add to Cart"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </Link>
  );
}