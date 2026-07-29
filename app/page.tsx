"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { ArrowRight, ShieldCheck, Truck, Zap, Flame, Trophy } from 'lucide-react';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // جلب أحدث 8 منتجات من قاعدة بيانات Supabase لعرضها في الرئيسية
  useEffect(() => {
    async function fetchFeaturedProducts() {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false })
        .limit(8);

      if (data) {
        setFeaturedProducts(data);
      }
      setLoading(false);
    }

    fetchFeaturedProducts();
  }, []);

  // فئات التصفح السريع التفاعلية
  const quickCategories = [
    {
      title: "26/27 Home Kits",
      subtitle: "Official Player & Fan Versions",
      category: "Home Jerseys",
      image: "https://images.unsplash.com/photo-1583318433420-532155e9d9e4?q=80&w=800&auto=format&fit=crop",
      badge: "NEW SEASON"
    },
    {
      title: "Away & Third Kits",
      subtitle: "Stand out on the pitch",
      category: "Away Jerseys",
      image: "https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=800&auto=format&fit=crop",
      badge: "TRENDING"
    },
    {
      title: "Retro & Classic",
      subtitle: "Timeless football heritage",
      category: "Retro Jerseys",
      image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop",
      badge: "ICONIC"
    },
    {
      title: "Pro Equipment",
      subtitle: "Balls, boots & accessories",
      category: "Equipment",
      image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=800&auto=format&fit=crop",
      badge: "PERFORMANCE"
    }
  ];

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white">
      
      {/* 1. HERO SECTION - الترويسة الرئيسية الفخمة */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-[#1f1f1f]">
        {/* خلفية ديناميكية */}
        <div 
          className="absolute inset-0 opacity-25 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1920&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-[#0a0a0a]" />

        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl py-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#121212] border border-[#333] mb-8 animate-pulse">
            <Flame className="w-4 h-4 text-[#00AEEF]" />
            <span className="text-xs font-bold tracking-widest uppercase text-gray-300">
              The 2026/2027 Official Collection is Live
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-none mb-6">
            WEAR YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00AEEF] to-blue-600">PASSION.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Premium player-version jerseys, authentic retro kits, and professional match gear delivered directly to your doorstep across Lebanon.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/catalog" 
              className="w-full sm:w-auto bg-[#00AEEF] hover:bg-blue-500 text-white font-bold px-10 py-5 rounded-xl transition shadow-[0_0_25px_rgba(0,174,239,0.4)] flex items-center justify-center gap-3 text-lg group"
            >
              Shop Full Catalog 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/catalog?category=Retro+Jerseys" 
              className="w-full sm:w-auto bg-[#121212] hover:bg-[#1f1f1f] border border-[#333] text-gray-300 hover:text-white font-bold px-8 py-5 rounded-xl transition text-lg block text-center"
            >
              Explore Retro Kits
            </Link>
          </div>
        </div>
      </section>

      {/* 2. WHY US - شريط الموثوقية والشحن */}
      <section className="border-b border-[#1f1f1f] bg-[#101010]">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-xl bg-[#141414] border border-[#1f1f1f]">
              <Truck className="w-10 h-10 text-[#00AEEF] shrink-0" />
              <div>
                <h4 className="font-bold text-base">Fast Lebanon Delivery</h4>
                <p className="text-xs text-gray-400 mt-0.5">Direct to your door across all governorates</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-xl bg-[#141414] border border-[#1f1f1f]">
              <ShieldCheck className="w-10 h-10 text-[#00AEEF] shrink-0" />
              <div>
                <h4 className="font-bold text-base">Cash on Delivery</h4>
                <p className="text-xs text-gray-400 mt-0.5">Pay safely when you inspect and receive your order</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-xl bg-[#141414] border border-[#1f1f1f]">
              <Zap className="w-10 h-10 text-[#00AEEF] shrink-0" />
              <div>
                <h4 className="font-bold text-base">Player-Version Quality</h4>
                <p className="text-xs text-gray-400 mt-0.5">Breathable match-day fabric & authentic detailing</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHOP BY CATEGORY - أقسام تسوق حقيقية وتفاعلية */}
      <section className="py-20 container mx-auto px-6 border-b border-[#1f1f1f]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-[#00AEEF] font-bold text-sm tracking-widest uppercase block mb-2">
              Collections
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
              SHOP BY <span className="text-[#00AEEF]">CATEGORY</span>
            </h2>
          </div>
          <Link href="/catalog" className="text-sm font-bold text-gray-400 hover:text-white flex items-center gap-2 mt-4 md:mt-0 transition">
            View All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickCategories.map((cat, index) => (
            <Link
              key={index}
              href={`/catalog?category=${encodeURIComponent(cat.category)}`}
              className="group relative h-96 rounded-2xl overflow-hidden border border-[#1f1f1f] bg-[#121212] block"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-40 group-hover:opacity-60"
                style={{ backgroundImage: `url('${cat.image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              
              <div className="absolute top-4 left-4">
                <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-[#00AEEF] text-white">
                  {cat.badge}
                </span>
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-2xl font-black uppercase tracking-wide group-hover:text-[#00AEEF] transition">
                  {cat.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1 mb-4">{cat.subtitle}</p>
                <div className="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:translate-x-2 transition-transform">
                  Explore Now <ArrowRight className="w-4 h-4 text-[#00AEEF]" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. NEW ARRIVALS & FEATURED - المنتجات الحقيقية المسحوبة من قاعدة البيانات */}
      <section className="py-20 container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-[#00AEEF] font-bold text-sm tracking-widest uppercase block mb-2">
              Fresh Drops
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
              NEW <span className="text-[#00AEEF]">ARRIVALS</span>
            </h2>
          </div>
          <Link href="/catalog" className="text-sm font-bold text-gray-400 hover:text-white flex items-center gap-2 mt-4 md:mt-0 transition">
            Browse Full Catalog ({featuredProducts.length}+ Kits) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center text-gray-400">
            Loading featured jerseys...
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="py-20 text-center bg-[#121212] rounded-2xl border border-[#1f1f1f]">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl font-bold mb-2">No Products Available Yet</p>
            <p className="text-gray-400 mb-6">Import your jerseys from the admin dashboard to see them appear here.</p>
            <Link href="/admin" className="bg-[#00AEEF] text-white font-bold py-3 px-6 rounded-lg inline-block">
              Go to Admin Dashboard
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.price?.toString() || '0'}
                category={product.category || 'Jerseys'}
                imageUrl={Array.isArray(product.image_urls) && product.image_urls.length > 0 ? product.image_urls[0] : 'https://images.unsplash.com/photo-1583318433420-532155e9d9e4?q=80&w=500&auto=format&fit=crop'}
              />
            ))}
          </div>
        )}

        {/* زر سفلي كبير للانتقال إلى الكتالوج */}
        <div className="text-center mt-16">
          <Link 
            href="/catalog" 
            className="inline-flex items-center gap-3 bg-[#121212] hover:bg-[#1f1f1f] border border-[#333] hover:border-[#00AEEF] text-white font-bold px-12 py-5 rounded-xl transition text-lg"
          >
            Explore All 26/27 Kits <ArrowRight className="w-5 h-5 text-[#00AEEF]" />
          </Link>
        </div>
      </section>

    </div>
  );
}