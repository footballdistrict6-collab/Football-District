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
  PowerOff,
  Percent
} from 'lucide-react';

const STORE_CATEGORIES = ['Kits', 'Retro Kits', 'Kids', 'Special Orders', 'Boots', 'Equipment', 'Mystery Drop'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'loyalty' | 'promos'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pointValueUsd, setPointValueUsd] = useState<number>(0.05);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const [newProduct, setNewProduct] = useState({
    title: '', price: '', category: 'Kits', league: 'Premier League', imageUrl: '', loyalty_points_earned: 20
  });

  // فورم البرومو كود المحدث (الذكي)
  const [newPromo, setNewPromo] = useState({
    code: '',
    description: '',
    discount_type: 'percentage', // percentage, fixed, bogo_50, b2g1_free
    discount_value: 0,
    target_categories: [] as string[]
  });

  const fetchData = async () => {
    setLoading(true);
    const { data: productsData } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (productsData) setProducts(productsData);

    const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (ordersData) setOrders(ordersData);

    const { data: storeSettings } = await supabase.from('store_settings').select('loyalty_point_value_usd').eq('id', 1).single();
    if (storeSettings && storeSettings.loyalty_point_value_usd) setPointValueUsd(Number(storeSettings.loyalty_point_value_usd));

    const { data: promoData } = await supabase.from('promo_codes').select('*').order('id', { ascending: false });
    if (promoData) setPromos(promoData);

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // --- دوال المنتجات والإكسل ---
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price) return alert("⚠️ يرجى إدخال عنوان المنتج وسعره!");
    const { error } = await supabase.from('products').insert([{
      title: newProduct.title, price: parseFloat(newProduct.price), category: newProduct.category, league: newProduct.league,
      image_url: newProduct.imageUrl || 'https://images.unsplash.com/photo-1583318433420-532155e9d9e4?q=80&w=500',
      image_urls: newProduct.imageUrl ? [newProduct.imageUrl] : [], loyalty_points_earned: Number(newProduct.loyalty_points_earned) || 20
    }]);
    if (!error) {
      alert("✅ تم إضافة المنتج بنجاح!");
      setNewProduct({ title: '', price: '', category: 'Kits', league: 'Premier League', imageUrl: '', loyalty_points_earned: 20 });
      fetchData();
    } else alert("🚨 خطأ أثناء الإضافة: " + error.message);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        if (jsonData.length === 0) return alert("⚠️ The Excel file is empty.");

        const formattedProducts = jsonData.map((row: any) => ({
          title: row.Title || row.title || 'Unnamed', price: parseFloat(row.Price || row.price) || 0,
          category: row.Category || row.category || 'Kits', league: row.League || row.league || '',
          image_url: row.ImageUrl || row.image_url || 'https://images.unsplash.com/photo-1583318433420-532155e9d9e4',
          image_urls: row.ImageUrl || row.image_url ? [row.ImageUrl || row.image_url] : [],
          loyalty_points_earned: parseInt(row.Points || row.loyalty_points_earned) || 20
        }));

        const { error } = await supabase.from('products').insert(formattedProducts);
        if (error) throw error;
        alert(`✅ Successfully added ${formattedProducts.length} products!`);
        fetchData();
      } catch (error: any) { alert("❌ Error: " + error.message); } 
      finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSaveEditProduct = async () => {
    if (!editingProduct) return;
    const { error } = await supabase.from('products').update({
      title: editingProduct.title, price: parseFloat(editingProduct.price), category: editingProduct.category,
      league: editingProduct.league, image_url: editingProduct.imageUrl,
      image_urls: editingProduct.imageUrl ? [editingProduct.imageUrl] : editingProduct.image_urls,
      loyalty_points_earned: Number(editingProduct.loyalty_points_earned) || 20
    }).eq('id', editingProduct.id);
    if (!error) { alert("✅ تم التحديث!"); setEditingProduct(null); fetchData(); }
  };

  const handleDeleteProduct = async (id: number | string) => {
    if (!confirm("❓ هل أنت متأكد من الحذف؟")) return;
    await supabase.from('products').delete().eq('id', id);
    fetchData();
  };

  // --- دوال الطلبات والولاء ---
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single();
    if (newStatus === 'Delivered' && order && order.user_id && !order.points_awarded) {
      const pts = Number(order.points_earned) > 0 ? Number(order.points_earned) : 20;
      const { data: profile } = await supabase.from('profiles').select('loyalty_points').eq('id', order.user_id).single();
      let currentPts = profile ? Number(profile.loyalty_points) || 0 : 0;
      if (!profile) await supabase.from('profiles').insert([{ id: order.user_id, full_name: `${order.first_name || ''} ${order.last_name || ''}`.trim(), loyalty_points: 0, role: 'customer' }]);
      await supabase.from('profiles').update({ loyalty_points: currentPts + pts }).eq('id', order.user_id);
      await supabase.from('orders').update({ status: newStatus, points_awarded: true, points_earned: pts }).eq('id', orderId);
    } else {
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    }
    fetchData();
  };

  const handleSaveLoyaltySettings = async () => {
    await supabase.from('store_settings').upsert([{ id: 1, loyalty_point_value_usd: pointValueUsd }]);
    alert("✅ تم الحفظ!");
  };

  // --- دوال البرومو كود الجديدة ---
  const toggleCategoryForPromo = (category: string) => {
    const isSelected = newPromo.target_categories.includes(category);
    if (isSelected) {
      setNewPromo({ ...newPromo, target_categories: newPromo.target_categories.filter(c => c !== category) });
    } else {
      setNewPromo({ ...newPromo, target_categories: [...newPromo.target_categories, category] });
    }
  };

  const handleAddPromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromo.code) return;
    
    // إذا لم يحدد أي فئة، نعتبره متاحاً لكل الفئات
    const finalCategories = newPromo.target_categories.length > 0 ? newPromo.target_categories : STORE_CATEGORIES;

    const { error } = await supabase.from('promo_codes').insert([{
      code: newPromo.code.toUpperCase().replace(/\s/g, ''),
      description: newPromo.description,
      discount_type: newPromo.discount_type,
      discount_value: Number(newPromo.discount_value),
      target_categories: finalCategories
    }]);

    if (!error) {
      alert("✅ تم إنشاء العرض بنجاح!");
      setNewPromo({ code: '', description: '', discount_type: 'percentage', discount_value: 0, target_categories: [] });
      fetchData();
    } else alert("🚨 خطأ: الكود قد يكون موجوداً مسبقاً.");
  };

  const togglePromoStatus = async (id: number, currentStatus: boolean) => {
    await supabase.from('promo_codes').update({ is_active: !currentStatus }).eq('id', id);
    fetchData();
  };

  const handleDeletePromo = async (id: number) => {
    if (!confirm("❓ متأكد من حذف العرض؟")) return;
    await supabase.from('promo_codes').delete().eq('id', id);
    fetchData();
  };

  // مساعد لترجمة نوع العرض للعرض في الجدول
  const getPromoTypeBadge = (type: string, value: number) => {
    switch (type) {
      case 'percentage': return <span className="text-blue-400 bg-blue-900/30 px-2 py-1 rounded text-xs border border-blue-500/30">{value}% OFF</span>;
      case 'fixed': return <span className="text-green-400 bg-green-900/30 px-2 py-1 rounded text-xs border border-green-500/30">${value} OFF</span>;
      case 'bogo_50': return <span className="text-amber-400 bg-amber-900/30 px-2 py-1 rounded text-xs border border-amber-500/30">Buy 1 Get 1 50%</span>;
      case 'b2g1_free': return <span className="text-purple-400 bg-purple-900/30 px-2 py-1 rounded text-xs border border-purple-500/30">Buy 2 Get 1 FREE</span>;
      default: return <span className="text-gray-400">Discount</span>;
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
          <div className="flex flex-wrap bg-[#121212] p-1.5 rounded-xl border border-[#222] gap-2">
            <button onClick={() => setActiveTab('products')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === 'products' ? 'bg-[#00AEEF] text-white' : 'text-gray-400 hover:text-white'}`}><Package className="w-4 h-4" /> Products</button>
            <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === 'orders' ? 'bg-[#00AEEF] text-white' : 'text-gray-400 hover:text-white'}`}><ShoppingBag className="w-4 h-4" /> Orders</button>
            <button onClick={() => setActiveTab('promos')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === 'promos' ? 'bg-[#00AEEF] text-white' : 'text-gray-400 hover:text-white'}`}><Tag className="w-4 h-4" /> Promos</button>
            <button onClick={() => setActiveTab('loyalty')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === 'loyalty' ? 'bg-[#00AEEF] text-white' : 'text-gray-400 hover:text-white'}`}><Award className="w-4 h-4" /> Loyalty</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading Dashboard Data...</div>
        ) : (
          <>
            {/* 1. تبويب المنتجات والإكسل */}
            {activeTab === 'products' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* ... فورم المنتجات والإكسل (نفس السابق تماماً) ... */}
                  <form onSubmit={handleAddProduct} className="bg-[#121212] p-6 rounded-2xl border border-[#1f1f1f] space-y-4">
                    <h3 className="font-bold text-lg border-b border-[#222] pb-3 flex items-center gap-2"><Plus className="w-5 h-5 text-[#00AEEF]" /> Add Single Product</h3>
                    <input type="text" required value={newProduct.title} onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })} placeholder="Title (e.g. Arsenal Home)" className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm focus:border-[#00AEEF]" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="number" step="0.01" required value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="Price ($)" className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm focus:border-[#00AEEF]" />
                      <input type="number" value={newProduct.loyalty_points_earned} onChange={(e) => setNewProduct({ ...newProduct, loyalty_points_earned: Number(e.target.value) })} placeholder="Points (e.g. 20)" className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm focus:border-[#00AEEF]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm focus:border-[#00AEEF]">
                        {STORE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
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

                  <div className="bg-[#121212] p-6 rounded-2xl border border-[#1f1f1f] flex flex-col justify-center items-center text-center">
                    <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><Upload className="w-5 h-5 text-[#00AEEF]" /> Bulk Upload via Excel</h2>
                    <p className="text-gray-400 text-xs mb-6 max-w-sm leading-relaxed">Upload an Excel (.xlsx) or CSV file. Columns must include:<br/> <strong className="text-white">Title, Price, Category, League, ImageUrl, Points</strong></p>
                    <input type="file" accept=".xlsx, .xls, .csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className={`w-full py-5 border-2 border-dashed rounded-2xl font-bold transition flex items-center justify-center gap-3 ${isUploading ? 'border-gray-600 text-gray-500' : 'border-[#00AEEF] text-[#00AEEF] hover:bg-[#00AEEF]/10'}`}>
                      {isUploading ? <>Processing File...</> : <><Upload className="w-5 h-5" /> Select Excel File</>}
                    </button>
                  </div>
                </div>

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
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#1f1f1f] text-[#00AEEF] border border-[#333]">{p.category || 'Kits'}</span>
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

            {/* 2. تبويب الطلبات (كما هو) */}
            {activeTab === 'orders' && (
               <div className="bg-[#121212] rounded-2xl border border-[#1f1f1f] overflow-hidden">
                {/* ... نفس كود الطلبات الذي وضعناه سابقاً ... */}
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

            {/* 3. تبويب الأكواد الذكية (Promos) */}
            {activeTab === 'promos' && (
              <div className="space-y-8 animate-fadeIn">
                <form onSubmit={handleAddPromoCode} className="bg-[#121212] p-8 rounded-2xl border border-[#1f1f1f] shadow-xl max-w-4xl space-y-6">
                  <h3 className="font-bold text-xl border-b border-[#222] pb-4 flex items-center gap-2">
                    <Tag className="w-6 h-6 text-[#00AEEF]" /> Create Advanced Smart Offer
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Promo Code (e.g. SUMMER20)</label>
                      <input type="text" required value={newPromo.code} onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3.5 text-white focus:border-[#00AEEF] tracking-widest font-mono" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Description (Internal Note)</label>
                      <input type="text" value={newPromo.description} onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3.5 text-white focus:border-[#00AEEF]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-[#161616] rounded-xl border border-[#2b2b2b]">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Offer Type (كيف سيعمل العرض؟)</label>
                      <select value={newPromo.discount_type} onChange={(e) => setNewPromo({ ...newPromo, discount_type: e.target.value })} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3.5 text-white focus:border-[#00AEEF]">
                        <option value="percentage">Discount Percentage (%) - خصم نسبة مئوية</option>
                        <option value="fixed">Fixed Amount ($) - خصم مبلغ ثابت</option>
                        <option value="bogo_50">Buy 1 Get 1 50% OFF - اشتر 1 والثاني بنصف السعر</option>
                        <option value="b2g1_free">Buy 2 Get 1 FREE - اشتر 2 والثالث مجاناً</option>
                      </select>
                    </div>

                    {(newPromo.discount_type === 'percentage' || newPromo.discount_type === 'fixed') && (
                      <div className="animate-in fade-in zoom-in">
                        <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-1">
                          <Percent className="w-4 h-4 text-amber-400" /> 
                          {newPromo.discount_type === 'percentage' ? 'Discount Percentage (e.g. 20 for 20%)' : 'Discount Amount (e.g. 15 for $15)'}
                        </label>
                        <input type="number" required value={newPromo.discount_value} onChange={(e) => setNewPromo({ ...newPromo, discount_value: Number(e.target.value) })} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3.5 text-white focus:border-[#00AEEF]" />
                      </div>
                    )}
                  </div>

                  <div className="p-5 bg-[#161616] rounded-xl border border-[#2b2b2b]">
                    <label className="block text-sm font-bold text-gray-300 mb-3">Target Categories (على أي فئات يعمل هذا العرض؟)</label>
                    <p className="text-xs text-gray-500 mb-4">If none selected, it applies to ALL categories.</p>
                    <div className="flex flex-wrap gap-3">
                      {STORE_CATEGORIES.map(cat => (
                        <label key={cat} className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-bold border transition flex items-center gap-2 ${newPromo.target_categories.includes(cat) ? 'bg-[#00AEEF]/20 border-[#00AEEF] text-[#00AEEF]' : 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:border-gray-500'}`}>
                          <input type="checkbox" className="hidden" checked={newPromo.target_categories.includes(cat)} onChange={() => toggleCategoryForPromo(cat)} />
                          {newPromo.target_categories.includes(cat) && <CheckCircle2 className="w-4 h-4" />}
                          {cat}
                        </label>
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-[#00AEEF] hover:bg-blue-500 text-white font-extrabold py-4 rounded-xl transition shadow-lg text-lg">
                    + Launch Promo Campaign
                  </button>
                </form>

                <div className="bg-[#121212] rounded-2xl border border-[#1f1f1f] overflow-hidden">
                  <div className="p-6 border-b border-[#222] flex justify-between items-center">
                    <h3 className="font-bold text-lg">Active Campaigns ({promos.length})</h3>
                  </div>
                  <div className="divide-y divide-[#1f1f1f]">
                    {promos.length === 0 ? (
                      <div className="p-12 text-center text-gray-500">No campaigns running currently.</div>
                    ) : (
                      promos.map((promo) => (
                        <div key={promo.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#161616] transition">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-mono text-xl font-black text-[#00AEEF] tracking-widest">{promo.code}</span>
                              {getPromoTypeBadge(promo.discount_type, promo.discount_value)}
                            </div>
                            <p className="text-sm text-gray-400">{promo.description}</p>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {promo.target_categories && promo.target_categories.length > 0 ? 
                                promo.target_categories.map((c: string) => <span key={c} className="text-[10px] bg-[#1a1a1a] border border-[#333] px-2 py-1 rounded text-gray-400">{c}</span>)
                                : <span className="text-[10px] bg-green-900/20 border border-green-500/30 px-2 py-1 rounded text-green-400">All Categories</span>
                              }
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-full border ${promo.is_active ? 'bg-green-950/40 text-green-400 border-green-500/30' : 'bg-red-950/40 text-red-400 border-red-500/30'}`}>
                              {promo.is_active ? 'Active' : 'Disabled'}
                            </span>
                            <button onClick={() => togglePromoStatus(promo.id, promo.is_active)} className={`p-2.5 rounded-xl transition ${promo.is_active ? 'bg-[#1a1a1a] hover:bg-yellow-600 text-gray-300 hover:text-white border border-[#333]' : 'bg-[#1a1a1a] hover:bg-green-600 text-gray-300 hover:text-white border border-[#333]'}`} title={promo.is_active ? "Disable Campaign" : "Enable Campaign"}>
                              {promo.is_active ? <PowerOff className="w-5 h-5" /> : <Power className="w-5 h-5" />}
                            </button>
                            <button onClick={() => handleDeletePromo(promo.id)} className="p-2.5 bg-[#1a1a1a] border border-[#333] hover:bg-red-600 text-gray-300 hover:text-white rounded-xl transition" title="Delete Campaign">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 4. تبويب الولاء (كما هو) */}
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

        {/* --- نافذة التعديل (Edit Product) ... نفس الكود السابق --- */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#121212] border border-[#222] rounded-2xl p-6 max-w-lg w-full space-y-4 relative shadow-2xl">
              <button onClick={() => setEditingProduct(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              <h3 className="font-extrabold text-xl border-b border-[#222] pb-3">Edit Product Details</h3>
              <div className="space-y-3">
                <input type="text" value={editingProduct.title || ''} onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" step="0.01" value={editingProduct.price || ''} onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm" />
                  <input type="number" value={editingProduct.loyalty_points_earned || 20} onChange={(e) => setEditingProduct({ ...editingProduct, loyalty_points_earned: Number(e.target.value) })} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select value={editingProduct.category || 'Kits'} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm">
                    {STORE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <select value={editingProduct.league || 'Premier League'} onChange={(e) => setEditingProduct({ ...editingProduct, league: e.target.value })} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm">
                    <option value="Premier League">Premier League</option>
                    <option value="La Liga">La Liga</option>
                    <option value="Serie A">Serie A</option>
                    <option value="Bundesliga">Bundesliga</option>
                    <option value="Ligue 1">Ligue 1</option>
                    <option value="Other / National">Other / National</option>
                  </select>
                </div>
                <input type="url" value={editingProduct.imageUrl || ''} onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm" />
              </div>
              <div className="flex gap-3 pt-3 border-t border-[#222]">
                <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 bg-[#1a1a1a] text-gray-300 py-3 rounded-xl border border-[#333]">Cancel</button>
                <button type="button" onClick={handleSaveEditProduct} className="flex-1 bg-[#00AEEF] text-white py-3 rounded-xl font-extrabold">Save Changes</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}