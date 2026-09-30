"use client";

import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { useSearchParams } from 'next/navigation';

function CatalogContent() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get('category');
  const urlLeague = searchParams.get('league');
  const urlSearch = searchParams.get('search');

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<string>('All');

  useEffect(() => {
    if (urlLeague) {
      setSelectedTab(urlLeague);
    } else if (urlCategory) {
      if (urlCategory === 'Long Sleeve') {
        setSelectedTab('Long Sleeves');
      } else if (urlCategory === 'Training Suits') {
        setSelectedTab('Tracksuits');
      } else {
        setSelectedTab(urlCategory);
      }
    } else {
      setSelectedTab('All');
    }
  }, [urlCategory, urlLeague]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

      if (data) {
        setProducts(data);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  // تصفية المنتجات حسب التبويب (سواء كان دوري أو كاتيغوري)
  const filteredProducts = products.filter((p) => {
    const isLeagueTab = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1'].includes(selectedTab);
    
    let matchesTab = true;
    if (selectedTab !== 'All' && selectedTab !== 'Kits') {
      if (isLeagueTab) {
        matchesTab = p.league === selectedTab;
      } else if (selectedTab === 'Winter Collection') {
        // قسم مجموعة الشتاء الشامل
        matchesTab = 
          p.category === 'Winter Collection' ||
          p.category === 'Puffer Jackets' ||
          p.category === 'Full Sets' ||
          p.category === 'Sweatshirts' ||
          p.category === 'Long Sleeves' ||
          p.category === 'Long Sleeve' ||
          p.category === 'Tracksuits' ||
          p.category === 'Training Suits' ||
          p.category === 'Windbreakers' ||
          p.category === 'Windbreaker' ||
          p.title?.toLowerCase().includes('full set') ||
          p.title?.toLowerCase().includes('sweatshirt') ||
          p.title?.toLowerCase().includes('puffer') ||
          p.title?.toLowerCase().includes('long sleeve') ||
          p.title?.toLowerCase().includes('tracksuit') ||
          p.title?.toLowerCase().includes('training suit') ||
          p.title?.toLowerCase().includes('windbreaker');
      } else if (selectedTab === 'Puffer Jackets') {
        matchesTab = p.category === 'Puffer Jackets' || p.title?.toLowerCase().includes('puffer');
      } else if (selectedTab === 'Full Sets') {
        matchesTab = p.category === 'Full Sets' || p.title?.toLowerCase().includes('full set');
      } else if (selectedTab === 'Sweatshirts') {
        matchesTab = p.category === 'Sweatshirts' || p.title?.toLowerCase().includes('sweatshirt');
      } else if (selectedTab === 'Long Sleeves' || selectedTab === 'Long Sleeve') {
        matchesTab = 
          p.category === 'Long Sleeves' || 
          p.category === 'Long Sleeve' || 
          p.title?.toLowerCase().includes('long sleeve');
      } else if (selectedTab === 'Tracksuits' || selectedTab === 'Training Suits') {
        matchesTab = 
          p.category === 'Tracksuits' || 
          p.category === 'Training Suits' || 
          p.title?.toLowerCase().includes('tracksuit') || 
          p.title?.toLowerCase().includes('training suit');
      } else if (selectedTab === 'Windbreakers' || selectedTab === 'Windbreaker') {
        matchesTab = 
          p.category === 'Windbreakers' || 
          p.category === 'Windbreaker' || 
          p.title?.toLowerCase().includes('windbreaker');
      } else if (selectedTab === 'Special Orders' || selectedTab === 'Pre-Order') {
        matchesTab = 
          p.category === 'Special Orders' || 
          p.category === 'Pre-Order' || 
          p.category?.toLowerCase().includes('special') || 
          p.category?.toLowerCase().includes('pre-order') || 
          p.category?.toLowerCase().includes('preorder') ||
          p.title?.toLowerCase().includes('pre-order') ||
          p.title?.toLowerCase().includes('preorder');
      } else {
        matchesTab = p.category === selectedTab;
      }
    }
    
    const matchesSearch = !urlSearch || p.title?.toLowerCase().includes(urlSearch.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // مصفوفة الفلترة المحدثة
  const filterTabs = [
    'All',
    'Winter Collection',
    'Puffer Jackets',
    'Full Sets',
    'Sweatshirts',
    'Long Sleeves',
    'Tracksuits',
    'Windbreakers',
    'Special Orders',
    'Premier League',
    'La Liga',
    'Serie A',
    'Bundesliga',
    'Ligue 1',
    'Retro Kits',
    'Kids',
    'Boots',
    'Equipment',
    'Mystery Drop'
  ];

  return (
    <div className="bg-[#0a0a0a] min-h-screen py-16 text-white">
      <div className="container mx-auto px-6">
        
        {/* الترويسة الذكية (تتغير حسب الفلتر المختار) */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight mb-3">
            {urlSearch 
              ? `SEARCH RESULTS FOR: "${urlSearch}"` 
              : selectedTab === 'All' 
                ? '26/27 CATALOG' 
                : selectedTab === 'Winter Collection'
                  ? 'WINTER COLLECTION ❄️'
                  : selectedTab === 'Puffer Jackets'
                    ? 'PUFFER JACKETS 🧥'
                    : selectedTab === 'Full Sets'
                      ? 'FULL SETS ⚽'
                      : selectedTab === 'Sweatshirts'
                        ? 'SWEATSHIRTS 👕'
                        : selectedTab === 'Long Sleeves' || selectedTab === 'Long Sleeve'
                          ? 'LONG SLEEVES 🧤'
                          : selectedTab === 'Tracksuits' || selectedTab === 'Training Suits'
                            ? 'TRACKSUITS 🏃'
                            : selectedTab === 'Windbreakers' || selectedTab === 'Windbreaker'
                              ? 'WINDBREAKERS 💨'
                        : selectedTab === 'Special Orders'
                          ? 'PRE-ORDER & SPECIAL ORDERS ✈️'
                          : selectedTab === 'Kids' 
                            ? 'KIDS KITS 👶'
                            : selectedTab.toUpperCase()}
          </h1>
          <p className="text-gray-400">
            {selectedTab === 'Special Orders' || selectedTab === 'Pre-Order'
              ? '✈️ Custom pre-order jerseys and special editions. Estimated delivery time applies.'
              : selectedTab === 'Winter Collection'
                ? '❄️ Stay warm with our official winter gear, puffer jackets, tracksuits, sweatshirts, long sleeves, and windbreakers.'
                : selectedTab === 'Puffer Jackets'
                  ? '🧥 Premium insulated club puffer jackets designed for warmth and street style.'
                  : selectedTab === 'Full Sets'
                    ? '⚽ Official full tracksuits and matching training sets.'
                    : selectedTab === 'Sweatshirts'
                      ? '👕 Comfortable club crewnecks, sweatshirts, and fleece pullovers.'
                      : selectedTab === 'Long Sleeves' || selectedTab === 'Long Sleeve'
                        ? '🧤 Official long sleeve jerseys and training tops for colder weather.'
                        : selectedTab === 'Tracksuits' || selectedTab === 'Training Suits'
                          ? '🏃 Full zip tracksuits, presentation suits, and authentic training sets.'
                          : selectedTab === 'Windbreakers' || selectedTab === 'Windbreaker'
                            ? '💨 Lightweight, wind-resistant and weather-ready club jackets.'
                      : selectedTab === 'Kids'
                        ? '👶 Shop official football kits and gear for the little champions.'
                        : 'Browse our official kits, footwear, and professional gear.'}
          </p>
        </div>

        {/* أزرار الفلترة السريعة */}
        <div className="flex flex-wrap gap-2 mb-12 border-b border-[#1f1f1f] pb-6">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition flex items-center gap-1.5 ${
                selectedTab === tab
                  ? 'bg-[#00AEEF] text-white shadow-[0_0_15px_rgba(0,174,239,0.3)]'
                  : 'bg-[#121212] text-gray-400 hover:text-white hover:bg-[#1a1a1a] border border-[#1f1f1f]'
              }`}
            >
              {tab === 'Winter Collection' ? '❄️ Winter Collection'
                : tab === 'Puffer Jackets' ? '🧥 Puffer Jackets'
                : tab === 'Full Sets' ? '⚽ Full Sets'
                : tab === 'Sweatshirts' ? '👕 Sweatshirts'
                : tab === 'Long Sleeves' ? '🧤 Long Sleeves'
                : tab === 'Tracksuits' ? '🏃 Tracksuits'
                : tab === 'Windbreakers' ? '💨 Windbreakers'
                : tab === 'Special Orders' ? '✈️ Pre-Orders' 
                : tab === 'Kids' ? '👶 Kids' 
                : tab}
            </button>
          ))}
        </div>

        {/* شبكة المنتجات */}
        {loading ? (
          <div className="py-20 text-center text-gray-400">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-[#121212] rounded-2xl border border-[#1f1f1f]">
            <p className="text-xl font-bold mb-2">No items found</p>
            <p className="text-gray-400">We couldn't find any items matching your selected category or league.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => {
              const imgUrl = Array.isArray(product.image_urls) && product.image_urls.length > 0 
                ? product.image_urls[0] 
                : product.imageUrl || 'https://images.unsplash.com/photo-1583318433420-532155e9d9e4?q=80&w=500&auto=format&fit=crop';

              return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={product.price?.toString() || '0'}
                  category={product.category || 'Kits'}
                  imageUrl={imgUrl}
                  loyaltyPoints={Number(product.loyalty_points_earned) || 20}
                  inStock={product.in_stock !== false}
                />
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="bg-[#0a0a0a] min-h-screen py-20 text-center text-white">Loading...</div>}>
      <CatalogContent />
    </Suspense>
  );
}