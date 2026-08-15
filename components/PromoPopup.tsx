"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
// تم إضافة Tag هنا 👇
import { X, Sparkles, Copy, Check, ShoppingBag, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchPopupSettings() {
      try {
        const { data, error } = await supabase
          .from('popup_settings')
          .select('*')
          .eq('id', 1)
          .single();

        if (error || !data || !data.is_active) return;

        // --- نظام التحكم بمرات الظهور (Show Frequency) ---
        const frequency = data.show_frequency || 'once_per_session';
        const today = new Date().toDateString();

        if (frequency === 'once_per_session') {
          if (sessionStorage.getItem('popup_shown_session')) return;
        } else if (frequency === 'once_per_day') {
          if (localStorage.getItem('popup_shown_date') === today) return;
        }

        setSettings(data);

        // تأخير الظهور حسب الثواني المحددة في الأدمن
        const delay = (data.delay_seconds || 0) * 1000;
        setTimeout(() => {
          setIsOpen(true);
        }, Math.max(delay, 500)); 

      } catch (err) {
        console.error('Error fetching popup settings:', err);
      }
    }

    fetchPopupSettings();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (!settings) return;

    // تسجيل أن العميل قد رأى البوب أب
    const frequency = settings.show_frequency || 'once_per_session';
    if (frequency === 'once_per_session') {
      sessionStorage.setItem('popup_shown_session', 'true');
    } else if (frequency === 'once_per_day') {
      localStorage.setItem('popup_shown_date', new Date().toDateString());
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000); 
  };

  const handleButtonClick = () => {
    handleClose();
    if (settings.button_link) {
      router.push(settings.button_link);
    }
  };

  if (!isOpen || !settings) return null;

  // التأكد من أن البروموهات موجودة ومحفوظة
  const promos = Array.isArray(settings.promos) ? settings.promos : [];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* الخلفية المظلمة */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* صندوق البوب أب */}
      <div className="relative w-full max-w-[380px] bg-[#0d0d0d] border border-[#1f1f1f] rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 p-6 md:p-8">
        
        {/* زر الإغلاق */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white p-2 bg-[#1a1a1a] hover:bg-[#222] rounded-full transition z-10"
        >
          <X className="w-4 h-4" />
        </button>
        
        {/* الترويسة الأنيقة */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-full border border-[#222] flex items-center justify-center mb-5 bg-[#121212] shadow-inner">
            <Sparkles className="text-[#00AEEF] w-7 h-7" />
          </div>
          <h2 className="text-xl md:text-2xl font-black uppercase text-center text-white mb-2 leading-tight">
            {settings.title}
          </h2>
          <p className="text-sm text-gray-400 text-center px-2 leading-relaxed">
            {settings.description}
          </p>
        </div>

        {/* قائمة العروض (البروموكودات) */}
        <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
          {promos.map((promo: any, idx: number) => (
            <div key={idx} className="bg-[#121212] border border-[#222] rounded-2xl p-5 hover:border-[#333] transition">
              <h3 className="font-bold text-white text-[15px] mb-1">
                {promo.title}
              </h3>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                {promo.subtitle}
              </p>
              
              <div className="flex items-center justify-between bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 group">
                <div className="flex items-center gap-2 text-[#00AEEF] font-bold tracking-widest text-sm font-mono">
                  <Tag className="w-4 h-4 text-gray-500" /> {promo.code}
                </div>
                <button 
                  onClick={() => handleCopyCode(promo.code)}
                  className={`flex items-center gap-1.5 text-xs font-bold transition px-3 py-1.5 rounded-lg border ${
                    copiedCode === promo.code 
                      ? 'bg-green-950/50 text-green-400 border-green-500/30' 
                      : 'bg-[#222] text-gray-300 hover:text-white border-[#444] hover:bg-[#333]'
                  }`}
                >
                  {copiedCode === promo.code ? (
                    <><Check className="w-3.5 h-3.5" /> Copied</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> Copy</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* الزر الرئيسي */}
        <button 
          onClick={handleButtonClick}
          className="w-full bg-[#005c8a] hover:bg-[#007bb5] text-white font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-[0_0_20px_rgba(0,174,239,0.2)] transition duration-300"
        >
          <ShoppingBag className="w-4 h-4" /> {settings.button_text || 'SHOP NOW'}
        </button>
        
        {/* ملاحظة الفوتر */}
        {settings.footer_text && (
          <p className="text-[10px] text-gray-500 text-center mt-5 px-4">
            {settings.footer_text}
          </p>
        )}

      </div>
    </div>
  );
}