"use client";

import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { ShoppingCart, Search, X, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { cartCount } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <>
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

          {/* الأيقونات على اليمين - بحث، بروفايل الزبون، وسلة */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="text-gray-300 hover:text-white transition"
              title="Search Catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* زر بروفايل الزبون (ينقل لصفحة الولاء وسجل الطلبات فقط) */}
            <Link 
              href="/profile" 
              className="text-gray-300 hover:text-[#00AEEF] transition" 
              title="My Account & Loyalty Rewards"
            >
              <User className="w-5 h-5" />
            </Link>

            <Link href="/cart" className="relative text-gray-300 hover:text-white transition" title="Shopping Cart">
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

      {/* نافذة البحث المنبثقة */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4">
          <div className="bg-[#121212] border border-[#333] rounded-2xl p-6 max-w-xl w-full shadow-2xl relative">
            <button 
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold mb-4 text-gray-300">Search Products</h3>

            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input 
                type="text" 
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type team name, e.g. Arsenal, Madrid..." 
                className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-white focus:outline-none focus:border-[#00AEEF] transition"
              />
              <button 
                type="submit"
                className="bg-[#00AEEF] hover:bg-blue-500 text-white font-bold px-6 rounded-xl transition shadow-[0_0_15px_rgba(0,174,239,0.3)]"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}