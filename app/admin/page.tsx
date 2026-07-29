"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, ShoppingBag, Plus, RefreshCw, CheckCircle2, Clock, Upload, FileSpreadsheet, Loader2, Trash2, Edit3, X, Lock, KeyRound, Award, DollarSign } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState(false);

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'add_product' | 'import_excel' | 'loyalty_settings'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // إعدادات الولاء العامة (قيمة النقطة بالدولار)
  const [pointValueUsd, setPointValueUsd] = useState<number>(0.05);
  const [savingLoyalty, setSavingLoyalty] = useState(false);

  // حقول التعديل
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    price: '',
    category: '',
    loyaltyPoints: '20',
    imageUrls: ['']
  });

  // حقول إضافة منتج جديد
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    category: 'Home Jerseys',
    season: '2026-2027',
    loyaltyPoints: '20',
    imageUrls: ['']
  });

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('fd_admin_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem('fd_admin_auth', 'true');
      setAuthError(false);
    } else {
      setAuthError(true);
      setPasscode('');
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });
    if (data) setProducts(data);
    setLoadingProducts(false);
  };

  // جلب إعدادات برنامج الولاء العامة
  const fetchLoyaltySettings = async () => {
    const { data } = await supabase
      .from('store_settings')
      .select('loyalty_point_value_usd')
      .eq('id', 1)
      .single();
    if (data && data.loyalty_point_value_usd) {
      setPointValueUsd(data.loyalty_point_value_usd);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchProducts();
      fetchLoyaltySettings();
    }
  }, [isAuthenticated]);

  // حفظ تعديل سعر صرف النقطة
  const handleSaveLoyaltySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLoyalty(true);
    const { error } = await supabase
      .from('store_settings')
      .update({ loyalty_point_value_usd: pointValueUsd })
      .eq('id', 1);

    setSavingLoyalty(false);
    if (error) {
      alert("حدث خطأ أثناء حفظ الإعدادات: " + error.message);
    } else {
      alert("✅ تم تحديث قيمة صرف النقاط بنجاح!");
    }
  };

  // إضافة منتج جديد مع النقاط المحددة
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrls = newProduct.imageUrls.filter(url => url.trim() !== '');
    const { error } = await supabase.from('products').insert([
      {
        title: newProduct.title,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        season: newProduct.season,
        loyalty_points_earned: parseInt(newProduct.loyaltyPoints) || 20,
        image_urls: cleanUrls.length > 0 ? cleanUrls : ['https://images.unsplash.com/photo-1583318433420-532155e9d9e4?q=80&w=500&auto=format&fit=crop'],
        is_retro: false
      }
    ]);

    if (error) {
      alert("حدث خطأ أثناء إضافة المنتج: " + error.message);
    } else {
      alert("تمت إضافة المنتج بنجاح إلى الكتالوج! ✅");
      setNewProduct({ title: '', price: '', category: 'Home Jerseys', season: '2026-2027', loyaltyPoints: '20', imageUrls: [''] });
      fetchProducts();
    }
  };

  const handleDeleteProduct = async (id: string | number) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج نهائياً؟")) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      alert("حدث خطأ أثناء الحذف: " + error.message);
    } else {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    const urls = Array.isArray(product.image_urls) && product.image_urls.length > 0 
      ? product.image_urls 
      : [''];
    setEditForm({
      title: product.title || '',
      price: product.price?.toString() || '',
      category: product.category || 'Home Jerseys',
      loyaltyPoints: product.loyalty_points_earned?.toString() || '20',
      imageUrls: urls
    });
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const cleanUrls = editForm.imageUrls.filter(url => url.trim() !== '');
    const ptsValue = parseInt(editForm.loyaltyPoints, 10);
    const finalPoints = !isNaN(ptsValue) && ptsValue > 0 ? ptsValue : 20;

    const { error } = await supabase
      .from('products')
      .update({
        title: editForm.title,
        price: parseFloat(editForm.price),
        category: editForm.category,
        loyalty_points_earned: finalPoints,
        image_urls: cleanUrls.length > 0 ? cleanUrls : ['https://images.unsplash.com/photo-1583318433420-532155e9d9e4?q=80&w=500&auto=format&fit=crop']
      })
      .eq('id', editingProduct.id);

    if (error) {
      alert("حدث خطأ أثناء التعديل: " + error.message);
    } else {
      alert(`✅ تم تعديل المنتج وحفظ النقاط (${finalPoints} PTS) بنجاح!`);
      setEditingProduct(null);
      fetchProducts();
    }
  };

  const handleAddImageUrlField = (isEdit: boolean) => {
    if (isEdit) {
      setEditForm({ ...editForm, imageUrls: [...editForm.imageUrls, ''] });
    } else {
      setNewProduct({ ...newProduct, imageUrls: [...newProduct.imageUrls, ''] });
    }
  };

  const handleRemoveImageUrlField = (index: number, isEdit: boolean) => {
    if (isEdit) {
      const updated = editForm.imageUrls.filter((_, i) => i !== index);
      setEditForm({ ...editForm, imageUrls: updated.length ? updated : [''] });
    } else {
      const updated = newProduct.imageUrls.filter((_, i) => i !== index);
      setNewProduct({ ...newProduct, imageUrls: updated.length ? updated : [''] });
    }
  };

  const handleImageUrlChange = (index: number, value: string, isEdit: boolean) => {
    if (isEdit) {
      const updated = [...editForm.imageUrls];
      updated[index] = value;
      setEditForm({ ...editForm, imageUrls: updated });
    } else {
      const updated = [...newProduct.imageUrls];
      updated[index] = value;
      setNewProduct({ ...newProduct, imageUrls: updated });
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportStatus("جاري قراءة ملف الإكسل...");

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
        setImportStatus(`تم العثور على ${jsonData.length} منتج، جاري إدخالها في قاعدة البيانات...`);

        const formattedProducts = jsonData.map((row) => ({
          title: row['Name'] || row['title'] || 'Unnamed Product',
          price: parseFloat(row['Regular Price'] || row['price'] || 0),
          category: row['Category'] || 'Home Jerseys',
          season: '2026-2027',
          description: row['Description'] || '',
          loyalty_points_earned: parseInt(row['Points'] || row['loyalty_points'] || 20),
          image_urls: row['Image URL'] ? [row['Image URL']] : ['https://images.unsplash.com/photo-1583318433420-532155e9d9e4?q=80&w=500&auto=format&fit=crop'],
          is_retro: false
        }));

        const { error } = await supabase.from('products').insert(formattedProducts);
        if (error) throw error;

        alert(`✅ تم استيراد ${formattedProducts.length} منتجاً بنجاح من ملف الإكسل!`);
        setImportStatus("تم الاستيراد بنجاح! يمكنك مراجعة الكتالوج الآن.");
        fetchProducts();
      } catch (error: any) {
        alert("🚨 حدث خطأ أثناء الاستيراد: " + error.message);
        setImportStatus("فشل الاستيراد.");
      } finally {
        setImporting(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    // 1. جلب الطلب
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (newStatus === 'Delivered' && order && order.user_id && !order.points_awarded) {
      const pointsToAdd = Number(order.points_earned) > 0 ? Number(order.points_earned) : 20;

      // 2. فحص هل الزبون لديه حساب في جدول profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('loyalty_points')
        .eq('id', order.user_id)
        .single();

      let currentPoints = 0;

      if (profile) {
        currentPoints = Number(profile.loyalty_points) || 0;
      } else {
        // إذا كان الحساب مفقوداً في profiles، ننشئه فوراً لنضمن عدم ضياع النقاط
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

      // 3. صب النقاط في حساب الزبون
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

    fetchOrders();
  };
  if (!isAuthenticated) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center p-6 text-white">
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#333]">
            <Lock className="w-8 h-8 text-[#00AEEF]" />
          </div>
          <h2 className="text-2xl font-extrabold uppercase mb-2">Admin Portal</h2>
          <p className="text-sm text-gray-400 mb-8">Enter your security PIN code to access the Football District dashboard.</p>

          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div>
              <input 
                type="password"
                autoFocus
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter PIN (2026)" 
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-center text-xl font-bold tracking-widest text-white focus:outline-none focus:border-[#00AEEF] transition"
              />
            </div>

            {authError && (
              <p className="text-xs text-red-500 font-bold">Incorrect PIN code. Access Denied.</p>
            )}

            <button
              type="submit"
              className="w-full bg-[#00AEEF] hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition shadow-[0_0_15px_rgba(0,174,239,0.3)] flex items-center justify-center gap-2"
            >
              <KeyRound className="w-5 h-5" /> Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen py-12 text-white relative">
      <div className="container mx-auto px-6 max-w-6xl">
        
        {/* الترويسة وأزرار التبديل */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-[#1f1f1f] pb-6 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold uppercase tracking-wide">
                Admin <span className="text-[#00AEEF]">Dashboard</span>
              </h1>
              <button 
                onClick={() => {
                  sessionStorage.removeItem('fd_admin_auth');
                  setIsAuthenticated(false);
                }} 
                className="text-xs bg-[#1f1f1f] hover:bg-red-900/40 text-gray-400 hover:text-red-400 px-3 py-1.5 rounded-full border border-[#333] transition"
                title="Lock & Exit Dashboard"
              >
                Lock Session
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-1">Football District Control Center</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 transition text-sm ${activeTab === 'orders' ? 'bg-[#00AEEF] text-white' : 'bg-[#121212] text-gray-400 hover:text-white'}`}
            >
              <ShoppingBag className="w-4 h-4" /> Orders ({orders.length})
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 transition text-sm ${activeTab === 'products' ? 'bg-[#00AEEF] text-white' : 'bg-[#121212] text-gray-400 hover:text-white'}`}
            >
              <Package className="w-4 h-4" /> Products ({products.length})
            </button>
            <button 
              onClick={() => setActiveTab('add_product')}
              className={`px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 transition text-sm ${activeTab === 'add_product' ? 'bg-[#00AEEF] text-white' : 'bg-[#121212] text-gray-400 hover:text-white'}`}
            >
              <Plus className="w-4 h-4" /> Add Manual
            </button>
            <button 
              onClick={() => setActiveTab('loyalty_settings')}
              className={`px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 transition text-sm ${activeTab === 'loyalty_settings' ? 'bg-amber-600 text-white' : 'bg-[#121212] text-gray-400 hover:text-white'}`}
            >
              <Award className="w-4 h-4" /> Loyalty Program
            </button>
            <button 
              onClick={() => setActiveTab('import_excel')}
              className={`px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 transition text-sm ${activeTab === 'import_excel' ? 'bg-green-600 text-white' : 'bg-[#121212] text-gray-400 hover:text-white'}`}
            >
              <FileSpreadsheet className="w-4 h-4" /> Import Excel
            </button>
          </div>
        </div>

        {/* 1. الطلبات */}
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

        {/* 2. عرض المنتجات مع إظهار النقاط الممنوحة */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">All Store Products ({products.length})</h2>
              <button onClick={fetchProducts} className="flex items-center gap-2 text-sm text-[#00AEEF] hover:underline">
                <RefreshCw className="w-4 h-4" /> Refresh List
              </button>
            </div>

            {loadingProducts ? (
              <p className="text-gray-400">Loading catalog items...</p>
            ) : products.length === 0 ? (
              <div className="bg-[#121212] p-12 text-center rounded-xl border border-[#1f1f1f]">
                <p className="text-gray-400">No products found in the catalog.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const imgUrl = Array.isArray(product.image_urls) && product.image_urls.length > 0 
                    ? product.image_urls[0] 
                    : 'https://images.unsplash.com/photo-1583318433420-532155e9d9e4?q=80&w=500&auto=format&fit=crop';
                  const totalImages = Array.isArray(product.image_urls) ? product.image_urls.length : 1;

                  return (
                    <div key={product.id} className="bg-[#121212] p-4 rounded-xl border border-[#1f1f1f] flex items-center justify-between gap-4 hover:border-[#333] transition">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-16 h-16 bg-[#1a1a1a] rounded-lg overflow-hidden shrink-0 flex items-center justify-center relative">
                          <img src={imgUrl} alt={product.title} className="w-full h-full object-cover" />
                          {totalImages > 1 && (
                            <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-white px-1.5 py-0.5 rounded font-bold">
                              +{totalImages - 1}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm truncate" title={product.title}>{product.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[#00AEEF] font-semibold text-sm">${product.price}</span>
                            <span className="text-[10px] bg-amber-900/40 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                              <Award className="w-3 h-3" /> +{product.loyalty_points_earned || 20} PTS
                            </span>
                          </div>
                          <span className="text-[10px] bg-[#1a1a1a] text-gray-400 px-2 py-0.5 rounded uppercase mt-1 inline-block">{product.category}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button 
                          onClick={() => openEditModal(product)}
                          className="text-gray-400 hover:text-[#00AEEF] transition p-2 bg-[#1a1a1a] rounded-lg border border-[#333]"
                          title="Edit Product & Loyalty Points"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-gray-400 hover:text-red-500 transition p-2 bg-[#1a1a1a] rounded-lg border border-[#333]"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. إضافة منتج جديد مع تحديد النقاط */}
        {activeTab === 'add_product' && (
          <div className="max-w-2xl mx-auto bg-[#121212] p-8 rounded-xl border border-[#1f1f1f]">
            <h2 className="text-2xl font-bold mb-6 border-b border-[#333] pb-4">Add Single Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Product Title</label>
                <input 
                  required type="text" value={newProduct.title}
                  onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                  placeholder="e.g. Arsenal 26/27 Home Jersey" 
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded p-3 text-white focus:outline-none focus:border-[#00AEEF]"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Price ($ USD)</label>
                  <input 
                    required type="number" step="0.01" value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    placeholder="23.99" 
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
                    <option value="Home Jerseys">Home Jerseys</option>
                    <option value="Away Jerseys">Away Jerseys</option>
                    <option value="Third Jerseys">Third Jerseys</option>
                    <option value="Retro Jerseys">Retro Jerseys</option>
                    <option value="Equipment">Equipment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-amber-400 font-bold mb-2 flex items-center gap-1">
                    <Award className="w-4 h-4" /> Points Earned
                  </label>
                  <input 
                    required type="number" value={newProduct.loyaltyPoints}
                    onChange={(e) => setNewProduct({...newProduct, loyaltyPoints: e.target.value})}
                    placeholder="20" 
                    className="w-full bg-[#1a1a1a] border border-amber-500/50 rounded p-3 text-white focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm text-gray-400">Product Images (URLs)</label>
                  <button 
                    type="button"
                    onClick={() => handleAddImageUrlField(false)}
                    className="text-xs text-[#00AEEF] hover:underline flex items-center gap-1 font-bold"
                  >
                    + Add Another Image URL
                  </button>
                </div>
                <div className="space-y-3">
                  {newProduct.imageUrls.map((url, i) => (
                    <div key={i} className="flex gap-2">
                      <input 
                        type="url" 
                        value={url}
                        onChange={(e) => handleImageUrlChange(i, e.target.value, false)}
                        className="flex-1 bg-[#1a1a1a] border border-[#333] rounded p-3 text-white focus:outline-none focus:border-[#00AEEF]"
                        placeholder={`Image #${i + 1} URL (https://...)`} 
                        required={i === 0}
                      />
                      {newProduct.imageUrls.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => handleRemoveImageUrlField(i, false)}
                          className="bg-[#1f1f1f] hover:bg-red-900/30 text-gray-400 hover:text-red-500 p-3 rounded border border-[#333]"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full bg-[#00AEEF] hover:bg-blue-500 text-white font-bold py-4 rounded transition shadow-[0_0_15px_rgba(0,174,239,0.3)] mt-4">
                Publish Product 🚀
              </button>
            </form>
          </div>
        )}

        {/* 4. إعدادات برنامج الولاء وسعر صرف النقطة (التبويب الجديد) */}
        {activeTab === 'loyalty_settings' && (
          <div className="max-w-2xl mx-auto bg-[#121212] p-8 rounded-xl border border-[#1f1f1f]">
            <div className="flex items-center gap-3 mb-6 border-b border-[#333] pb-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Loyalty Exchange Rate & Economy</h2>
                <p className="text-xs text-gray-400">Control how much each loyalty point is worth when customers redeem rewards.</p>
              </div>
            </div>

            <form onSubmit={handleSaveLoyaltySettings} className="space-y-6">
              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#333]">
                <label className="block text-sm font-bold uppercase tracking-wider text-amber-400 mb-2">
                  1 Loyalty Point Value (in USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400 font-bold">$</span>
                  <input 
                    type="number" 
                    step="0.001" 
                    value={pointValueUsd}
                    onChange={(e) => setPointValueUsd(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#121212] border border-[#333] rounded-lg p-3 pl-8 text-xl font-extrabold text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                  💡 <strong className="text-white">Example Calculation:</strong> If set to <strong className="text-amber-400">$0.05</strong>, a customer with <strong className="text-white">100 points</strong> will receive a <strong className="text-amber-400">$5.00 discount</strong> upon checkout.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-[#1a1a1a] p-4 rounded-xl border border-[#333] text-center">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">500 Points Equals</p>
                  <p className="text-2xl font-black text-amber-400 mt-1">${(500 * pointValueUsd).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">1,000 Points Equals</p>
                  <p className="text-2xl font-black text-amber-400 mt-1">${(1000 * pointValueUsd).toFixed(2)}</p>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={savingLoyalty}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl transition shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              >
                {savingLoyalty ? "Saving..." : "Save Loyalty Settings"}
              </button>
            </form>
          </div>
        )}

        {/* 5. استيراد ملف الإكسل */}
        {activeTab === 'import_excel' && (
          <div className="max-w-2xl mx-auto bg-[#121212] p-8 rounded-xl border border-[#1f1f1f] text-center">
            <FileSpreadsheet className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Import Products from Excel</h2>
            <p className="text-gray-400 mb-8">
              Upload your Excel (.xlsx) or (.csv) spreadsheet to automatically import all your jerseys at once.
            </p>

            <div className="border-2 border-dashed border-[#333] hover:border-green-500 transition rounded-xl p-10 bg-[#1a1a1a] relative cursor-pointer mb-6">
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv"
                onChange={handleExcelUpload}
                disabled={importing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center">
                {importing ? (
                  <>
                    <Loader2 className="w-10 h-10 text-green-500 animate-spin mb-3" />
                    <p className="font-bold text-lg">Importing products...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-400 mb-3" />
                    <p className="font-bold text-lg mb-1">Click or drag Excel file here</p>
                    <p className="text-sm text-gray-500">Supports columns: Name, Regular Price, Category, Image URL, Description, Points</p>
                  </>
                )}
              </div>
            </div>

            {importStatus && (
              <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333] text-sm text-green-400">
                {importStatus}
              </div>
            )}
          </div>
        )}

      </div>

      {/* نافذة التعديل المنبثقة تدعم تعديل النقاط أيضاً */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#121212] border border-[#333] rounded-2xl p-6 md:p-8 max-w-lg w-full relative shadow-2xl my-8">
            <button 
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-[#1a1a1a] p-2 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold mb-6 border-b border-[#333] pb-4 flex items-center gap-2">
              <Edit3 className="text-[#00AEEF] w-5 h-5" /> Edit Product & Loyalty
            </h3>

            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input 
                  type="text" 
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded p-3 text-white focus:outline-none focus:border-[#00AEEF]"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Price ($ USD)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={editForm.price}
                    onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded p-3 text-white focus:outline-none focus:border-[#00AEEF]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category</label>
                  <select 
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded p-3 text-white focus:outline-none focus:border-[#00AEEF]"
                  >
                    <option value="Home Jerseys">Home Jerseys</option>
                    <option value="Away Jerseys">Away Jerseys</option>
                    <option value="Third Jerseys">Third Jerseys</option>
                    <option value="Retro Jerseys">Retro Jerseys</option>
                    <option value="Equipment">Equipment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-amber-400 font-bold mb-1 flex items-center gap-1">
                    <Award className="w-4 h-4" /> Points
                  </label>
                  <input 
                    type="number" 
                    value={editForm.loyaltyPoints}
                    onChange={(e) => setEditForm({...editForm, loyaltyPoints: e.target.value})}
                    className="w-full bg-[#1a1a1a] border border-amber-500/50 rounded p-3 text-white focus:outline-none focus:border-amber-400 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm text-gray-400">Product Image URLs (Gallery)</label>
                  <button 
                    type="button"
                    onClick={() => handleAddImageUrlField(true)}
                    className="text-xs text-[#00AEEF] hover:underline flex items-center gap-1 font-bold"
                  >
                    + Add Another Image
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {editForm.imageUrls.map((url, i) => (
                    <div key={i} className="flex gap-2">
                      <input 
                        type="url" 
                        value={url}
                        onChange={(e) => handleImageUrlChange(i, e.target.value, true)}
                        className="flex-1 bg-[#1a1a1a] border border-[#333] rounded p-2.5 text-sm text-white focus:outline-none focus:border-[#00AEEF]"
                        placeholder={`Image #${i + 1} URL (https://...)`} 
                        required={i === 0}
                      />
                      {editForm.imageUrls.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => handleRemoveImageUrlField(i, true)}
                          className="bg-[#1f1f1f] hover:bg-red-900/30 text-gray-400 hover:text-red-500 p-2 rounded border border-[#333]"
                          title="Remove Image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="w-1/2 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white font-bold py-3 rounded transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="w-1/2 bg-[#00AEEF] hover:bg-blue-500 text-white font-bold py-3 rounded transition shadow-[0_0_15px_rgba(0,174,239,0.3)]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}