"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, ShoppingBag, Plus, RefreshCw, CheckCircle2, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'add_product'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // حقول إضافة منتج جديد
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    category: 'Jerseys',
    season: '2026-2027',
    imageUrl: ''
  });

  // جلب الطلبات من قاعدة البيانات
  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // وظيفة إضافة منتج جديد بسهولة
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('products').insert([
      {
        title: newProduct.title,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        season: newProduct.season,
        image_urls: [newProduct.imageUrl], // حفظ الصورة كمصفوفة تلقائياً لتجنب خطأ Array
        is_retro: false
      }
    ]);

    if (error) {
      alert("حدث خطأ أثناء إضافة المنتج: " + error.message);
    } else {
      alert("تمت إضافة المنتج بنجاح إلى الكتالوج! ✅");
      setNewProduct({ title: '', price: '', category: 'Jerseys', season: '2026-2027', imageUrl: '' });
    }
  };

  // وظيفة تغيير حالة الطلب (مثلاً من Pending إلى Delivered)
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    fetchOrders();
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen py-12 text-white">
      <div className="container mx-auto px-6 max-w-6xl">
        
        {/* الترويسة وأزرار التبديل */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-[#1f1f1f] pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-wide">
              Admin <span className="text-[#00AEEF]">Dashboard</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Football District Control Center</p>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition ${activeTab === 'orders' ? 'bg-[#00AEEF] text-white' : 'bg-[#121212] text-gray-400 hover:text-white'}`}
            >
              <ShoppingBag className="w-5 h-5" /> Customer Orders ({orders.length})
            </button>
            <button 
              onClick={() => setActiveTab('add_product')}
              className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition ${activeTab === 'add_product' ? 'bg-[#00AEEF] text-white' : 'bg-[#121212] text-gray-400 hover:text-white'}`}
            >
              <Plus className="w-5 h-5" /> Add New Product
            </button>
          </div>
        </div>

        {/* القسم الأول: جدول إدارة الطلبات */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Recent Orders</h2>
              <button onClick={fetchOrders} className="flex items-center gap-2 text-sm text-[#00AEEF] hover:underline">
                <RefreshCw className="w-4 h-4" /> Refresh List
              </button>
            </div>

            {loading ? (
              <p className="text-gray-400">Loading orders...</p>
            ) : orders.length === 0 ? (
              <div className="bg-[#121212] p-12 text-center rounded-xl border border-[#1f1f1f]">
                <p className="text-gray-400">No orders placed yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="bg-[#121212] p-6 rounded-xl border border-[#1f1f1f] flex flex-col md:flex-row justify-between gap-6">
                    
                    {/* بيانات الزبون */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">{order.first_name} {order.last_name}</span>
                        <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase flex items-center gap-1 ${order.status === 'Delivered' ? 'bg-green-900/50 text-green-400 border border-green-500' : 'bg-yellow-900/50 text-yellow-400 border border-yellow-500'}`}>
                          {order.status === 'Delivered' ? <CheckCircle2 className="w-3 h-3"/> : <Clock className="w-3 h-3"/>}
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">📞 {order.phone}</p>
                      <p className="text-sm text-gray-400">📍 {order.address}</p>
                      <p className="text-xs text-gray-500">Ordered: {new Date(order.created_at).toLocaleString()}</p>
                    </div>

                    {/* المنتجات المطلوبة */}
                    <div className="bg-[#1a1a1a] p-4 rounded-lg flex-1">
                      <p className="text-xs text-gray-400 uppercase font-bold mb-2">Items Ordered:</p>
                      <div className="space-y-1">
                        {Array.isArray(order.items) && order.items.map((item: any, i: number) => (
                          <div key={i} className="text-sm flex justify-between">
                            <span>{item.quantity}x {item.title}</span>
                            <span className="text-[#00AEEF]">${item.price}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-[#333] mt-3 pt-2 flex justify-between font-bold">
                        <span>Total (with Shipping):</span>
                        <span className="text-[#00AEEF]">${order.total_amount}</span>
                      </div>
                    </div>

                    {/* زر تحديث الحالة */}
                    <div className="flex md:flex-col justify-end gap-2">
                      {order.status !== 'Delivered' ? (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'Delivered')}
                          className="bg-green-600 hover:bg-green-500 text-white text-sm font-bold px-4 py-2 rounded transition"
                        >
                          Mark Delivered ✅
                        </button>
                      ) : (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'Pending')}
                          className="bg-[#1f1f1f] hover:bg-[#333] text-gray-400 text-sm px-4 py-2 rounded transition"
                        >
                          Revert to Pending
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* القسم الثاني: إضافة منتج جديد للكتالوج بسهولة */}
        {activeTab === 'add_product' && (
          <div className="max-w-2xl mx-auto bg-[#121212] p-8 rounded-xl border border-[#1f1f1f]">
            <h2 className="text-2xl font-bold mb-6 border-b border-[#333] pb-4">Add New Jersey / Product</h2>
            
            <form onSubmit={handleAddProduct} className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Product Title</label>
                <input 
                  required
                  type="text" 
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                  placeholder="e.g. Arsenal 26/27 Home Jersey" 
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded p-3 text-white focus:outline-none focus:border-[#00AEEF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Price ($ USD)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    placeholder="119.99" 
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded p-3 text-white focus:outline-none focus:border-[#00AEEF]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Category</label>
                  <select 
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded p-3 text-white focus:outline-none focus:border-[#00AEEF]"
                  >
                    <option value="Jerseys">Jerseys</option>
                    <option value="Retro Jerseys">Retro Jerseys</option>
                    <option value="Football Boots">Football Boots</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Image URL</label>
                <input 
                  required
                  type="url" 
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                  placeholder="https://images.unsplash.com/..." 
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded p-3 text-white focus:outline-none focus:border-[#00AEEF]"
                />
                <p className="text-xs text-gray-500 mt-1">Paste any direct image link here.</p>
              </div>

              <button 
                type="submit" 
                className="w-full bg-[#00AEEF] hover:bg-blue-500 text-white font-bold py-4 rounded transition shadow-[0_0_15px_rgba(0,174,239,0.3)] mt-4"
              >
                Publish Product to Catalog 🚀
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}