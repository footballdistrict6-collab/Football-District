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
  Clock,
  Snowflake // إضافة أيقونة الشتاء الجديدة
} from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function Navbar() {
  const [kitsDropdownOpen, setKitsDropdownOpen] = useState(false);
  const [winterDropdownOpen, setWinterDropdownOpen] = useState(false); // حالة قائمة الشتاء للكمبيوتر
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileKitsOpen, setMobileKitsOpen] = useState(false);
  const [mobileWinterOpen, setMobileWinterOpen] = useState(false); // حالة قائمة الشتاء للهاتف
  
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
          
          {/* 1. قائمة KITS المنسدلة */}
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
                  
                  {/* قسم الأطفال */}
                  <Link
                    href="/catalog?category=Kids"
                    className="block px-4 py-2 text-xs font-bold text-green-400 hover:bg-[#1a1a1a] transition flex items-center justify-between"
                  >
                    <span>👶 Kids Kits</span>
                    <span className="text-[9px] bg-green-950 text-green-300 border border-green-500/40 px-1.5 py-0.5 rounded">NEW</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 2. قائمة الشتاء المنسدلة (Winter Collection) المضافة حديثاً */}
          <div 
            className="relative"
            onMouseEnter={() => setWinterDropdownOpen(true)}
            onMouseLeave={() => setWinterDropdownOpen(false)}
          >
            <Link 
              href="/catalog?category=Winter+Collection" 
              className="flex items-center gap-1.5 py-4 text-gray-300 hover:text-amber-400 transition"
            >
              <span>Winter</span>
              <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1.5 py-0.5 rounded font-black tracking-wider shadow-[0_0_10px_rgba(251,191,36,0.2)]">NEW</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${winterDropdownOpen ? 'rotate-180 text-amber-400' : ''}`} />
            </Link>

            {winterDropdownOpen && (
              <div className="absolute top-full left-0 w-64 bg-[#121212] border border-[#222] rounded-2xl shadow-2xl py-3 z-50">
                
                <Link href="/catalog?category=Winter+Collection&sort=new" className="block px-4 py-3 text-xs font-black text-amber-400 hover:bg-[#1a1a1a] transition border-b border-[#222] mb-1">
                  <span className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Winter - New Arrivals</span>
                </Link>
                
                <Link href="/catalog?category=Long+Sleeve" className="block px-4 py-2 text-xs font-bold text-gray-300 hover:text-white hover:bg-[#1a1a1a] transition">
                  Long Sleeve Jerseys
                </Link>
                <Link href="/catalog?category=Training+Suits" className="block px-4 py-2 text-xs font-bold text-gray-300 hover:text-white hover:bg-[#1a1a1a] transition">
                  Training Suits <span className="text-gray-500 font-medium">(Full Sets)</span>
                </Link>
                <Link href="/catalog?category=Windbreakers" className="block px-4 py-2 text-xs font-bold text-gray-300 hover:text-white hover:bg-[#1a1a1a] transition">
                  Windbreakers
                </Link>
                
                <div className="border-t border-[#222] my-1 pt-1 mt-2">
                  <Link href="/catalog?category=Winter+Collection" className="block px-4 py-2.5 text-xs font-bold text-gray-400 hover:text-white hover:bg-[#1a1a1a] transition text-center uppercase tracking-widest">
                    Shop All Winter
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
          
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-80 max-w-[85vw] bg-[#0d0d0d] border-r border-[#222] h-full flex flex-col justify-between p-6 overflow-y-auto z-10 shadow-2xl">
            
            <div className="space-y-6">
              
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

              <div className="divide-y divide-[#1f1f1f] text-sm font-bold">
                
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

                {/* --- قسم مجموعة الشتاء المضاف حديثاً (Winter Collection - Mobile) --- */}
                <div className="py-2">
                  <button
                    onClick={() => setMobileWinterOpen(!mobileWinterOpen)}
                    className="w-full py-2.5 flex items-center justify-between text-amber-400 hover:text-amber-300"
                  >
                    <span className="flex items-center gap-2">
                      <Snowflake className="w-4 h-4 text-amber-400" /> Winter
                      <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1.5 py-0.5 rounded font-black">NEW</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileWinterOpen ? 'rotate-180 text-amber-400' : ''}`} />
                  </button>

                  {mobileWinterOpen && (
                    <div className="pl-4 pr-2 py-2 space-y-2 border-l-2 border-amber-500/40 my-1 ml-2 text-xs">
                      <Link
                        href="/catalog?category=Winter+Collection&sort=new"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 text-amber-400 font-bold border-b border-[#222] mb-2"
                      >
                        ✨ Winter - New Arrivals
                      </Link>
                      <Link href="/catalog?category=Long+Sleeve" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-gray-300 hover:text-white">&bull; Long Sleeve Jerseys</Link>
                      <Link href="/catalog?category=Training+Suits" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-gray-300 hover:text-white">&bull; Training Suits (Full Sets)</Link>
                      <Link href="/catalog?category=Windbreakers" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-gray-300 hover:text-white">&bull; Windbreakers</Link>
                      
                      <div className="border-t border-[#222] pt-2 mt-2">
                        <Link href="/catalog?category=Winter+Collection" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-center text-gray-400 hover:text-white font-bold tracking-widest uppercase">
                          Shop All Winter
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

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
                        
                        <Link
                          href="/catalog?category=Kids"
                          onClick={() => setMobileMenuOpen(false)}
                          className="py-1.5 text-green-400 hover:text-green-300 flex items-center justify-between"
                        >
                          <span>👶 Kids Kits</span>
                          <span className="text-[9px] bg-green-950 text-green-300 border border-green-500/40 px-1.5 py-0.5 rounded">NEW</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href="/catalog?category=Boots"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3.5 text-gray-200 hover:text-[#00AEEF]"
                >
                  Boots
                </Link>

                <Link
                  href="/catalog?category=Equipment"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3.5 text-gray-200 hover:text-[#00AEEF]"
                >
                  Equipment
                </Link>

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