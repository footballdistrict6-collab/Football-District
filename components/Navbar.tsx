"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ShoppingCart, User, Search, Trophy, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function Navbar() {
  const [kitsDropdownOpen, setKitsDropdownOpen] = useState(false);
  const { items } = useCartStore();

  const totalCartCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  const topLeagues = [
    { name: "Premier League", slug: "Premier League" },
    { name: "La Liga", slug: "La Liga" },
    { name: "Serie A", slug: "Serie A" },
    { name: "Bundesliga", slug: "Bundesliga" },
    { name: "Ligue 1", slug: "Ligue 1" },
  ];

  return (
    <nav className="bg-[#0a0a0a] border-b border-[#1f1f1f] text-white sticky top-0 z-50">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* اللوجو */}
        <Link href="/" className="text-2xl font-black uppercase tracking-tight">
          FOOTBALL <span className="text-[#00AEEF]">DISTRICT</span>
        </Link>

        {/* قائمة روابط الـ Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
          
          {/* قائمة KITS المنسدلة (Dropdown - Shop by League) */}
          <div 
            className="relative"
            onMouseEnter={() => setKitsDropdownOpen(true)}
            onMouseLeave={() => setKitsDropdownOpen(false)}
          >
            <Link 
              href="/catalog?category=Kits" 
              className="flex items-center gap-1.5 py-4 text-gray-300 hover:text-[#00AEEF] transition"
            >
              Kits <ChevronDown className={`w-4 h-4 transition-transform ${kitsDropdownOpen ? 'rotate-180 text-[#00AEEF]' : ''}`} />
            </Link>

            {kitsDropdownOpen && (
              <div className="absolute top-full left-0 w-64 bg-[#121212] border border-[#222] rounded-2xl shadow-2xl py-3 z-50">
                <div className="px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#00AEEF] flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" /> Shop by League
                </div>

                {topLeagues.map((league) => (
                  <Link
                    key={league.slug}
                    href={`/catalog?league=${encodeURIComponent(league.slug)}`}
                    className="block px-4 py-2 text-xs font-bold text-gray-300 hover:text-white hover:bg-[#1a1a1a] transition"
                  >
                    {league.name}
                  </Link>
                ))}

                <div className="border-t border-[#222] my-2 pt-2">
                  <Link
                    href="/catalog?category=Retro+Kits"
                    className="block px-4 py-2 text-xs font-bold text-amber-400 hover:bg-[#1a1a1a] transition"
                  >
                    ⏳ Retro Kits
                  </Link>
                  <Link
                    href="/catalog?category=Special+Orders"
                    className="block px-4 py-2 text-xs font-bold text-purple-400 hover:bg-[#1a1a1a] transition flex items-center justify-between"
                  >
                    <span>✈️ Special Orders</span>
                    <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-500/40 px-1.5 py-0.5 rounded">PRE-ORDER</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link href="/catalog?category=Boots" className="text-gray-300 hover:text-[#00AEEF] transition">
            Boots
          </Link>

          <Link href="/catalog?category=Equipment" className="text-gray-300 hover:text-[#00AEEF] transition">
            Equipment
          </Link>

          <Link 
            href="/catalog?category=Mystery+Drop" 
            className="text-amber-400 hover:text-amber-300 transition flex items-center gap-1 font-bold"
          >
            <Sparkles className="w-3.5 h-3.5" /> Mystery Drop
          </Link>
        </div>

        {/* أزرار البحث، الحساب، والسلة */}
        <div className="flex items-center gap-4">
          <Link href="/catalog" className="p-2 text-gray-400 hover:text-white transition">
            <Search className="w-5 h-5" />
          </Link>
          <Link href="/profile" className="p-2 text-gray-400 hover:text-white transition">
            <User className="w-5 h-5" />
          </Link>
          <Link href="/cart" className="relative p-2 text-gray-400 hover:text-white transition">
            <ShoppingCart className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#00AEEF] text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {totalCartCount}
              </span>
            )}
          </Link>
        </div>

      </div>
    </nav>
  );
}