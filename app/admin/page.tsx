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
  Percent,
  Megaphone,
  Image as ImageIcon,
  Eye,
  EyeOff
} from 'lucide-react';

const STORE_CATEGORIES = ['Kits', 'Retro Kits', 'Kids', 'Special Orders', 'Boots', 'Equipment', 'Mystery Drop'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'loyalty' | 'promos' | 'popup'>('products');
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

  const [newPromo, setNewPromo] = useState({
    code: '', description: '', discount_type: 'percentage', discount_value: 0, target_categories: [] as string[]
  });

  // حالة إعدادات الـ Pop-up
  const [popupSettings, setPopupSettings] = useState({
    is_active: false, title: '', description: '', image_url: '', button_text: '', button_link: '', delay_seconds: 3
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

    const { data: popupData } = await supabase.from('popup_settings').select('*').eq('id', 1).single();
    if (popupData) setPopupSettings(popupData);

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // --- دوال المنتجات ---
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price) return alert("⚠️ يرجى إدخال عنوان المنتج وسعره!");
    const { error } = await supabase.from('products').insert([{
      title: newProduct.title, price: parseFloat(newProduct.price), category: newProduct.category, league: newProduct.league,
      image_url: newProduct.imageUrl || 'https://images.unsplash.com/photo-1583318433420-532155e9d9e4?q=80&w=500',
      image_urls: newProduct.imageUrl ? [newProduct.imageUrl] : [], loyalty_points_earned: Number(newProduct.loyalty_points_earned) || 20,
      in_stock: true // متوفر افتراضياً عند الإضافة
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
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        if (jsonData.length === 0) return alert("⚠️ The Excel file is empty.");

        const formattedProducts = jsonData.map((row: any) => ({
          title: row.Title || row.title || 'Unnamed', price: parseFloat(row.Price || row.price) || 0,
          category: row.Category || row.category || 'Kits', league: row.League || row.league || '',
          image_url: row.ImageUrl || row.image_url || 'https://images.unsplash.com/photo-1583318433420-532155e9d9e4',
          image_urls: row.ImageUrl || row.image_url ? [row.ImageUrl || row.image_url] : [],
          loyalty_points_earned: parseInt(row.Points || row.loyalty_points_earned) || 20,
          in_stock: row.InStock !== undefined ? String(row.InStock).toLowerCase() === 'true' : true
        }));

        const { error } = await supabase.from('products').insert(formattedProducts);
        if (error) throw error;
        alert(`✅ Successfully added ${formattedProducts.length} products!`); fetchData();
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
      loyalty_points_earned: Number(editingProduct.loyalty_points_earned) || 20,
      in_stock: editingProduct.in_stock
    }).eq('id', editingProduct.id);
    if (!error) { alert("✅ تم التحديث!"); setEditingProduct(null); fetchData(); }
  };

  const handleDeleteProduct = async (id: number | string) => {
    if (!confirm("❓ هل أنت متأكد من الحذف؟")) return;
    await supabase.from('products').delete().eq('id', id); fetchData();
  };

  // --- تبديل حالة توفر المنتج ---
  const toggleProductAvailability = async (id: number, currentStatus: boolean) => {
    await supabase.from('products').update({ in_stock: !currentStatus }).eq('id', id);
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
    } else { await supabase.from('orders').update({ status: newStatus }).eq('id', orderId); }
    fetchData();
  };

  const handleSaveLoyaltySettings = async () => {
    await supabase.from('store_settings').upsert([{ id: 1, loyalty_point_value_usd: pointValueUsd }]); alert("✅ تم الحفظ!");
  };

  // --- دوال البرومو كود ---
  const toggleCategoryForPromo = (category: string) => {
    const isSelected = newPromo.target_categories.includes(category);
    if (isSelected) setNewPromo({ ...newPromo, target_categories: newPromo.target_categories.filter(c => c !== category) });
    else setNewPromo({ ...newPromo, target_categories: [...newPromo.target_categories, category] });
  };

  const handleAddPromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromo.code) return;
    const finalCategories = newPromo.target_categories.length > 0 ? newPromo.target_categories : STORE_CATEGORIES;
    const { error } = await supabase.from('promo_codes').insert([{
      code: newPromo.code.toUpperCase().replace(/\s/g, ''), description: newPromo.description, discount_type: newPromo.discount_type,
      discount_value: Number(newPromo.discount_value), target_categories: finalCategories
    }]);
    if (!error) { alert("✅ تم إنشاء العرض بنجاح!"); setNewPromo({ code: '', description: '', discount_type: 'percentage', discount_value: 0, target_categories: [] }); fetchData(); }
    else alert("🚨 خطأ: الكود قد يكون موجوداً مسبقاً.");
  };

  const togglePromoStatus = async (id: number, currentStatus: boolean) => { await supabase.from('promo_codes').update({ is_active: !currentStatus }).eq('id', id); fetchData(); };
  const handleDeletePromo = async (id: number) => { if (!confirm("❓ متأكد من حذف العرض؟")) return; await supabase.from('promo_codes').delete().eq('id', id); fetchData(); };
  const getPromoTypeBadge = (type: string, value: number) => {
    switch (type) {
      case 'percentage': return <span className="text-blue-400 bg-blue-900/30 px-2 py-1 rounded text-xs border border-blue-500/30">{value}% OFF</span>;
      case 'fixed': return <span className="text-green-400 bg-green-900/30 px-2 py-1 rounded text-xs border border-green-500/30">${value} OFF</span>;
      case 'bogo_50': return <span className="text-amber-400 bg-amber-900/30 px-2 py-1 rounded text-xs border border-amber-500/30">Buy 1 Get 1 50%</span>;
      case 'b2g1_free': return <span className="text-purple-400 bg-purple-900/30 px-2 py-1 rounded text-xs border border-purple-500/30">Buy 2 Get 1 FREE</span>;
      default: return <span className="text-gray-400">Discount</span>;
    }
  };

  // --- حفظ إعدادات الـ Pop-up ---
  const handleSavePopupSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('popup_settings').upsert([{ id: 1, ...popupSettings }]);
    if (!error) alert("✅ Popup settings saved successfully!");
    else alert("🚨 Error saving popup: " + error.message);
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
            <button onClick={() => setActiveTab('products')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === 'products' ? 'bg-[#00AEEF] text-white' : 'text-gray-400 hover:text-white'}`}><Package className="w-4 h-4" /> Products</button>
            <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === 'orders' ? 'bg-[#00AEEF] text-white' : 'text-gray-400 hover:text-white'}`}><ShoppingBag className="w-4 h-4" /> Orders</button>
            <button onClick={() => setActiveTab('promos')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === 'promos' ? 'bg-[#00AEEF] text-white' : 'text-gray-400 hover:text-white'}`}><Tag className="w-4 h-4" /> Promos</button>
            <button onClick={() => setActiveTab('popup')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === 'popup' ? 'bg-[#00AEEF] text-white' : 'text-gray-400 hover:text-white'}`}><Megaphone className="w-4 h-4" /> Popup</button>
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
                        <option value="Premier League">Premier League</option><option value="La Liga">La Liga</option><option value="Serie A">Serie A</option><option value="Bundesliga">Bundesliga</option><option value="Ligue 1">Ligue 1</option><option value="Other / National">Other / National</option>
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
                      // التحقق من حالة التوفر
                      const isAvailable = p.in_stock !== false; 
                      return (
                        <div key={p.id} className={`p-4 flex items-center justify-between gap-4 transition ${!isAvailable ? 'bg-[#1a0505] opacity-70' : 'hover:bg-[#161616]'}`}>
                          <div className="flex items-center gap-4">
                            <img src={img || 'https://images.unsplash.com/photo-1583318433420-532155e9d9e4?q=80&w=500'} alt="" className={`w-14 h-14 rounded-lg object-cover bg-[#1a1a1a] border border-[#333] ${!isAvailable ? 'grayscale' : ''}`} />
                            <div>
                              <p className={`font-bold text-sm ${!isAvailable ? 'text-gray-400 line-through' : 'text-white'}`}>{p.title}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#1f1f1f] text-[#00AEEF] border border-[#333]">{p.category || 'Kits'}</span>
                                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${isAvailable ? 'bg-green-900/30 text-green-400 border-green-500/30' : 'bg-red-900/30 text-red-400 border-red-500/30'}`}>
                                  {isAvailable ? 'In Stock' : 'Out of Stock'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`font-black text-lg ${!isAvailable ? 'text-gray-500' : 'text-white'}`}>${p.price}</span>
                            <div className="flex items-center gap-2">
                              {/* زر الإخفاء/الإظهار (التوفر) */}
                              <button onClick={() => toggleProductAvailability(p.id, isAvailable)} className={`p-2 rounded-lg transition ${isAvailable ? 'bg-[#1f1f1f] hover:bg-yellow-600 text-gray-300 hover:text-white' : 'bg-red-900 hover:bg-green-600 text-red-300 hover:text-white'}`} title={isAvailable ? "Mark Out of Stock" : "Mark In Stock"}>
                                {isAvailable ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                              
                              <button onClick={() => setEditingProduct({ ...p, imageUrl: img })} className="p-2 bg-[#1f1f1f] hover:bg-[#00AEEF] text-gray-300 hover:text-white rounded-lg transition" title="Edit"><Edit3 className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteProduct(p.id)} className="p-2 bg-[#1f1f1f] hover:bg-red-600 text-gray-300 hover:text-white rounded-lg transition" title="Delete"><Trash2 className="w-4 h-4" /></button>
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
                            <h4 className="font-extrabold text-white text-base mt-0.5">{order.first_name} {order.last_name} ({order.phone})</h4>
                            <p className="text-xs text-gray-400 mt-1">{order.address}</p>
                            {order.promo_code && <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded-lg"><Tag className="w-3.5 h-3.5" /> Promo Used: {order.promo_code}</div>}
                            {order.notes && <p className="text-xs text-amber-400 mt-2 bg-amber-500/10 p-2 rounded border border-amber-500/30">📝 Notes: {order.notes}</p>}
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`text-xs px-3 py-1.5 rounded-full font-extrabold uppercase flex items-center gap-1.5 ${order.status === 'Delivered' ? 'bg-green-950 text-green-400 border border-green-500/40' : 'bg-yellow-950 text-yellow-400 border border-yellow-500/40'}`}>
                              {order.status === 'Delivered' ? <CheckCircle2 className="w-3.5 h-3.5"/> : <Clock className="w-3.5 h-3.5"/>} {order.status}
                            </span>
                            {order.status !== 'Delivered' ? <button onClick={() => updateOrderStatus(order.id, 'Delivered')} className="bg-green-600 hover:bg-green-500 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition shadow">Mark Delivered ✅</button> : <button onClick={() => updateOrderStatus(order.id, 'Pending')} className="bg-[#222] hover:bg-[#333] text-gray-400 hover:text-white text-xs font-bold px-3 py-2 rounded-lg border border-[#333] transition">Revert to Pending</button>}
                          </div>
                        </div>
                        <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#262626] space-y-1">
                          {Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-xs text-gray-300"><span>{item.quantity}x {item.title}</span><span className="font-bold text-white">${item.price}</span></div>
                          ))}
                          <div className="border-t border-[#2d2d2d] pt-2 mt-2 flex justify-between items-center text-sm font-extrabold text-white"><span>Total Paid (COD):</span><span className="text-[#00AEEF]">${order.total_amount}</span></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
               </div>
            )}

            {/* 3. تبويب الأكواد الذكية */}
            {activeTab === 'promos' && (
              <div className="space-y-8 animate-fadeIn">
                <form onSubmit={handleAddPromoCode} className="bg-[#121212] p-8 rounded-2xl border border-[#1f1f1f] shadow-xl max-w-4xl space-y-6">
                  <h3 className="font-bold text-xl border-b border-[#222] pb-4 flex items-center gap-2"><Tag className="w-6 h-6 text-[#00AEEF]" /> Create Advanced Smart Offer</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-bold text-gray-300 mb-2">Promo Code</label><input type="text" required value={newPromo.code} onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3.5 text-white focus:border-[#00AEEF] tracking-widest font-mono" /></div>
                    <div><label className="block text-sm font-bold text-gray-300 mb-2">Description</label><input type="text" value={newPromo.description} onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3.5 text-white focus:border-[#00AEEF]" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-[#161616] rounded-xl border border-[#2b2b2b]">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Offer Type</label>
                      <select value={newPromo.discount_type} onChange={(e) => setNewPromo({ ...newPromo, discount_type: e.target.value })} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3.5 text-white focus:border-[#00AEEF]">
                        <option value="percentage">Discount Percentage (%)</option><option value="fixed">Fixed Amount ($)</option><option value="bogo_50">Buy 1 Get 1 50% OFF</option><option value="b2g1_free">Buy 2 Get 1 FREE</option>
                      </select>
                    </div>
                    {(newPromo.discount_type === 'percentage' || newPromo.discount_type === 'fixed') && (
                      <div className="animate-in fade-in zoom-in">
                        <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-1"><Percent className="w-4 h-4 text-amber-400" /> Value</label>
                        <input type="number" required value={newPromo.discount_value} onChange={(e) => setNewPromo({ ...newPromo, discount_value: Number(e.target.value) })} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3.5 text-white focus:border-[#00AEEF]" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 bg-[#161616] rounded-xl border border-[#2b2b2b]">
                    <label className="block text-sm font-bold text-gray-300 mb-3">Target Categories</label>
                    <div className="flex flex-wrap gap-3">
                      {STORE_CATEGORIES.map(cat => (
                        <label key={cat} className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-bold border transition flex items-center gap-2 ${newPromo.target_categories.includes(cat) ? 'bg-[#00AEEF]/20 border-[#00AEEF] text-[#00AEEF]' : 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:border-gray-500'}`}>
                          <input type="checkbox" className="hidden" checked={newPromo.target_categories.includes(cat)} onChange={() => toggleCategoryForPromo(cat)} />
                          {newPromo.target_categories.includes(cat) && <CheckCircle2 className="w-4 h-4" />} {cat}
                        </label>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-[#00AEEF] hover:bg-blue-500 text-white font-extrabold py-4 rounded-xl transition shadow-lg text-lg">+ Launch Promo Campaign</button>
                </form>

                <div className="bg-[#121212] rounded-2xl border border-[#1f1f1f] overflow-hidden">
                  <div className="p-6 border-b border-[#222] flex justify-between items-center"><h3 className="font-bold text-lg">Active Campaigns ({promos.length})</h3></div>
                  <div className="divide-y divide-[#1f1f1f]">
                    {promos.length === 0 ? <div className="p-12 text-center text-gray-500">No campaigns.</div> : promos.map((promo) => (
                        <div key={promo.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#161616] transition">
                          <div>
                            <div className="flex items-center gap-3 mb-2"><span className="font-mono text-xl font-black text-[#00AEEF] tracking-widest">{promo.code}</span>{getPromoTypeBadge(promo.discount_type, promo.discount_value)}</div>
                            <p className="text-sm text-gray-400">{promo.description}</p>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {promo.target_categories && promo.target_categories.length > 0 ? promo.target_categories.map((c: string) => <span key={c} className="text-[10px] bg-[#1a1a1a] border border-[#333] px-2 py-1 rounded text-gray-400">{c}</span>) : <span className="text-[10px] bg-green-900/20 border border-green-500/30 px-2 py-1 rounded text-green-400">All Categories</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-full border ${promo.is_active ? 'bg-green-950/40 text-green-400 border-green-500/30' : 'bg-red-950/40 text-red-400 border-red-500/30'}`}>{promo.is_active ? 'Active' : 'Disabled'}</span>
                            <button onClick={() => togglePromoStatus(promo.id, promo.is_active)} className={`p-2.5 rounded-xl transition ${promo.is_active ? 'bg-[#1a1a1a] hover:bg-yellow-600 text-gray-300 border border-[#333]' : 'bg-[#1a1a1a] hover:bg-green-600 text-gray-300 border border-[#333]'}`}>{promo.is_active ? <PowerOff className="w-5 h-5" /> : <Power className="w-5 h-5" />}</button>
                            <button onClick={() => handleDeletePromo(promo.id)} className="p-2.5 bg-[#1a1a1a] border border-[#333] hover:bg-red-600 text-gray-300 hover:text-white rounded-xl transition"><Trash2 className="w-5 h-5" /></button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4. تبويب الـ Popup (الجديد والمميز) */}
            {activeTab === 'popup' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
                <form onSubmit={handleSavePopupSettings} className="bg-[#121212] p-6 md:p-8 rounded-2xl border border-[#1f1f1f] shadow-xl space-y-6">
                  <div className="flex items-center justify-between border-b border-[#222] pb-4">
                    <h3 className="font-bold text-xl flex items-center gap-2"><Megaphone className="w-6 h-6 text-[#00AEEF]" /> Global Popup Settings</h3>
                    <button type="button" onClick={() => setPopupSettings({ ...popupSettings, is_active: !popupSettings.is_active })} className={`relative w-16 h-8 rounded-full transition-colors duration-300 focus:outline-none ${popupSettings.is_active ? 'bg-green-500' : 'bg-[#333]'}`}>
                      <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 shadow-sm flex items-center justify-center ${popupSettings.is_active ? 'translate-x-8' : ''}`}>{popupSettings.is_active && <Power className="w-3 h-3 text-green-500" />}</div>
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div><label className="block text-sm font-bold text-gray-300 mb-1">Headline (Title)</label><input type="text" value={popupSettings.title} onChange={(e) => setPopupSettings({ ...popupSettings, title: e.target.value })} placeholder="e.g. FLASH SALE!" className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 text-white focus:border-[#00AEEF] uppercase font-black tracking-wider" /></div>
                    <div><label className="block text-sm font-bold text-gray-300 mb-1">Subtext (Description)</label><textarea rows={3} value={popupSettings.description} onChange={(e) => setPopupSettings({ ...popupSettings, description: e.target.value })} placeholder="e.g. Use code WEEK1 to get 50% off." className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 text-white focus:border-[#00AEEF]" /></div>
                    <div><label className="block text-sm font-bold text-gray-300 mb-1 flex items-center gap-1"><ImageIcon className="w-4 h-4"/> Optional Image URL</label><input type="url" value={popupSettings.image_url} onChange={(e) => setPopupSettings({ ...popupSettings, image_url: e.target.value })} placeholder="https://..." className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 text-white focus:border-[#00AEEF]" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-bold text-gray-300 mb-1">Button Text</label><input type="text" value={popupSettings.button_text} onChange={(e) => setPopupSettings({ ...popupSettings, button_text: e.target.value })} placeholder="SHOP NOW" className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 text-white focus:border-[#00AEEF] uppercase font-bold" /></div>
                      <div><label className="block text-sm font-bold text-gray-300 mb-1">Button Link</label><input type="text" value={popupSettings.button_link} onChange={(e) => setPopupSettings({ ...popupSettings, button_link: e.target.value })} placeholder="/catalog" className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 text-white focus:border-[#00AEEF]" /></div>
                    </div>
                    <div><label className="block text-sm font-bold text-gray-300 mb-1">Delay before showing (Seconds)</label><input type="number" min="0" value={popupSettings.delay_seconds} onChange={(e) => setPopupSettings({ ...popupSettings, delay_seconds: Number(e.target.value) })} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 text-white focus:border-[#00AEEF]" /></div>
                  </div>
                  <button type="submit" className="w-full bg-[#00AEEF] hover:bg-blue-500 text-white font-extrabold py-4 rounded-xl transition shadow-lg text-lg">Save Popup Settings</button>
                </form>

                {/* المعاينة الحية */}
                <div className="hidden lg:flex flex-col items-center justify-center p-8 bg-[#0a0a0a] border-2 border-dashed border-[#222] rounded-2xl relative">
                  <div className="absolute top-4 left-4 text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Live Preview</div>
                  <div className={`relative w-full max-w-sm bg-[#121212] border border-[#333] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ${!popupSettings.is_active ? 'opacity-40 grayscale' : 'opacity-100 scale-105'}`}>
                    <button disabled className="absolute top-3 right-3 text-gray-400 hover:text-white p-1 bg-black/50 rounded-full z-10"><X className="w-4 h-4" /></button>
                    {popupSettings.image_url && <div className="h-40 w-full overflow-hidden"><img src={popupSettings.image_url} alt="Popup" className="w-full h-full object-cover" /></div>}
                    <div className="p-8 text-center space-y-4">
                      <h2 className="text-2xl font-black uppercase tracking-tight text-[#00AEEF] leading-tight">{popupSettings.title || 'YOUR TITLE HERE'}</h2>
                      <p className="text-sm text-gray-300 leading-relaxed">{popupSettings.description || 'Your exciting offer description goes right here so customers can read it.'}</p>
                      <div className="pt-2"><button disabled className="w-full bg-[#00AEEF] text-white font-extrabold py-3.5 rounded-xl uppercase tracking-wide text-sm shadow-[0_0_15px_rgba(0,174,239,0.4)]">{popupSettings.button_text || 'CLICK HERE'}</button></div>
                    </div>
                  </div>
                  {!popupSettings.is_active && <p className="text-red-400 text-xs font-bold mt-6">⚠️ Currently Disabled. Toggle the switch to activate.</p>}
                </div>
              </div>
            )}

            {/* 5. تبويب الولاء */}
            {activeTab === 'loyalty' && (
              <div className="bg-[#121212] p-8 rounded-2xl border border-[#1f1f1f] max-w-xl space-y-6">
                <h3 className="font-bold text-xl border-b border-[#222] pb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-amber-400" /> Loyalty Program Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">1 Loyalty Point Value (in USD)</label>
                    <input type="number" step="0.001" value={pointValueUsd} onChange={(e) => setPointValueUsd(Number(e.target.value))} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-white font-bold text-lg focus:border-[#00AEEF] focus:outline-none" />
                  </div>
                  <button onClick={handleSaveLoyaltySettings} className="w-full bg-[#00AEEF] hover:bg-blue-500 text-white font-extrabold py-4 rounded-xl transition shadow-lg">Save Loyalty Settings</button>
                </div>
              </div>
            )}
          </>
        )}

        {/* --- نافذة التعديل (Edit Product) مع إضافة خيار التوفر --- */}
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
                    <option value="Premier League">Premier League</option><option value="La Liga">La Liga</option><option value="Serie A">Serie A</option><option value="Bundesliga">Bundesliga</option><option value="Ligue 1">Ligue 1</option><option value="Other / National">Other / National</option>
                  </select>
                </div>
                <input type="url" value={editingProduct.imageUrl || ''} onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm" />
                
                {/* مفتاح تبديل التوفر في نافذة التعديل */}
                <div className="flex items-center justify-between bg-[#1a1a1a] p-3 rounded-lg border border-[#333]">
                  <span className="text-sm font-bold text-gray-300">Product Availability (In Stock)</span>
                  <button 
                    type="button" 
                    onClick={() => setEditingProduct({ ...editingProduct, in_stock: !editingProduct.in_stock })}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${editingProduct.in_stock !== false ? 'bg-green-500' : 'bg-[#444]'}`}
                  >
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${editingProduct.in_stock !== false ? 'translate-x-6' : ''}`}></div>
                  </button>
                </div>
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