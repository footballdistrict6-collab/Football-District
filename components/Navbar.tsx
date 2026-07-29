"use client";

import Link from 'next/link';
import { ShoppingCart, Search, User } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const cartCount = useCartStore((state) => state.cartCount());
  
  // هذا السطر لتجنب مشكلة اختلاف الأرقام بين السيرفر والمتصفح
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <nav className="bg-[#0a0a0a] text-white border-b border-[#1f1f1f] py-4">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-wider">
          FOOTBALL <span className="text-[#00AEEF]">DISTRICT</span>
        </Link>

        <div className="hidden md:flex space-x-8 font-medium">
          <Link href="/catalog" className="hover:text-[#00AEEF] transition">26/27 Catalog</Link>
          <Link href="/retro" className="hover:text-[#00AEEF] transition">Retro Jerseys</Link>
          <Link href="/equipment" className="hover:text-[#00AEEF] transition">Equipment</Link>
        </div>

        <div className="flex space-x-6 items-center">
          <Search className="w-5 h-5 cursor-pointer hover:text-[#00AEEF] transition" />
          <User className="w-5 h-5 cursor-pointer hover:text-[#00AEEF] transition" />
          <Link href="/cart" className="relative cursor-pointer hover:text-[#00AEEF] transition block">
            <ShoppingCart className="w-5 h-5" />
            {mounted && cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-[#00AEEF] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}