"use client";

import { useCartStore } from '@/store/cart';
import Link from 'next/link';
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const total = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

  return (
    <div className="bg-[#0a0a0a] min-h-screen py-20 text-white">
      <div className="container mx-auto px-6 max-w-6xl">
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wide mb-10 border-b border-[#1f1f1f] pb-6">
          Shopping <span className="text-[#00AEEF]">Cart</span>
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-32 bg-[#121212] rounded-2xl border border-[#1f1f1f] flex flex-col items-center justify-center">
            <ShoppingBag className="w-20 h-20 text-[#1f1f1f] mb-6" />
            <h3 className="text-2xl mb-2 font-bold">Your cart is empty</h3>
            <p className="text-gray-400 mb-8">Looks like you haven't added any gear yet.</p>
            <Link href="/catalog" className="bg-[#00AEEF] text-white font-bold py-4 px-8 rounded hover:bg-blue-500 transition shadow-[0_0_15px_rgba(0,174,239,0.3)]">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* قائمة المنتجات مع أزرار التحكم */}
            <div className="w-full lg:w-2/3 space-y-6">
              {items.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-[#121212] p-6 rounded-xl border border-[#1f1f1f] hover:border-[#333] transition">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-[#1a1a1a] rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-90" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{item.title}</h4>
                      <p className="text-[#00AEEF] font-semibold mt-1">${item.price}</p>
                    </div>
                  </div>

                  {/* أزرار زيادة وتقليل الكمية وحذف المنتج */}
                  <div className="flex items-center gap-6 self-end sm:self-center">
                    <div className="flex items-center border border-[#333] rounded-lg bg-[#1a1a1a]">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#222] transition rounded-l-lg"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#222] transition rounded-r-lg"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-gray-500 hover:text-red-500 transition p-2"
                      title="Remove Item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ملخص الطلب والدفع */}
            <div className="w-full lg:w-1/3">
              <div className="bg-[#121212] p-8 rounded-xl border border-[#1f1f1f] sticky top-24">
                <h3 className="text-2xl font-bold mb-6 border-b border-[#333] pb-4">Order Summary</h3>
                
                <div className="flex justify-between mb-4">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="font-semibold">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-6 border-b border-[#333] pb-6">
                  <span className="text-gray-400">Shipping (Lebanon)</span>
                  <span className="text-sm text-gray-400">Calculated at checkout</span>
                </div>
                
                <div className="flex justify-between text-2xl font-bold mb-8">
                  <span>Total</span>
                  <span className="text-[#00AEEF]">${total.toFixed(2)}</span>
                </div>
                
                <Link 
                  href="/checkout"
                  className="w-full bg-[#00AEEF] text-white font-bold py-4 rounded hover:bg-blue-500 transition shadow-[0_0_15px_rgba(0,174,239,0.3)] block text-center"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}