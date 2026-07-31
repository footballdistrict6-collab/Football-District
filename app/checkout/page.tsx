"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { supabase } from '@/lib/supabase';
import { 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft 
} from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const router = useRouter();

  // بيانات نموذج الطلب
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    notes: ''
  });

  // حالة الخصم والأكواد
  const [voucherCode, setVoucherCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  // حالة التقديم
  const [isSubmitting, setIsSubmitting] = useState(false);

  // حساب المجاميع ورسوم التوصيل في لبنان ($4.00)
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const shipping = 4.00;
  const total = Math.max(0, subtotal + shipping - discountAmount);

  // التحقق مما إذا كان المنتج قميصاً عادياً (Kits / Regular Season)
  const isRegularKitCategory = (category?: string) => {
    if (!category) return true;
    const cat = category.toLowerCase();
    return (
      cat === 'kits' ||
      cat === 'home jerseys' ||
      cat === 'away jerseys' ||
      cat === 'third jerseys' ||
      cat === 'jerseys'
    );
  };

  // التحقق مما إذا كان المنتج حذاءً (Boots)
  const isBootCategory = (category?: string) => {
    if (!category) return false;
    return category.toLowerCase().includes('boot');
  };

  // تطبيق أكواد الخصم والعروض الخاصة
  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherError(null);

    const cleanCode = voucherCode.trim().toUpperCase();
    if (!cleanCode) return;

    // 1. بروموكود WEEK1 (BOGO 50% OFF على القمصان العادية فقط)
    if (cleanCode === 'WEEK1') {
      const regularKitsPrices: number[] = [];

      items.forEach((item: any) => {
        if (isRegularKitCategory(item.category)) {
          const qty = Number(item.quantity) || 1;
          const price = parseFloat(item.price) || 0;
          for (let i = 0; i < qty; i++) {
            regularKitsPrices.push(price);
          }
        }
      });

      if (regularKitsPrices.length < 2) {
        setVoucherError('⚠️ Promo code WEEK1 requires at least 2 Regular Season Kits in your bag.');
        return;
      }

      regularKitsPrices.sort((a, b) => a - b);
      const bogoDiscount = regularKitsPrices[0] * 0.5;

      setDiscountAmount(Number(bogoDiscount.toFixed(2)));
      setAppliedVoucher('WEEK1 (BOGO 50% OFF)');
      setVoucherCode('');
      return;
    }

    // 2. بروموكود SHOES1 (اشتري حذاء Boots واحصل على تيشيرت Kits مجاناً)
    if (cleanCode === 'SHOES1') {
      let hasBoots = false;
      const regularKitsPrices: number[] = [];

      items.forEach((item: any) => {
        if (isBootCategory(item.category)) {
          hasBoots = true;
        }

        if (isRegularKitCategory(item.category)) {
          const qty = Number(item.quantity) || 1;
          const price = parseFloat(item.price) || 0;
          for (let i = 0; i < qty; i++) {
            regularKitsPrices.push(price);
          }
        }
      });

      if (!hasBoots || regularKitsPrices.length === 0) {
        setVoucherError('⚠️ Promo code SHOES1 requires at least 1 Pair of Boots AND 1 Regular Season Kit.');
        return;
      }

      regularKitsPrices.sort((a, b) => a - b);
      const freeKitDiscount = regularKitsPrices[0]; // خصم كامل قيمة القميص الأرخص

      setDiscountAmount(Number(freeKitDiscount.toFixed(2)));
      setAppliedVoucher('SHOES1 (FREE KIT WITH BOOTS)');
      setVoucherCode('');
      return;
    }

    // 3. قسائم الولاء الثابتة (FD-5OFF أو FD-15OFF)
    if (cleanCode.startsWith('FD-5OFF')) {
      setDiscountAmount(5);
      setAppliedVoucher(cleanCode);
      setVoucherCode('');
    } else if (cleanCode.startsWith('FD-15OFF')) {
      setDiscountAmount(15);
      setAppliedVoucher(cleanCode);
      setVoucherCode('');
    } else {
      setVoucherError('❌ Invalid or expired promo code.');
    }
  };

  // إزالة الخصم
  const handleRemoveVoucher = () => {
    setDiscountAmount(0);
    setAppliedVoucher(null);
    setVoucherError(null);
  };

  // تقديم الطلب وحفظه في Supabase + إرسال تنبيه الإيميل
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert("⚠️ Your shopping bag is empty!");
      return;
    }

    setIsSubmitting(true);

    // حساب مجموع النقاط المكتسبة من الطلب
    const totalPointsEarned = items.reduce((sum, item) => {
      const points = Number(item.loyalty_points_earned) > 0 ? Number(item.loyalty_points_earned) : 20;
      return sum + (points * (Number(item.quantity) || 1));
    }, 0);

    const orderData = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      notes: formData.notes.trim() || null,
      items: items,
      total_amount: Number(total.toFixed(2)),
      points_earned: totalPointsEarned,
      status: 'Pending',
      promo_code: appliedVoucher || null,
      created_at: new Date().toISOString()
    };

    // 1. حفظ الطلب في قاعدة البيانات
    const { data: insertedOrder, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) {
      alert("🚨 Something went wrong placing your order: " + error.message);
      setIsSubmitting(false);
      return;
    }

    // 2. إرسال تنبيه فوري إلى إيميل footballdistrict812@gmail.com
    if (insertedOrder) {
      try {
        await fetch('/api/send-order-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(insertedOrder),
        });
      } catch (mailErr) {
        console.error("Didn't send notification email:", mailErr);
      }
    }

    // 3. تفريغ السلة وتوجيه العميل لصفحة النجاح
    clearCart();
    router.push('/success');
  };

  if (items.length === 0) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen py-20 text-white flex flex-col items-center justify-center px-6">
        <ShoppingBag className="w-16 h-16 text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your Bag is Empty</h2>
        <p className="text-gray-400 mb-8 text-sm">Add some jerseys or boots before checking out.</p>
        <Link 
          href="/catalog" 
          className="bg-[#00AEEF] hover:bg-blue-500 text-white font-extrabold px-8 py-4 rounded-xl transition"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen py-12 text-white">
      <div className="container mx-auto px-6 max-w-6xl">
        
        <Link 
          href="/cart" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* نموذج معلومات العميل والتوصيل (العمود الأيسر - 7 أعمدة) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#121212] p-6 md:p-8 rounded-2xl border border-[#1f1f1f]">
              <h2 className="text-xl font-extrabold uppercase tracking-tight mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#00AEEF]" /> Lebanon Delivery Details
              </h2>

              <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Hussein"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-[#262626] rounded-xl p-3.5 text-white text-sm focus:border-[#00AEEF] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ali"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-[#262626] rounded-xl p-3.5 text-white text-sm focus:border-[#00AEEF] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Phone Number (Lebanon) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+961 70 000 000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#262626] rounded-xl p-3.5 text-white text-sm focus:border-[#00AEEF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Detailed Delivery Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="City, Street, Building, Floor number"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#262626] rounded-xl p-3.5 text-white text-sm focus:border-[#00AEEF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Order Notes (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Any special instructions for courier delivery?"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#262626] rounded-xl p-3.5 text-white text-sm focus:border-[#00AEEF] focus:outline-none"
                  />
                </div>
              </form>
            </div>

            <div className="p-4 bg-[#121212] rounded-xl border border-[#1f1f1f] flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-400" /> Payment Method:
              </span>
              <span className="font-bold text-white uppercase">Cash on Delivery (COD)</span>
            </div>
          </div>

          {/* ملخص الطلب والبروموكود (العمود الأيمن - 5 أعمدة) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#121212] p-6 md:p-8 rounded-2xl border border-[#1f1f1f] space-y-6">
              <h2 className="text-xl font-extrabold uppercase tracking-tight border-b border-[#222] pb-4">
                Order Summary ({items.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0)})
              </h2>

              {/* عناصر السلة */}
              <div className="space-y-4 max-h-60 overflow-y-auto pr-1 divide-y divide-[#1f1f1f]">
              {items.map((item: any) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-gray-400 text-xs bg-[#1a1a1a] px-2 py-1 rounded">
                        {item.quantity}x
                      </span>
                      <div>
                        <p className="font-bold text-white text-xs leading-tight">{item.title}</p>
                        {item.category && (
                          <span className="text-[10px] text-gray-500 uppercase">{item.category}</span>
                        )}
                      </div>
                    </div>
                    <span className="font-extrabold text-white">
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* قسم البروموكود والعروض */}
              <div className="border-t border-[#222] pt-4">
                {appliedVoucher ? (
                  <div className="bg-green-950/40 border border-green-500 rounded-xl p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-400 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{appliedVoucher}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveVoucher}
                      className="text-xs text-gray-400 hover:text-white underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyVoucher} className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Promo code (e.g. WEEK1, SHOES1)"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value)}
                          className="w-full bg-[#1a1a1a] border border-[#262626] rounded-xl py-3 pl-9 pr-3 text-xs uppercase text-white font-semibold focus:border-[#00AEEF] focus:outline-none"
                        />
                        <Tag className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-3.5" />
                      </div>
                      <button
                        type="submit"
                        className="bg-[#222] hover:bg-[#00AEEF] hover:text-white text-gray-300 font-bold px-5 rounded-xl text-xs transition border border-[#333]"
                      >
                        Apply
                      </button>
                    </div>

                    {voucherError && (
                      <p className="text-red-400 text-xs flex items-center gap-1 mt-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" /> {voucherError}
                      </p>
                    )}
                  </form>
                )}
              </div>

              {/* الحسابات النهائية */}
              <div className="border-t border-[#222] pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-400">
                  <span>Shipping (Lebanon)</span>
                  <span className="font-semibold text-white">${shipping.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-400 font-bold">
                    <span>Discount Applied</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center border-t border-[#222] pt-3 text-lg font-black text-white">
                  <span>Total Due (COD)</span>
                  <span className="text-2xl text-[#00AEEF]">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* زر إتمام الطلب */}
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className={`w-full font-extrabold py-5 rounded-xl transition shadow-xl text-base flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
                    : 'bg-[#00AEEF] hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(0,174,239,0.3)]'
                }`}
              >
                {isSubmitting ? (
                  'Processing Order...'
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" /> Place Order — ${total.toFixed(2)} COD
                  </>
                )}
              </button>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}