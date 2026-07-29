"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, ShoppingBag, Plus, RefreshCw, CheckCircle2, Clock, Upload, FileSpreadsheet, Loader2, Trash2, Edit3, X } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'add_product' | 'import_excel'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // حالة التعديل (Modal Edit State)
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    price: '',
    category: '',
    imageUrl: ''
  });

  // حقول إضافة منتج جديد يدوياً
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    category: 'Jerseys',
    season: '2026-2027',
    imageUrl: ''
  });

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

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('products').insert([
      {
        title: newProduct.title,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        season: newProduct.season,
        image_urls: [newProduct.imageUrl],
        is_retro: false
      }
    ]);

    if (error) {
      alert("حدث خطأ أثناء إضافة المنتج: " + error.message);
    } else {
      alert("تمت إضافة المنتج بنجاح إلى الكتالوج! ✅");
      setNewProduct({ title: '', price: '', category: 'Jerseys', season: '2026-2027', imageUrl: '' });
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

  // فتح نافذة التعديل وتعبئة البيانات الحالية للمنتج
  const openEditModal = (product: any) => {
    setEditingProduct(product);
    const imgUrl = Array.isArray(product.image_urls) && product.image_urls.length > 0 
      ? product.image_urls[0] 
      : '';
    setEditForm({
      title: product.title || '',
      price: product.price?.toString() || '',
      category: product.category || 'Jerseys',
      imageUrl: imgUrl
    });
  };

  // حفظ التعديلات في قاعدة البيانات
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const { error } = await supabase
      .from('products')
      .update({
        title: editForm.title,
        price: parseFloat(editForm.price),
        category: editForm.category,
        image_urls: [editForm.imageUrl]
      })
      .eq('id', editingProduct.id);

    if (error) {
      alert("حدث خطأ أثناء التعديل: " + error.message);
    } else {
      alert("✅ تم تعديل المنتج بنجاح!");
      setEditingProduct(null);
      fetchProducts();
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
          category: row['Category'] || 'Jerseys',
          season: '2026-2027',
          description: row['Description'] || '',
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
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    fetchOrders();
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen py-12 text-white relative">
      <div className="container mx-auto px-6 max-w-6xl">
        
        {/* الترويسة وأزرار التبديل */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-[#1f1f1f] pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-wide">
              Admin <span className="text-[#00AEEF]">Dashboard</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Football District Control Center</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-5 py-3 rounded-lg font-bold flex items-center gap-2 transition ${activeTab === 'orders' ? 'bg-[#00AEEF] text-white' : 'bg-[#121212] text-gray-400 hover:text-white'}`}
            >
              <ShoppingBag className="w-5 h-5" /> Orders ({orders.length})
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={`px-5 py-3 rounded-lg font-bold flex items-center gap-2 transition ${activeTab === 'products' ? 'bg-[#00AEEF] text-white' : 'bg-[#121212] text-gray-400 hover:text-white'}`}
            >
              <Package className="w-5 h-5" /> Products ({products.length})
            </button>
            <button 
              onClick={() => setActiveTab('add_product')}
              className={`px-5 py-3 rounded-lg font-bold flex items-center gap-2 transition ${activeTab === 'add_product' ? 'bg-[#00AEEF] text-white' : 'bg-[#121212] text-gray-400 hover:text-white'}`}
            >
              <Plus className="w-5 h-5" /> Add Manual
            </button>
            <button 
              onClick={() => setActiveTab('import_excel')}
              className={`px-5 py-3 rounded-lg font-bold flex items-center gap-2 transition ${activeTab === 'import_excel' ? 'bg-green-600 text-white' : 'bg-[#121212] text-gray-400 hover:text-white'}`}
            >
              <FileSpreadsheet className="w-5 h-5" /> Import Excel
            </button>
          </div>
        </div>

        {/* القسم الأول: طلبات الزبائن */}
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

        {/* القسم الثاني: عرض المنتجات مع زري التعديل والحذف */}
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

                  return (
                    <div key={product.id} className="bg-[#121212] p-4 rounded-xl border border-[#1f1f1f] flex items-center justify-between gap-4 hover:border-[#333] transition">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-16 h-16 bg-[#1a1a1a] rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                          <img src={imgUrl} alt={product.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm truncate" title={product.title}>{product.title}</h4>
                          <p className="text-[#00AEEF] font-semibold text-sm mt-1">${product.price}</p>
                          <span className="text-[10px] bg-[#1a1a1a] text-gray-400 px-2 py-0.5 rounded uppercase">{product.category}</span>
                        </div>
                      </div>

                      {/* أزرار التحكم: تعديل (Edit) وحذف (Delete) */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button 
                          onClick={() => openEditModal(product)}
                          className="text-gray-400 hover:text-[#00AEEF] transition p-2 bg-[#1a1a1a] rounded-lg border border-[#333]"
                          title="Edit Product"
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

        {/* القسم الثالث: إضافة منتج يدوياً */}
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

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Image URL</label>
                <input 
                  required type="url" value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                  placeholder="https://..." 
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded p-3 text-white focus:outline-none focus:border-[#00AEEF]"
                />
              </div>

              <button type="submit" className="w-full bg-[#00AEEF] hover:bg-blue-500 text-white font-bold py-4 rounded transition shadow-[0_0_15px_rgba(0,174,239,0.3)] mt-4">
                Publish Product 🚀
              </button>
            </form>
          </div>
        )}

        {/* القسم الرابع: استيراد ملف الإكسل */}
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
                    <p className="text-sm text-gray-500">Supports columns: Name, Regular Price, Category, Image URL, Description</p>
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

      {/* نافذة التعديل المنبثقة (Edit Modal) */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#121212] border border-[#333] rounded-2xl p-6 md:p-8 max-w-lg w-full relative shadow-2xl">
            <button 
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-[#1a1a1a] p-2 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold mb-6 border-b border-[#333] pb-4 flex items-center gap-2">
              <Edit3 className="text-[#00AEEF] w-5 h-5" /> Edit Product Details
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

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Image URL</label>
                <input 
                  type="url" 
                  value={editForm.imageUrl}
                  onChange={(e) => setEditForm({...editForm, imageUrl: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded p-3 text-white focus:outline-none focus:border-[#00AEEF]"
                  placeholder="https://..." 
                  required
                />
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