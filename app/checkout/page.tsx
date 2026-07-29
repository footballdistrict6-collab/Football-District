"use client";

import { useCartStore } from '@/store/cart';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, Truck, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore(); // سنضيف طريقة لتفريغ السلة لاحقاً إن أردت
  const [mounted, setMounted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // حقول نموذج بيانات الزبون
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const total = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const shippingCost = total > 0 ? 5.00 : 0;
  const finalTotal = total + shippingCost;

  // إرسال الطلب فعلياً إلى Supabase
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('orders').insert([
      {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        items: items,
        total_amount: finalTotal,
        status: 'Pending'
      }
    ]);

    setLoading(false);

    if (error) {
      alert("حدث خطأ أثناء إرسال الطلب: " + error.message);
    } else {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center py-20 text-white">
        <div className="bg-[#121212] p-10 rounded-2xl border border-[#1f1f1f] text-center max-w-lg mx-auto">
          <CheckCircle className="w-24 h-24 text-[#00AEEF] mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Order Confirmed!</h1>
          <p className="text-gray-400 mb-8">
            Thank you for shopping at Football District. Your order has been successfully saved, and we will contact you shortly.
          </p>
          <Link href="/catalog" className="bg-[#00AEEF] text-white font-bold py-4 px-8 rounded hover:bg-blue-500 transition shadow-[0_0_15px_rgba(0,174,239,0.3)] inline-block">
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen py-20 text-white">
      <div className="container mx-auto px-6 max-w-6xl">
        <h1 className="text-4xl font-bold uppercase tracking-wide mb-10 border-b border-[#1f1f1f] pb-6">
          Secure <span className="text-[#00AEEF]">Checkout</span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-12">
          
          <div className="w-full lg:w-2/3">
            <form onSubmit={handlePlaceOrder} className="bg-[#121212] p-8 rounded-xl border border-[#1f1f1f] space-y-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="text-[#00AEEF]" /> Shipping Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">First Name</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded p-3 text-white focus:outline-none focus:border-[#00AEEF] transition" 
                    placeholder="Cristiano" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Last Name</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded p-3 text-white focus:outline-none focus:border-[#00AEEF] transition" 
                    placeholder="Ronaldo" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
                <input 
                  required 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded p-3 text-white focus:outline-none focus:border-[#00AEEF] transition" 
                  placeholder="+961 XX XXX XXX" 
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Full Delivery Address</label>
                <textarea 
                  required 
                  rows={3} 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded p-3 text-white focus:outline-none focus:border-[#00AEEF] transition" 
                  placeholder="City, Street, Building, Floor..."
                ></textarea>
              </div>

              <div className="bg-[#1a1a1a] p-4 rounded border border-[#333] flex items-center gap-4 mt-6">
                <input type="radio" checked readOnly className="w-5 h-5 accent-[#00AEEF]" />
                <div>
                  <p className="font-bold">Cash on Delivery</p>
                  <p className="text-sm text-gray-400">Pay when your order arrives at your door.</p>
                </div>
              </div>

              <button 
                disabled={loading}
                type="submit" 
                className="w-full bg-[#00AEEF] text-white font-bold py-4 rounded hover:bg-blue-500 transition shadow-[0_0_15px_rgba(0,174,239,0.3)] mt-8 text-lg flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : `Place Order ($${finalTotal.toFixed(2)})`}
              </button>
            </form>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-[#121212] p-8 rounded-xl border border-[#1f1f1f] sticky top-24">
              <h3 className="text-2xl font-bold mb-6 border-b border-[#333] pb-4">Order Summary</h3>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">{item.quantity}x</span>
                      <span className="truncate max-w-[150px]">{item.title}</span>
                    </div>
                    <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-[#333] pt-4 space-y-3">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span className="flex items-center gap-2"><Truck className="w-4 h-4"/> Shipping</span>
                  <span>${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-4 border-t border-[#333]">
                  <span>Total</span>
                  <span className="text-[#00AEEF]">${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}