"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronDown, 
  ShoppingCart, 
  User, 
  Search, 
  Trophy, 
  Sparkles, 
  Menu, 
  X, 
  Clock 
} from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function Navbar() {
  const [kitsDropdownOpen, setKitsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileKitsOpen, setMobileKitsOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');

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
        
        {/* زر القائمة للهاتف (Hamburger) */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-gray-300 hover:text-white transition"
            aria-label="Open Mobile Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* اللوجو للهاتف */}
          <Link href="/" className="text-xl font-black uppercase tracking-tight">
            FD <span className="text-[#00AEEF]">STORE</span>
          </Link>
        </div>

        {/* اللوجو للشاشات الكبيرة */}
        <Link href="/" className="hidden md:block text-2xl font-black uppercase tracking-tight">
          FOOTBALL <span className="text-[#00AEEF]">DISTRICT</span>
        </Link>

        {/* روابط الـ Navigation للشاشات الكبيرة (Desktop) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
          
          {/* قائمة KITS المنسدلة (Shop by League) */}
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

        {/* أزرار البحث، الحساب، والسلة (تعمل على الهاتف والكمبيوتر) */}
        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/catalog" className="hidden md:block p-2 text-gray-400 hover:text-white transition">
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

      {/* ==================================================== */}
      {/* قائمة الهاتف الجانبية المنسدلة (Mobile Side Drawer) */}
      {/* ==================================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          
          {/* الخلفية المظلمة (Overlay) */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* محتوى القائمة الجانبية */}
          <div className="relative w-80 max-w-[85vw] bg-[#0d0d0d] border-r border-[#222] h-full flex flex-col justify-between p-6 overflow-y-auto z-10 shadow-2xl">
            
            <div className="space-y-6">
              
              {/* ترويسة القائمة مع زر الإغلاق */}
              <div className="flex items-center justify-between border-b border-[#222] pb-4">
                <span className="text-xl font-black uppercase tracking-tight">
                  FOOTBALL <span className="text-[#00AEEF]">DISTRICT</span>
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* مربع البحث السريع في الهاتف */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search kits, boots..."
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && mobileSearchQuery.trim()) {
                      setMobileMenuOpen(false);
                      window.location.href = `/catalog?search=${encodeURIComponent(mobileSearchQuery.trim())}`;
                    }
                  }}
                  className="w-full bg-[#1a1a1a] border border-[#2b2b2b] rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#00AEEF]"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>

              {/* رابط السلة البارز في أعلى القائمة (مثل صورتك) */}
              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between w-full bg-[#161616] hover:bg-[#222] border border-[#262626] rounded-xl p-3.5 font-bold text-sm text-white transition"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className="w-4 h-4 text-[#00AEEF]" />
                  <span>CART ({totalCartCount})</span>
                </div>
                <span className="text-xs text-[#00AEEF]">View Bag &rarr;</span>
              </Link>

              {/* روابط التنقل الرئيسية (Accordion Structure) */}
              <div className="divide-y divide-[#1f1f1f] text-sm font-bold">
                
                {/* 1. Mystery Drop */}
                <Link
                  href="/catalog?category=Mystery+Drop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3.5 flex items-center justify-between text-amber-400 hover:text-amber-300"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Mystery Drop
                  </span>
                  <span>&rarr;</span>
                </Link>

                {/* 2. Kits (قابل للطي - Accordion) */}
                <div className="py-2">
                  <button
                    onClick={() => setMobileKitsOpen(!mobileKitsOpen)}
                    className="w-full py-2.5 flex items-center justify-between text-gray-200 hover:text-[#00AEEF]"
                  >
                    <span className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-[#00AEEF]" /> Kits
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileKitsOpen ? 'rotate-180 text-[#00AEEF]' : ''}`} />
                  </button>

                  {/* القائمة الفرعية للدوريات */}
                  {mobileKitsOpen && (
                    <div className="pl-4 pr-2 py-2 space-y-2 border-l-2 border-[#00AEEF]/40 my-1 ml-2 text-xs">
                      <Link
                        href="/catalog?category=Kits"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-1.5 text-gray-300 hover:text-white font-semibold"
                      >
                        ⚽ All 26/27 Kits
                      </Link>

                      {topLeagues.map((league) => (
                        <Link
                          key={league.slug}
                          href={`/catalog?league=${encodeURIComponent(league.slug)}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-1.5 text-gray-400 hover:text-white"
                        >
                          &bull; {league.name}
                        </Link>
                      ))}

                      <div className="border-t border-[#222] pt-2 mt-2 space-y-2">
                        <Link
                          href="/catalog?category=Retro+Kits"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-1.5 text-amber-400 hover:text-amber-300"
                        >
                          ⏳ Retro Kits
                        </Link>
                        <Link
                          href="/catalog?category=Special+Orders"
                          onClick={() => setMobileMenuOpen(false)}
                          className="py-1.5 text-purple-400 hover:text-purple-300 flex items-center justify-between"
                        >
                          <span>✈️ Special Orders</span>
                          <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-500/40 px-1.5 py-0.5 rounded">PRE-ORDER</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Boots */}
                <Link
                  href="/catalog?category=Boots"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3.5 text-gray-200 hover:text-[#00AEEF]"
                >
                  Boots
                </Link>

                {/* 4. Equipment */}
                <Link
                  href="/catalog?category=Equipment"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3.5 text-gray-200 hover:text-[#00AEEF]"
                >
                  Equipment
                </Link>

                {/* 5. رابط تتبع الطلبات أو الحساب */}
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3.5 flex items-center justify-between text-gray-400 hover:text-white"
                >
                  <span>MY LOYALTY PROFILE & ORDERS</span>
                  <span>&rarr;</span>
                </Link>

              </div>

            </div>

            {/* تذييل القائمة الجانبية */}
            <div className="pt-4 border-t border-[#1f1f1f] text-center text-xs text-gray-500 font-medium">
              FOOTBALL DISTRICT &copy; 2026<br />
              <span className="text-[11px] text-gray-400">Fast Delivery Across Lebanon &bull; $4.00</span>
            </div>

          </div>

        </div>
      )}

    </nav>
  );
}