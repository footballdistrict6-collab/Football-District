"use client";

import { useState, useEffect } from 'react';
import { X, Tag, Sparkles, Copy, CheckCircle2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    // التأكد من عدم إزعاج الزبون (تظهر مرة واحدة فقط في الجلسة)
    const hasSeenPromo = sessionStorage.getItem('promo_popup_seen');
    
    if (!hasSeenPromo) {
      // تأخير الظهور لمدة 3 ثوانٍ حتى يكتمل تحميل الصفحة
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('promo_popup_seen', 'true');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500); // إخفاء علامة "تم النسخ" بعد ثانيتين ونصف
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* الخلفية المظلمة (Overlay) */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* صندوق الـ Pop-up */}
      <div className="relative w-full max-w-md bg-[#0d0d0d] border border-[#222] rounded-3xl shadow-[0_0_40px_rgba(0,174,239,0.15)] overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* زر الإغلاق */}
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-1.5 bg-[#1a1a1a] text-gray-400 hover:text-white rounded-full transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* الترويسة الجذابة */}
        <div className="bg-gradient-to-br from-[#00AEEF]/20 to-transparent p-6 text-center border-b border-[#222]">
          <div className="w-12 h-12 bg-[#00AEEF]/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-[#00AEEF]/30">
            <Sparkles className="w-6 h-6 text-[#00AEEF]" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Unlock Special Deals!</h2>
          <p className="text-sm text-gray-400 mt-1">Claim your exclusive offers before they expire.</p>
        </div>

        {/* العروض (Promo Codes) */}
        <div className="p-6 space-y-4">
          
          {/* العرض الأول: WEEK1 */}
          <div className="bg-[#161616] border border-[#2b2b2b] rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full" />
            <div>
              <h3 className="font-extrabold text-white text-base">Buy 1, Get 1 <span className="text-[#00AEEF]">50% OFF</span></h3>
              <p className="text-xs text-gray-400 mt-0.5">Valid on all 26/27 Regular Season Kits.</p>
            </div>
            <button 
              onClick={() => handleCopyCode('WEEK1')}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl border transition font-bold text-sm ${copiedCode === 'WEEK1' ? 'bg-green-950/40 border-green-500/50 text-green-400' : 'bg-[#1a1a1a] border-[#333] text-white hover:border-[#00AEEF] hover:bg-[#00AEEF]/10'}`}
            >
              <span className="tracking-widest flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-500" /> WEEK1
              </span>
              {copiedCode === 'WEEK1' ? (
                <span className="flex items-center gap-1 text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Copied!</span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-gray-400"><Copy className="w-3.5 h-3.5" /> Copy</span>
              )}
            </button>
          </div>

          {/* العرض الثاني: SHOES1 */}
          <div className="bg-[#161616] border border-[#2b2b2b] rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-full" />
            <div>
              <h3 className="font-extrabold text-white text-base">Free Kit with <span className="text-amber-400">Boots</span></h3>
              <p className="text-xs text-gray-400 mt-0.5">Buy any boots and get a Regular Kit for 100% FREE.</p>
            </div>
            <button 
              onClick={() => handleCopyCode('SHOES1')}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl border transition font-bold text-sm ${copiedCode === 'SHOES1' ? 'bg-green-950/40 border-green-500/50 text-green-400' : 'bg-[#1a1a1a] border-[#333] text-white hover:border-amber-500/50 hover:bg-amber-500/10'}`}
            >
              <span className="tracking-widest flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-500" /> SHOES1
              </span>
              {copiedCode === 'SHOES1' ? (
                <span className="flex items-center gap-1 text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Copied!</span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-gray-400"><Copy className="w-3.5 h-3.5" /> Copy</span>
              )}
            </button>
          </div>

        </div>

        {/* تذييل النافذة وزر التسوق */}
        <div className="p-6 pt-0">
          <Link 
            href="/catalog"
            onClick={() => setIsOpen(false)}
            className="w-full bg-[#00AEEF] hover:bg-blue-500 text-white font-extrabold py-3.5 rounded-xl transition shadow-[0_0_15px_rgba(0,174,239,0.3)] text-sm flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" /> Start Shopping Now
          </Link>
          <p className="text-center text-[10px] text-gray-500 mt-3 font-medium">
            Enter the promo code at checkout. Only one code per order.
          </p>
        </div>

      </div>
    </div>
  );
}