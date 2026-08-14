"use client";

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';
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
  Tag,
  Power,
  PowerOff
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'loyalty' | 'promos'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // إعدادات الرفع عبر الإكسل
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // فورم إضافة كود خصم جديد
  const [newPromo, setNewPromo] = useState({
    code: '',
    description: ''
  });

  // جلب البيانات الأساسية عند التحميل
  const fetchData = async () => {
    setLoading(true);

    // 1. جلب المنتجات
    const { data: productsData } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (productsData) setProducts(productsData);

    // 2. جلب الطلبات
    const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (ordersData) setOrders(ordersData);

    // 3. جلب إعدادات الولاء
    const { data: storeSettings } = await supabase.from('store_settings').select('loyalty_point_value_usd').eq('id', 1).single();
    if (storeSettings && storeSettings.loyalty_point_value_usd) {
      setPointValueUsd(Number(storeSettings.loyalty_point_value_usd));
    }

    // 4. جلب أكواد الخصم
    const { data: promoData } = await supabase.from('promo_codes').select('*').order('id', { ascending: false });
    if (promoData) setPromos(promoData);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- ميزة إضافة منتج واحد ---
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price) return alert("⚠️ يرجى إدخال عنوان المنتج وسعره على الأقل!");

    const { error } = await supabase.from('products').insert([{
      title: newProduct.title,
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      league: newProduct.league,
      image_url: newProduct.imageUrl || 'https://images.unsplash.com/photo-1583318433420-532155e9d9e4?q=80&w=500&auto=format&fit=crop',
      image_urls: newProduct.imageUrl ? [newProduct.imageUrl] : [],
      loyalty_points_earned: Number(newProduct.loyalty_points_earned) || 20
    }]);

    if (!error) {
      alert("✅ تم إضافة المنتج بنجاح!");
      setNewProduct({ title: '', price: '', category: 'Kits', league: 'Premier League', imageUrl: '', loyalty_points_earned: 20 });
      fetchData();
    } else alert("🚨 خطأ أثناء الإضافة: " + error.message);
  };

  // --- ميزة رفع المنتجات بالجملة عبر Excel ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          alert("⚠️ The Excel file is empty.");
          setIsUploading(false);
          return;
        }

        const formattedProducts = jsonData.map((row: any) => ({
          title: row.Title || row.title || 'Unnamed Product',
          price: parseFloat(row.Price || row.price) || 0,
          category: row.Category || row.category || 'Kits',
          league: row.League || row.league || '',
          image_url: row.ImageUrl || row.image_url || row.image || 'https://images.unsplash.com/photo-1583318433420-532155e9d9e4?q=80&w=800',
          image_urls: row.ImageUrl || row.image_url || row.image ? [row.ImageUrl || row.image_url || row.image] : [],
          loyalty_points_earned: parseInt(row.Points || row.points || row.loyalty_points_earned) || 20
        }));

        const { error } = await supabase.from('products').insert(formattedProducts);
        if (error) throw error;

        alert(`✅ Successfully added ${formattedProducts.length} products from Excel!`);
        fetchData();
      } catch (error: any) {
        alert("❌ Error uploading Excel: " + error.message);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // --- حفظ التعديلات على منتج موجود ---
  const handleSaveEditProduct = async () => {
    if (!editingProduct) return;
    const { error } = await supabase.from('products').update({
      title: editingProduct.title,
      price: parseFloat(editingProduct.price),
      category: editingProduct.category,
      league: editingProduct.league,
      image_url: editingProduct.imageUrl,
      image_urls: editingProduct.imageUrl ? [editingProduct.imageUrl] : editingProduct.image_urls,
      loyalty_points_earned: Number(editingProduct.loyalty_points_earned) || 20
    }).eq('id', editingProduct.id);

    if (!error) {
      alert("✅ تم تحديث بيانات المنتج بنجاح!");
      setEditingProduct(null);
      fetchData();
    } else alert("🚨 خطأ أثناء التحديث: " + error.message);
  };

  // --- حذف منتج ---
  const handleDeleteProduct = async (id: number | string) => {
    if (!confirm("❓ هل أنت متأكد من رغبتك في حذف هذا المنتج؟")) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) fetchData();
    else alert("🚨 خطأ أثناء الحذف: " + error.message);
  };

  // --- تحديث حالة الطلب والنقاط ---
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single();

    if (newStatus === 'Delivered' && order && order.user_id && !order.points_awarded) {
      const pointsToAdd = Number(order.points_earned) > 0 ? Number(order.points_earned) : 20;
      const { data: profile } = await supabase.from('profiles').select('loyalty_points').eq('id', order.user_id).single();

      let currentPoints = profile ? Number(profile.loyalty_points) || 0 : 0;
      if (!profile) await supabase.from('profiles').insert([{ id: order.user_id, full_name: `${order.first_name || ''} ${order.last_name || ''}`.trim() || 'Customer', loyalty_points: 0, role: 'customer' }]);

      const newPointsTotal = currentPoints + pointsToAdd;
      const { error: updateError } = await supabase.from('profiles').update({ loyalty_points: newPointsTotal }).eq('id', order.user_id);

      if (!updateError) {
        await supabase.from('orders').update({ status: newStatus, points_awarded: true, points_earned: pointsToAdd }).eq('id', orderId);
        alert(`✅ تم تسليم الطلب وإضافة +${pointsToAdd} نقطة!`);
      } else alert("🚨 حدث خطأ في تحديث النقاط: " + updateError.message);
    } else {
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    }
    fetchData();
  };

  // --- حفظ إعدادات الولاء ---
  const handleSaveLoyaltySettings = async () => {
    const { error } = await supabase.from('store_settings').upsert([{ id: 1, loyalty_point_value_usd: pointValueUsd }]);
    if (!error) alert("✅ تم حفظ سعر صرف النقاط بنجاح!");
    else alert("🚨 حدث خطأ أثناء حفظ الإعدادات: " + error.message);
  };

  // --- إضافة كود خصم جديد ---
  const handleAddPromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromo.code) return;
    
    const { error } = await supabase.from('promo_codes').insert([{
      code: newPromo.code.toUpperCase().replace(/\s/g, ''),
      description: newPromo.description
    }]);

    if (!error) {
      alert("✅ تم إضافة كود الخصم بنجاح!");
      setNewPromo({ code: '', description: '' });
      fetchData();
    } else alert("🚨 خطأ أثناء الإضافة: هذا الكود قد يكون موجوداً مسبقاً.");
  };

  // --- تغيير حالة وتفعيل/تعطيل الكود ---
  const togglePromoStatus = async (id: number, currentStatus: boolean) => {
    await supabase.from('promo_codes').update({ is_active: !currentStatus }).eq('id', id);
    fetchData();
  };

  // --- حذف كود خصم ---
  const handleDeletePromo = async (id: number) => {
    if (!confirm("❓ هل أنت متأكد من حذف كود الخصم هذا؟")) return;
    await supabase.from('promo_codes').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen py-10 text-white">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* الترويسة والتبويبات */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-[#1f1f1f] pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight">
              ADMIN <span className="text-[#00AEEF]">DASHBOARD</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Football District Control Center</p>
          </div>

          <div className="flex flex-wrap bg-[#121212] p-1.5 rounded-xl border border-[#222] gap-2">
            <button onClick={() => setActiveTab('products')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === 'products' ? 'bg-[#00AEEF] text-white' : 'text-gray-400 hover:text-white'}`}>
              <Package className="w-4 h-4" /> Products
            </button>
            <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === 'orders' ? 'bg-[#00AEEF] text-white' : 'text-gray-400 hover:text-white'}`}>
              <ShoppingBag className="w-4 h-4" /> Orders
            </button>
            <button onClick={() => setActiveTab('promos')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === 'promos' ? 'bg-[#00AEEF] text-white' : 'text-gray-400 hover:text-white'}`}>
              <Tag className="w-4 h-4" /> Promos
            </button>
            <button onClick={() => setActiveTab('loyalty')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === 'loyalty' ? 'bg-[#00AEEF] text-white' : 'text-gray-400 hover:text-white'}`}>
              <Award className="w-4 h-4" /> Loyalty
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading Dashboard Data...</div>
        ) : (
          <>
            {/* ======================================================== */}
            {/* 1. تبويب المنتجات */}
            {/* ======================================================== */}
            {activeTab === 'products' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* فورم إضافة منتج */}
                  <form onSubmit={handleAddProduct} className="bg-[#121212] p-6 rounded-2xl border border-[#1f1f1f] space-y-4">
                    <h3 className="font-bold text-lg border-b border-[#222] pb-3 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-[#00AEEF]" /> Add Single Product
                    </h3>
                    <input type="text" required value={newProduct.title} onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })} placeholder="Title (e.g. Arsenal Home)" className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm focus:border-[#00AEEF]" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="number" step="0.01" required value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="Price ($)" className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm focus:border-[#00AEEF]" />
                      <input type="number" value={newProduct.loyalty_points_earned} onChange={(e) => setNewProduct({ ...newProduct, loyalty_points_earned: Number(e.target.value) })} placeholder="Points (e.g. 20)" className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm focus:border-[#00AEEF]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm focus:border-[#00AEEF]">
                        <option value="Kits">Kits</option>
                        <option value="Retro Kits">Retro Kits</option>
                        <option value="Kids">Kids</option>
                        <option value="Special Orders">Special Orders</option>
                        <option value="Boots">Boots</option>
                        <option value="Equipment">Equipment</option>
                        <option value="Mystery Drop">Mystery Drop</option>
                      </select>
                      <select value={newProduct.league} onChange={(e) => setNewProduct({ ...newProduct, league: e.target.value })} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm focus:border-[#00AEEF]">
                        <option value="Premier League">Premier League</option>
                        <option value="La Liga">La Liga</option>
                        <option value="Serie A">Serie A</option>
                        <option value="Bundesliga">Bundesliga</option>
                        <option value="Ligue 1">Ligue 1</option>
                        <option value="Other / National">Other / National</option>
                      </select>
                    </div>
                    <input type="url" value={newProduct.imageUrl} onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })} placeholder="Image URL" className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm focus:border-[#00AEEF]" />
                    <button type="submit" className="w-full bg-[#00AEEF] hover:bg-blue-500 text-white font-extrabold py-3 rounded-xl transition">+ Add Product</button>
                  </form>

                  {/* الرفع عبر الإكسل */}
                  <div className="bg-[#121212] p-6 rounded-2xl border border-[#1f1f1f] flex flex-col justify-center items-center text-center">
                    <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><Upload className="w-5 h-5 text-[#00AEEF]" /> Bulk Upload via Excel</h2>
                    <p className="text-gray-400 text-xs mb-6 max-w-sm leading-relaxed">
                      Upload an Excel (.xlsx) or CSV file. Columns must include:<br/> 
                      <strong className="text-white">Title, Price, Category, League, ImageUrl, Points</strong>
                    </p>
                    <input type="file" accept=".xlsx, .xls, .csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className={`w-full py-5 border-2 border-dashed rounded-2xl font-bold transition flex items-center justify-center gap-3 ${isUploading ? 'border-gray-600 text-gray-500' : 'border-[#00AEEF] text-[#00AEEF] hover:bg-[#00AEEF]/10'}`}>
                      {isUploading ? <>Processing File...</> : <><Upload className="w-5 h-5" /> Select Excel File</>}
                    </button>
                  </div>
                </div>

                {/* قائمة المنتجات */}
                <div className="bg-[#121212] rounded-2xl border border-[#1f1f1f] overflow-hidden">
                  <div className="p-6 border-b border-[#222] flex justify-between items-center">
                    <h3 className="font-bold text-lg">Store Inventory ({products.length})</h3>
                    <button onClick={fetchData} className="text-xs text-[#00AEEF] hover:underline flex items-center gap-1 font-bold"><RefreshCw className="w-3 h-3" /> Refresh List</button>
                  </div>
                  <div className="divide-y divide-[#1f1f1f] max-h-[600px] overflow-y-auto">
                    {products.map((p) => {
                      const img = Array.isArray(p.image_urls) && p.image_urls.length > 0 ? p.image_urls[0] : p.imageUrl || p.image_url;
                      return (
                        <div key={p.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#161616] transition">
                          <div className="flex items-center gap-4">
                            <img src={img || 'https://images.unsplash.com/photo-1583318433420-532155e9d9e4?q=80&w=500&auto=format&fit=crop'} alt="" className="w-14 h-14 rounded-lg object-cover bg-[#1a1a1a] border border-[#333]" />
                            <div>
                              <p className="font-bold text-sm text-white">{p.title}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#1f1f1f] text-[#00AEEF] border border-[#333]">{p.category || 'Kits'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-black text-lg text-white">${p.price}</span>
                            <div className="flex items-center gap-2">
                              <button onClick={() => setEditingProduct({ ...p, imageUrl: img })} className="p-2 bg-[#1f1f1f] hover:bg-[#00AEEF] text-gray-300 hover:text-white rounded-lg transition"><Edit3 className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteProduct(p.id)} className="p-2 bg-[#1f1f1f] hover:bg-red-600 text-gray-300 hover:text-white rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 2. تبويب الطلبات (مع إضافة البرومو كود) */}
            {/* ======================================================== */}
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
                            <h4 className="font-extrabold text-white text-base mt-0.5">{order.first_name} {order.last_name} ({order.phone})</h4>
                            <p className="text-xs text-gray-400 mt-1">{order.address}</p>
                            
                            {/* إظهار كود الخصم إذا تم استخدامه */}
                            {order.promo_code && (
                              <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded-lg">
                                <Tag className="w-3.5 h-3.5" /> Promo Used: {order.promo_code}
                              </div>
                            )}

                            {order.notes && <p className="text-xs text-amber-400 mt-2 bg-amber-500/10 p-2 rounded border border-amber-500/30">📝 Notes: {order.notes}</p>}
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`text-xs px-3 py-1.5 rounded-full font-extrabold uppercase flex items-center gap-1.5 ${order.status === 'Delivered' ? 'bg-green-950 text-green-400 border border-green-500/40' : 'bg-yellow-950 text-yellow-400 border border-yellow-500/40'}`}>
                              {order.status === 'Delivered' ? <CheckCircle2 className="w-3.5 h-3.5"/> : <Clock className="w-3.5 h-3.5"/>} {order.status}
                            </span>
                            {order.status !== 'Delivered' ? (
                              <button onClick={() => updateOrderStatus(order.id, 'Delivered')} className="bg-green-600 hover:bg-green-500 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition shadow">Mark Delivered ✅</button>
                            ) : (
                              <button onClick={() => updateOrderStatus(order.id, 'Pending')} className="bg-[#222] hover:bg-[#333] text-gray-400 hover:text-white text-xs font-bold px-3 py-2 rounded-lg border border-[#333] transition">Revert to Pending</button>
                            )}
                          </div>
                        </div>
                        <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#262626] space-y-1">
                          {Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-xs text-gray-300">
                              <span>{item.quantity}x {item.title}</span><span className="font-bold text-white">${item.price}</span>
                            </div>
                          ))}
                          <div className="border-t border-[#2d2d2d] pt-2 mt-2 flex justify-between items-center text-sm font-extrabold text-white">
                            <span>Total Paid (COD):</span><span className="text-[#00AEEF]">${order.total_amount}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 3. تبويب أكواد الخصم (Promo Codes) - الميزة الجديدة */}
            {/* ======================================================== */}
            {activeTab === 'promos' && (
              <div className="space-y-8">
                {/* فورم إضافة كود خصم */}
                <form onSubmit={handleAddPromoCode} className="bg-[#121212] p-6 rounded-2xl border border-[#1f1f1f] max-w-2xl space-y-4">
                  <h3 className="font-bold text-lg border-b border-[#222] pb-3 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-[#00AEEF]" /> Create New Promo Code
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1">Promo Code (No spaces)</label>
                      <input type="text" required value={newPromo.code} onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })} placeholder="e.g. SUMMER20" className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm focus:border-[#00AEEF] tracking-widest font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1">Short Description (Internal)</label>
                      <input type="text" value={newPromo.description} onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })} placeholder="e.g. 20% Off all kits" className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm focus:border-[#00AEEF]" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-[#00AEEF] hover:bg-blue-500 text-white font-extrabold py-3 rounded-xl transition shadow-lg">
                    + Add Promo Code
                  </button>
                </form>

                {/* قائمة أكواد الخصم الحالية */}
                <div className="bg-[#121212] rounded-2xl border border-[#1f1f1f] overflow-hidden">
                  <div className="p-6 border-b border-[#222] flex justify-between items-center">
                    <h3 className="font-bold text-lg">Active Promo Codes ({promos.length})</h3>
                  </div>
                  <div className="divide-y divide-[#1f1f1f]">
                    {promos.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">No promo codes created yet.</div>
                    ) : (
                      promos.map((promo) => (
                        <div key={promo.id} className="p-5 flex items-center justify-between gap-4 hover:bg-[#161616] transition">
                          <div>
                            <span className="font-mono text-lg font-black text-[#00AEEF] tracking-widest">{promo.code}</span>
                            <p className="text-xs text-gray-400 mt-1">{promo.description || 'No description provided'}</p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-1 rounded border ${promo.is_active ? 'bg-green-950/40 text-green-400 border-green-500/30' : 'bg-red-950/40 text-red-400 border-red-500/30'}`}>
                              {promo.is_active ? 'Active' : 'Disabled'}
                            </span>
                            
                            <button onClick={() => togglePromoStatus(promo.id, promo.is_active)} className={`p-2 rounded-lg transition ${promo.is_active ? 'bg-[#1a1a1a] hover:bg-yellow-600 text-gray-300 hover:text-white' : 'bg-[#1a1a1a] hover:bg-green-600 text-gray-300 hover:text-white'}`} title={promo.is_active ? "Disable Code" : "Enable Code"}>
                              {promo.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                            </button>
                            
                            <button onClick={() => handleDeletePromo(promo.id)} className="p-2 bg-[#1a1a1a] hover:bg-red-600 text-gray-300 hover:text-white rounded-lg transition" title="Delete Code">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 4. تبويب إعدادات الولاء */}
            {/* ======================================================== */}
            {activeTab === 'loyalty' && (
              <div className="bg-[#121212] p-8 rounded-2xl border border-[#1f1f1f] max-w-xl space-y-6">
                <h3 className="font-bold text-xl border-b border-[#222] pb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-amber-400" /> Loyalty Program Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">1 Loyalty Point Value (in USD)</label>
                    <input type="number" step="0.001" value={pointValueUsd} onChange={(e) => setPointValueUsd(Number(e.target.value))} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-white font-bold text-lg focus:border-[#00AEEF] focus:outline-none" />
                    <p className="text-xs text-gray-400 mt-2">💡 Example: Entering <code className="text-amber-400">0.05</code> means 100 points = $5.00 discount voucher.</p>
                  </div>
                  <button onClick={handleSaveLoyaltySettings} className="w-full bg-[#00AEEF] hover:bg-blue-500 text-white font-extrabold py-4 rounded-xl transition shadow-lg">Save Loyalty Settings</button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ======================================================== */}
        {/* نافذة التعديل المنبثقة (Edit Modal) للمنتجات */}
        {/* ======================================================== */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#121212] border border-[#222] rounded-2xl p-6 max-w-lg w-full space-y-4 relative shadow-2xl">
              <button onClick={() => setEditingProduct(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              <h3 className="font-extrabold text-xl border-b border-[#222] pb-3">Edit Product Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Title</label>
                  <input type="text" value={editingProduct.title || ''} onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Price ($ USD)</label>
                    <input type="number" step="0.01" value={editingProduct.price || ''} onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Points Earned</label>
                    <input type="number" value={editingProduct.loyalty_points_earned || 20} onChange={(e) => setEditingProduct({ ...editingProduct, loyalty_points_earned: Number(e.target.value) })} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Category</label>
                    <select value={editingProduct.category || 'Kits'} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm">
                      <option value="Kits">Kits</option>
                      <option value="Retro Kits">Retro Kits</option>
                      <option value="Kids">Kids</option>
                      <option value="Special Orders">Special Orders</option>
                      <option value="Boots">Boots</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Mystery Drop">Mystery Drop</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">League / Competition</label>
                    <select value={editingProduct.league || 'Premier League'} onChange={(e) => setEditingProduct({ ...editingProduct, league: e.target.value })} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm">
                      <option value="Premier League">Premier League</option>
                      <option value="La Liga">La Liga</option>
                      <option value="Serie A">Serie A</option>
                      <option value="Bundesliga">Bundesliga</option>
                      <option value="Ligue 1">Ligue 1</option>
                      <option value="Other / National">Other / National</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Image URL (.jpg / .png)</label>
                  <input type="url" value={editingProduct.imageUrl || ''} onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm" />
                </div>
              </div>
              <div className="flex gap-3 pt-3 border-t border-[#222]">
                <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 bg-[#1a1a1a] hover:bg-[#222] text-gray-300 py-3 rounded-xl font-bold text-sm border border-[#333] transition">Cancel</button>
                <button type="button" onClick={handleSaveEditProduct} className="flex-1 bg-[#00AEEF] hover:bg-blue-500 text-white py-3 rounded-xl font-extrabold text-sm transition shadow-lg">Save Changes</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}