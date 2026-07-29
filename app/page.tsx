import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

export default function Home() {
  // منتجات تجريبية لعرضها في قسم أحدث المنتجات
  const newArrivals = [
    { id: 1, title: "Real Madrid 26/27 Home", price: "119.99", category: "Jerseys", image: "https://images.unsplash.com/photo-1583318433420-532155e9d9e4?q=80&w=500&auto=format&fit=crop" },
    { id: 2, title: "Pro Indoor Futsal Ball", price: "45.00", category: "Equipment", image: "https://images.unsplash.com/photo-1614632537190-23e4146777db?q=80&w=500&auto=format&fit=crop" },
    { id: 3, title: "Elite Performance Grip Socks", price: "19.99", category: "Accessories", image: "https://images.unsplash.com/photo-1560343776-97e7d202ff0e?q=80&w=500&auto=format&fit=crop" },
    { id: 4, title: "Arsenal 26/27 Away", price: "119.99", category: "Jerseys", image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=500&auto=format&fit=crop" },
  ];

  // دوريات تجريبية لعرضها في قسم "تسوق حسب الدوري"
  const leagues = [
    { id: 1, name: "Premier League", image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=500&auto=format&fit=crop" },
    { id: 2, name: "La Liga", image: "https://images.unsplash.com/photo-1518605368461-1eb25bc12285?q=80&w=500&auto=format&fit=crop" },
    { id: 3, name: "Serie A", image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=500&auto=format&fit=crop" },
    { id: 4, name: "Bundesliga", image: "https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?q=80&w=500&auto=format&fit=crop" },
  ];

  return (
    <div className="bg-[#0a0a0a]">
      {/* القسم الأول: الواجهة الرئيسية */}
      <div className="relative w-full h-[80vh] flex items-center justify-center bg-[#1f1f1f] overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <div className="relative z-20 text-center px-6 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tight mb-6">
            Rule The <span className="text-[#00AEEF]">Pitch</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10">
            Discover the ultimate collection of 2026/27 official jerseys, retro classics, and pro-level gear.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/catalog" className="bg-[#00AEEF] text-white font-bold py-4 px-8 rounded hover:bg-blue-500 transition shadow-[0_0_15px_rgba(0,174,239,0.5)]">
              Shop 26/27 Season
            </Link>
            <Link href="/retro" className="bg-transparent border border-white text-white font-bold py-4 px-8 rounded hover:bg-white hover:text-black transition">
              Explore Retro
            </Link>
          </div>
        </div>
      </div>

      {/* القسم الثاني: أحدث المنتجات */}
      <div className="container mx-auto px-6 py-20 border-b border-[#1f1f1f]">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wide">New <span className="text-[#00AEEF]">Arrivals</span></h2>
            <p className="text-gray-400 mt-2">The latest drops for the upcoming season.</p>
          </div>
          <Link href="/catalog" className="hidden md:block text-[#00AEEF] hover:text-white transition border-b border-[#00AEEF] hover:border-white pb-1">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {newArrivals.map((product) => (
            <ProductCard 
              key={product.id}
              id={product.id} 
              title={product.title}
              price={product.price}
              category={product.category}
              imageUrl={product.image}
            />
          ))}
        </div>
      </div>

      {/* القسم الثالث: تسوق حسب الدوري */}
      <div className="container mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-center mb-12">Shop by <span className="text-[#00AEEF]">League</span></h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {leagues.map((league) => (
            <Link href={`/catalog?league=${league.name.toLowerCase().replace(' ', '-')}`} key={league.id}>
              <div className="group relative h-48 rounded-lg overflow-hidden cursor-pointer">
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition duration-300 z-10"></div>
                <img src={league.image} alt={league.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <h3 className="text-2xl font-bold text-white uppercase tracking-wider group-hover:text-[#00AEEF] transition duration-300">
                    {league.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}