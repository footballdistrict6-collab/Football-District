"use client";

import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { ShoppingCart, User, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { cartCount } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="border-b border-[#1f1f1f] bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* الشعار */}
        <Link href="/" className="text-2xl font-black tracking-tighter text-white">
          FOOTBALL <span className="text-[#00AEEF]">DISTRICT</span>
        </Link>

        {/* أزرار الأقسام في المنتصف */}
        <div className="hidden md:flex items-center gap-8">
          <Link 
            href="/catalog" 
            className="text-sm font-semibold text-gray-300 hover:text-[#00AEEF] transition"
          >
            26/27 Catalog
          </Link>
          <Link 
            href="/catalog?category=Retro+Jerseys" 
            className="text-sm font-semibold text-gray-300 hover:text-[#00AEEF] transition"
          >
            Retro Jerseys
          </Link>
          <Link 
            href="/catalog?category=Equipment" 
            className="text-sm font-semibold text-gray-300 hover:text-[#00AEEF] transition"
          >
            Equipment
          </Link>
        </div>

        {/* الأيقونات على اليمين */}
        <div className="flex items-center gap-6">
          <Link href="/catalog" className="text-gray-300 hover:text-white transition">
            <Search className="w-5 h-5" />
          </Link>

          <Link href="/admin" className="text-gray-300 hover:text-white transition" title="Admin Dashboard">
            <User className="w-5 h-5" />
          </Link>

          <Link href="/cart" className="relative text-gray-300 hover:text-white transition">
            <ShoppingCart className="w-5 h-5" />
            {mounted && cartCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#00AEEF] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount()}
              </span>
            )}
          </Link>
        </div>

      </div>
    </nav>
  );
}