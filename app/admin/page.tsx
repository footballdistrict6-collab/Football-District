"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Package, 
  ShoppingBag, 
  Award, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Upload, 
  X,
  Trophy
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'loyalty'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // إعدادات صرف النقاط
  const [pointValueUsd, setPointValueUsd] = useState<number>(0.05);

  // حالة التعديل على منتج موجود
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // فورم إضافة منتج جديد
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    category: 'Kits',
    league: 'Premier League',
    imageUrl: '',
    loyalty_points_earned: 20
  });

  // جلب البيانات الأساسية عند التحميل
  const fetchData = async () => {
    setLoading(true);

    // 1. جلب المنتجات
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });
    if (productsData) setProducts(productsData);

    // 2. جلب الطلبات
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (ordersData) setOrders(ordersData);

    // 3. جلب إعدادات الولاء
    const { data: storeSettings } = await supabase
      .from('store_settings')
      .select('loyalty_point_value_usd')
      .eq('id', 1)
      .single();
    if (storeSettings && storeSettings.loyalty_point_value_usd) {
      setPointValueUsd(Number(storeSettings.loyalty_point_value_usd));
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // إضافة منتج جديد
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price) {
      alert("⚠️ يرجى إدخال عنوان المنتج وسعره على الأقل!");
      return;
    }

    const { error } = await supabase.from('products').insert([
      {
        title: newProduct.title,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        league: newProduct.league,
        imageUrl: newProduct.imageUrl || 'https://images.unsplash.com/photo-1583318433420-532155e9d9e4?q=80&w=500&auto=format&fit=crop',
        image_urls: newProduct.imageUrl ? [newProduct.imageUrl] : [],
        loyalty_points_earned: Number(newProduct.loyalty_points_earned) || 20
      }
    ]);

    if (!error) {
      alert("✅ تم إضافة المنتج بنجاح!");
      setNewProduct({
        title: '',
        price: '',
        category: 'Kits',
        league: 'Premier League',
        imageUrl: '',
        loyalty_points_earned: 20
      });
      fetchData();
    } else {
      alert("🚨 خطأ أثناء الإضافة: " + error.message);
    }
  };

  // حفظ التعديلات على منتج موجود
  const handleSaveEditProduct = async () => {
    if (!editingProduct) return;

    const { error } = await supabase
      .from('products')
      .update({
        title: editingProduct.title,
        price: parseFloat(editingProduct.price),
        category: editingProduct.category,
        league: editingProduct.league,
        imageUrl: editingProduct.imageUrl,
        image_urls: editingProduct.imageUrl ? [editingProduct.imageUrl] : editingProduct.image_urls,
        loyalty_points_earned: Number(editingProduct.loyalty_points_earned) || 20
      })
      .eq('id', editingProduct.id);

    if (!error) {
      alert("✅ تم تحديث بيانات المنتج بنجاح!");
      setEditingProduct(null);
      fetchData();
    } else {
      alert("🚨 خطأ أثناء التحديث: " + error.message);
    }
  };

  // حذف منتج
  const handleDeleteProduct = async (id: number | string) => {
    if (!confirm("❓ هل أنت متأكد من رغبتك في حذف هذا المنتج؟")) return;

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      fetchData();
    } else {
      alert("🚨 خطأ أثناء الحذف: " + error.message);
    }
  };

  // تحديث حالة الطلب وإضافة نقاط الولاء عند التسليم
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (newStatus === 'Delivered' && order && order.user_id && !order.points_awarded) {
      const pointsToAdd = Number(order.points_earned) > 0 ? Number(order.points_earned) : 20;

      const { data: profile } = await supabase
        .from('profiles')
        .select('loyalty_points')
        .eq('id', order.user_id)
        .single();

      let currentPoints = 0;

      if (profile) {
        currentPoints = Number(profile.loyalty_points) || 0;
      } else {
        await supabase.from('profiles').insert([
          {
            id: order.user_id,
            full_name: `${order.first_name || ''} ${order.last_name || ''}`.trim() || 'Customer',
            loyalty_points: 0,
            role: 'customer'
          }
        ]);
      }

      const newPointsTotal = currentPoints + pointsToAdd;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ loyalty_points: newPointsTotal })
        .eq('id', order.user_id);

      if (!updateError) {
        await supabase
          .from('orders')
          .update({ status: newStatus, points_awarded: true, points_earned: pointsToAdd })
          .eq('id', orderId);

        alert(`✅ تم تسليم الطلب وإضافة +${pointsToAdd} نقطة! رصيد الزبون الجديد الآن: ${newPointsTotal} PTS`);
      } else {
        alert("🚨 حدث خطأ في تحديث النقاط: " + updateError.message);
      }
    } else {
      await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
    }

    fetchData();
  };

  // حفظ إعدادات صرف النقاط
  const handleSaveLoyaltySettings = async () => {
    const { error } = await supabase
      .from('store_settings')
      .upsert([{ id: 1, loyalty_point_value_usd: pointValueUsd }]);

    if (!error) {
      alert("✅ تم حفظ سعر صرف النقاط بنجاح!");
    } else {
      alert("🚨 حدث خطأ أثناء حفظ الإعدادات: " + error.message);
    }
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen py-10 text-white">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* الترويسة */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-[#1f1f1f] pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight">
              ADMIN <span className="text-[#00AEEF]">DASHBOARD</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Football District Control Center</p>
          </div>

          {/* أزرار التبويبات */}
          <div className="flex bg-[#121212] p-1.5 rounded-xl border border-[#222] gap-2">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${
                activeTab === 'products' ? 'bg-[#00AEEF] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" /> Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${
                activeTab === 'orders' ? 'bg-[#00AEEF] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('loyalty')}
              className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${
                activeTab === 'loyalty' ? 'bg-[#00AEEF] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" /> Loyalty Settings
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading Dashboard Data...</div>
        ) : (
          <>
            {/* 1. تبويب المنتجات */}
            {activeTab === 'products' && (
              <div className="space-y-10">
                
                {/* فورم إضافة منتج جديد */}
                <form onSubmit={handleAddProduct} className="bg-[#121212] p-6 rounded-2xl border border-[#1f1f1f] space-y-4">
                  <h3 className="font-bold text-lg border-b border-[#222] pb-3 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-[#00AEEF]" /> Add New Product
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1">Title *</label>
                      <input
                        type="text" required value={newProduct.title}
                        onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                        placeholder="e.g. Arsenal Home Jersey 2026/27"
                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm focus:border-[#00AEEF] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1">Price ($ USD) *</label>
                      <input
                        type="number" step="0.01" required value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        placeholder="23.99"
                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm focus:border-[#00AEEF] focus:outline-none"
                      />
                    </div>

                    {/* القائمة المنسدلة للكاتيغوري المحدثة */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1">Category</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm focus:border-[#00AEEF] focus:outline-none"
                      >
                        <option value="Kits">Kits (Regular Season)</option>
                        <option value="Retro Kits">Retro Kits</option>
                        <option value="Special Orders">Special Orders (Pre-Order)</option>
                        <option value="Boots">Boots</option>
                        <option value="Equipment">Equipment</option>
                        <option value="Mystery Drop">Mystery Drop</option>
                      </select>
                    </div>

                    {/* القائمة المنسدلة للدوري */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1">League / Competition</label>
                      <select
                        value={newProduct.league}
                        onChange={(e) => setNewProduct({ ...newProduct, league: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm focus:border-[#00AEEF] focus:outline-none"
                      >
                        <option value="Premier League">1. Premier League</option>
                        <option value="La Liga">2. La Liga</option>
                        <option value="Serie A">3. Serie A</option>
                        <option value="Bundesliga">4. Bundesliga</option>
                        <option value="Ligue 1">5. Ligue 1</option>
                        <option value="Other / National">Other / National Teams</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-8">
                      <label className="block text-xs font-bold text-gray-400 mb-1">Image URL (Direct .jpg / .png)</label>
                      <input
                        type="url" value={newProduct.imageUrl}
                        onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm focus:border-[#00AEEF] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-xs font-bold text-gray-400 mb-1">Loyalty Points Earned</label>
                      <input
                        type="number" value={newProduct.loyalty_points_earned}
                        onChange={(e) => setNewProduct({ ...newProduct, loyalty_points_earned: Number(e.target.value) })}
                        placeholder="20"
                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm focus:border-[#00AEEF] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-[#00AEEF] hover:bg-blue-500 text-white font-extrabold py-3 px-8 rounded-xl transition shadow-md text-sm"
                  >
                    + Add Product to Store
                  </button>
                </form>

                {/* قائمة المنتجات في المتجر */}
                <div className="bg-[#121212] rounded-2xl border border-[#1f1f1f] overflow-hidden">
                  <div className="p-6 border-b border-[#222] flex justify-between items-center">
                    <h3 className="font-bold text-lg">All Store Products ({products.length})</h3>
                    <button onClick={fetchData} className="text-xs text-[#00AEEF] hover:underline flex items-center gap-1 font-bold">
                      <RefreshCw className="w-3 h-3" /> Refresh List
                    </button>
                  </div>

                  <div className="divide-y divide-[#1f1f1f] max-h-[600px] overflow-y-auto">
                    {products.map((p) => {
                      const img = Array.isArray(p.image_urls) && p.image_urls.length > 0 ? p.image_urls[0] : p.imageUrl;
                      return (
                        <div key={p.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#161616] transition">
                          <div className="flex items-center gap-4">
                            <img 
                              src={img || 'https://images.unsplash.com/photo-1583318433420-532155e9d9e4?q=80&w=500&auto=format&fit=crop'} 
                              alt="" 
                              className="w-14 h-14 rounded-lg object-cover bg-[#1a1a1a] border border-[#333]" 
                            />
                            <div>
                              <p className="font-bold text-sm text-white">{p.title}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#1f1f1f] text-[#00AEEF] border border-[#333]">
                                  {p.category || 'Kits'}
                                </span>
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#1f1f1f] text-gray-300 border border-[#333]">
                                  ⚽ {p.league || 'Premier League'}
                                </span>
                                <span className="text-[10px] font-bold text-amber-400">
                                  +{p.loyalty_points_earned || 20} PTS
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="font-black text-lg text-white">${p.price}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditingProduct(p)}
                                className="p-2 bg-[#1f1f1f] hover:bg-[#00AEEF] text-gray-300 hover:text-white rounded-lg transition"
                                title="Edit Product"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-2 bg-[#1f1f1f] hover:bg-red-600 text-gray-300 hover:text-white rounded-lg transition"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* 2. تبويب الطلبات */}
            {activeTab === 'orders' && (
              <div className="bg-[#121212] rounded-2xl border border-[#1f1f1f] overflow-hidden">
                <div className="p-6 border-b border-[#222] flex justify-between items-center">
                  <h3 className="font-bold text-lg">Customer Orders ({orders.length})</h3>
                  <button onClick={fetchData} className="text-xs text-[#00AEEF] hover:underline flex items-center gap-1 font-bold">
                    <RefreshCw className="w-3 h-3" /> Refresh Orders
                  </button>
                </div>

                <div className="divide-y divide-[#1f1f1f]">
                  {orders.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">No customer orders placed yet.</div>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="p-6 space-y-4 hover:bg-[#161616] transition">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                          <div>
                            <p className="font-mono text-xs text-gray-400">ORDER #{order.id}</p>
                            <h4 className="font-extrabold text-white text-base mt-0.5">
                              {order.first_name} {order.last_name} ({order.phone})
                            </h4>
                            <p className="text-xs text-gray-400 mt-1">{order.address}</p>
                            {order.notes && (
                              <p className="text-xs text-amber-400 mt-1 bg-amber-500/10 p-2 rounded border border-amber-500/30">
                                📝 Notes: {order.notes}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-4">
                            <span className={`text-xs px-3 py-1.5 rounded-full font-extrabold uppercase flex items-center gap-1.5 ${
                              order.status === 'Delivered' 
                                ? 'bg-green-950 text-green-400 border border-green-500/40' 
                                : 'bg-yellow-950 text-yellow-400 border border-yellow-500/40'
                            }`}>
                              {order.status === 'Delivered' ? <CheckCircle2 className="w-3.5 h-3.5"/> : <Clock className="w-3.5 h-3.5"/>}
                              {order.status}
                            </span>

                            {order.status !== 'Delivered' ? (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'Delivered')}
                                className="bg-green-600 hover:bg-green-500 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition shadow"
                              >
                                Mark Delivered ✅
                              </button>
                            ) : (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'Pending')}
                                className="bg-[#222] hover:bg-[#333] text-gray-400 hover:text-white text-xs font-bold px-3 py-2 rounded-lg border border-[#333] transition"
                              >
                                Revert to Pending
                              </button>
                            )}
                          </div>
                        </div>

                        {/* منتجات الطلب */}
                        <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#262626] space-y-1">
                          {Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-xs text-gray-300">
                              <span>{item.quantity}x {item.title}</span>
                              <span className="font-bold text-white">${item.price}</span>
                            </div>
                          ))}
                          <div className="border-t border-[#2d2d2d] pt-2 mt-2 flex justify-between items-center text-sm font-extrabold text-white">
                            <span>Total Paid (COD):</span>
                            <span className="text-[#00AEEF]">${order.total_amount}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 3. تبويب إعدادات الولاء */}
            {activeTab === 'loyalty' && (
              <div className="bg-[#121212] p-8 rounded-2xl border border-[#1f1f1f] max-w-xl space-y-6">
                <h3 className="font-bold text-xl border-b border-[#222] pb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-amber-400" /> Loyalty Program Settings
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      1 Loyalty Point Value (in USD)
                    </label>
                    <input
                      type="number" step="0.001"
                      value={pointValueUsd}
                      onChange={(e) => setPointValueUsd(Number(e.target.value))}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-white font-bold text-lg focus:border-[#00AEEF] focus:outline-none"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      💡 Example: Entering <code className="text-amber-400">0.05</code> means 100 points = $5.00 discount voucher.
                    </p>
                  </div>

                  <button
                    onClick={handleSaveLoyaltySettings}
                    className="w-full bg-[#00AEEF] hover:bg-blue-500 text-white font-extrabold py-4 rounded-xl transition shadow-lg"
                  >
                    Save Loyalty Settings
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* نافذة التعديل المنبثقة (Edit Modal) */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#121212] border border-[#222] rounded-2xl p-6 max-w-lg w-full space-y-4 relative shadow-2xl">
              <button
                onClick={() => setEditingProduct(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-extrabold text-xl border-b border-[#222] pb-3">Edit Product Details</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={editingProduct.title || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Price ($ USD)</label>
                    <input
                      type="number" step="0.01"
                      value={editingProduct.price || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Loyalty Points Earned</label>
                    <input
                      type="number"
                      value={editingProduct.loyalty_points_earned || 20}
                      onChange={(e) => setEditingProduct({ ...editingProduct, loyalty_points_earned: Number(e.target.value) })}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm"
                    />
                  </div>
                </div>

                {/* القوائم المنسدلة الجديدة في المودال */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Category</label>
                    <select
                      value={editingProduct.category || 'Kits'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm"
                    >
                      <option value="Kits">Kits (Regular Season)</option>
                      <option value="Retro Kits">Retro Kits</option>
                      <option value="Special Orders">Special Orders (Pre-Order)</option>
                      <option value="Boots">Boots</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Mystery Drop">Mystery Drop</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">League / Competition</label>
                    <select
                      value={editingProduct.league || 'Premier League'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, league: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm"
                    >
                      <option value="Premier League">1. Premier League</option>
                      <option value="La Liga">2. La Liga</option>
                      <option value="Serie A">3. Serie A</option>
                      <option value="Bundesliga">4. Bundesliga</option>
                      <option value="Ligue 1">5. Ligue 1</option>
                      <option value="Other / National">Other / National Teams</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Image URL (.jpg / .png)</label>
                  <input
                    type="url"
                    value={editingProduct.imageUrl || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 bg-[#1a1a1a] hover:bg-[#222] text-gray-300 py-3 rounded-xl font-bold text-sm border border-[#333] transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditProduct}
                  className="flex-1 bg-[#00AEEF] hover:bg-blue-500 text-white py-3 rounded-xl font-extrabold text-sm transition shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}