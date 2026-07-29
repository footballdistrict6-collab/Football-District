"use client";

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cart';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Truck, ArrowLeft, Award, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    setMounted(true);
    // التحقق مما إذا كان الزبون مسجل الدخول لربط الطلب بحسابه
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    }
    checkUser();
  }, []);

  if (!mounted) return null;

  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const shipping = 5.00; // تكلفة التوصيل في لبنان 5$
  const total = subtotal + shipping;

  // حساب إجمالي نقاط الولاء المكتسبة من هذه السلة (الافتراضي 20 نقطة للقطعة إن لم تحدد)
// حساب إجمالي نقاط الولاء المكتسبة بناءً على القيم الفعلية المحفوظة في السلة
const totalPointsEarned = items.reduce((sum, item: any) => {
    const pts = Number(item.loyalty_points_earned) || 20;
    return sum + (pts * (Number(item.quantity) || 1));
  }, 0);
  
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);

    const { error } = await supabase.from('orders').insert([
      {
        user_id: userId || null,
        first_name: form.firstName,
        last_name: form.lastName,
        phone: form.phone,
        address: form.address,
        notes: form.notes,
        items: items,
        total_amount: total.toFixed(2),
        points_earned: totalPointsEarned,
        points_awarded: false,
        status: 'Pending'
      }
    ]);

    setLoading(false);

    if (error) {
      alert("حدث خطأ أثناء إرسال الطلب: " + error.message);
    } else {
      setIsSuccess(true);
      clearCart();
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen py-20 text-white flex items-center justify-center">
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-10 max-w-lg w-full text-center shadow-2xl">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black uppercase mb-2">Order Confirmed!</h2>
          <p className="text-gray-400 mb-6">
            Thank you for shopping with Football District. We will contact you soon to confirm delivery.
          </p>
          <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333] mb-8 inline-flex items-center gap-2 text-amber-400 font-bold">
            <Award className="w-5 h-5" />
            <span>+{totalPointsEarned} Loyalty Points will be awarded upon delivery!</span>
          </div>
          <Link
            href="/catalog"
            className="w-full bg-[#00AEEF] hover:bg-blue-500 text-white font-bold py-4 rounded-xl block transition shadow-[0_0_15px_rgba(0,174,239,0.3)]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen py-16 text-white">
      <div className="container mx-auto px-6 max-w-5xl">
        <Link href="/cart" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>

        <h1 className="text-4xl font-extrabold uppercase tracking-tight mb-10 border-b border-[#1f1f1f] pb-6">
          Checkout <span className="text-[#00AEEF]">Order</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* نموذج بيانات التوصيل */}
          <form onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-6">
            <div className="bg-[#121212] p-6 md:p-8 rounded-xl border border-[#1f1f1f] space-y-6">
              <h3 className="text-xl font-bold border-b border-[#333] pb-4">Delivery Information (Lebanon)</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2 font-semibold">First Name *</label>
                  <input
                    type="text" required value={form.firstName}
                    onChange={(e) => setForm({...form, firstName: e.target.value})}
                    placeholder="Hussein"
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3.5 text-white focus:outline-none focus:border-[#00AEEF]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2 font-semibold">Last Name *</label>
                  <input
                    type="text" required value={form.lastName}
                    onChange={(e) => setForm({...form, lastName: e.target.value})}
                    placeholder="Cherry"
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3.5 text-white focus:outline-none focus:border-[#00AEEF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2 font-semibold">Phone Number *</label>
                <input
                  type="tel" required value={form.phone}
                  onChange={(e) => setForm({...form, phone: e.target.value})}
                  placeholder="03 123 456 or 70 123 456"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3.5 text-white focus:outline-none focus:border-[#00AEEF]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2 font-semibold">Detailed Address *</label>
                <textarea
                  required rows={3} value={form.address}
                  onChange={(e) => setForm({...form, address: e.target.value})}
                  placeholder="City, Area, Street, Building, Floor..."
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3.5 text-white focus:outline-none focus:border-[#00AEEF]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2 font-semibold">Order Notes (Optional)</label>
                <input
                  type="text" value={form.notes}
                  onChange={(e) => setForm({...form, notes: e.target.value})}
                  placeholder="e.g. Please deliver after 5 PM"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3.5 text-white focus:outline-none focus:border-[#00AEEF]"
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading || items.length === 0}
              className="w-full bg-[#00AEEF] hover:bg-blue-500 text-white font-extrabold py-5 rounded-xl transition shadow-[0_0_20px_rgba(0,174,239,0.3)] text-lg"
            >
              {loading ? "Placing Order..." : `Confirm Order — Cash on Delivery ($${total.toFixed(2)})`}
            </button>
          </form>

          {/* ملخص السلة والنقاط المكتسبة */}
          <div className="lg:col-span-5">
            <div className="bg-[#121212] p-6 md:p-8 rounded-xl border border-[#1f1f1f] sticky top-24 space-y-6">
              <h3 className="text-xl font-bold border-b border-[#333] pb-4">Order Summary</h3>

              <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt="" className="w-10 h-10 rounded object-cover bg-[#1a1a1a]" />
                      <div>
                        <p className="font-bold line-clamp-1">{item.title}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#00AEEF]">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* بانر النقاط الذهبي */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-amber-400">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Award className="w-5 h-5" />
                  <span>Loyalty Points Earned</span>
                </div>
                <span className="font-extrabold text-base">+{totalPointsEarned} PTS</span>
              </div>

              <div className="border-t border-[#333] pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping (Lebanon)</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-black text-white pt-2 border-t border-[#333]">
                  <span>Total</span>
                  <span className="text-[#00AEEF]">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-gray-400 border-t border-[#333]">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#00AEEF]" />
                  <span>Fast Lebanon Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00AEEF]" />
                  <span>Cash on Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}