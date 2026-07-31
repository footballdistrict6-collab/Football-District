import Link from 'next/link';
import { CheckCircle, ShoppingBag, Home, Package } from 'lucide-react';

export default function SuccessPage() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center p-6 text-white">
      <div className="max-w-lg w-full bg-[#121212] border border-[#1f1f1f] rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
        
        {/* تأثير إضاءة خفيف في الخلفية */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-green-500/20 blur-[60px] rounded-full pointer-events-none" />

        {/* أيقونة النجاح */}
        <div className="relative w-24 h-24 mx-auto bg-green-950/50 rounded-full flex items-center justify-center border border-green-500/30 mb-6 animate-in zoom-in duration-500">
          <CheckCircle className="w-12 h-12 text-green-400" />
        </div>

        {/* النصوص */}
        <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-3">
          Order Confirmed!
        </h1>
        <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-8">
          Thank you for shopping with <strong className="text-[#00AEEF]">FOOTBALL DISTRICT</strong>. 
          Your order has been successfully placed and is now being processed. 
          We will contact you shortly to arrange your fast delivery in Lebanon.
        </p>

        {/* تفاصيل سريعة */}
        <div className="bg-[#1a1a1a] rounded-xl p-4 mb-8 flex items-center justify-center gap-2 border border-[#2b2b2b]">
          <Package className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-bold text-gray-300">Payment Method: <span className="text-white uppercase">Cash on Delivery</span></span>
        </div>

        {/* أزرار العودة */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link 
            href="/catalog" 
            className="flex-1 bg-[#00AEEF] hover:bg-blue-500 text-white font-extrabold py-4 rounded-xl transition shadow-lg text-sm flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" /> Continue Shopping
          </Link>
          <Link 
            href="/" 
            className="flex-1 bg-[#1a1a1a] hover:bg-[#222] text-gray-300 hover:text-white border border-[#333] font-bold py-4 rounded-xl transition text-sm flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}