"use client";
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export default function ProductCard({ id, title, price, category, imageUrl }: { id: string | number, title: string, price: string, category: string, imageUrl: string }) {
  return (
    <Link href={`/product/${id}`} className="block group">
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-lg overflow-hidden group-hover:border-[#00AEEF] transition duration-300">
        {/* صورة المنتج */}
        <div className="h-64 bg-[#1a1a1a] flex items-center justify-center overflow-hidden relative">
          <img src={imageUrl} alt={title} className="object-cover h-full w-full group-hover:scale-105 transition duration-500 opacity-80 group-hover:opacity-100" />
        </div>
        
        {/* تفاصيل المنتج */}
        <div className="p-5">
          <span className="text-[#00AEEF] text-xs font-bold uppercase tracking-wider">{category}</span>
          <h3 className="text-lg font-semibold text-white mt-1 mb-3 truncate">{title}</h3>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-xl font-bold text-white">${price}</span>
            <button className="bg-[#1f1f1f] hover:bg-[#00AEEF] text-white p-2 rounded-full transition" onClick={(e) => e.preventDefault()}>
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}