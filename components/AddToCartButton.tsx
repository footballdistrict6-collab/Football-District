"use client";

import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function AddToCartButton({ product }: { product: any }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image_urls?.[0] || 'https://images.unsplash.com/photo-1583318433420-532155e9d9e4',
      quantity: 1
    });
    alert("تم إضافة المنتج إلى السلة بنجاح! 🛒");
  };

  return (
    <button 
      onClick={handleAddToCart}
      className="flex-1 bg-[#00AEEF] text-white font-bold py-4 rounded hover:bg-blue-500 transition shadow-[0_0_15px_rgba(0,174,239,0.3)] flex items-center justify-center gap-2"
    >
      <ShoppingCart className="w-5 h-5" /> Add to Cart
    </button>
  );
}