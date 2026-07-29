"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useCartStore } from '@/store/cart';
import { useRouter } from 'next/navigation';
import { Award, ShoppingBag, Truck, CheckCircle2, Clock, Gift, Crown, RefreshCw, LogOut, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function CustomerProfilePage() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null);

  const { addItem } = useCartStore();
  const router = useRouter();

  // جلب بيانات الحساب ورصيد النقاط وسجل الطلبات
  const fetchCustomerData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setUser(user);

    // جلب البروفايل والنقاط
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
    } else {
      // إنشاء بروفايل أولي إذا كان العميل جديداً
      const defaultProfile = {
        id: user.id,
        full_name: user.user_metadata?.full_name || 'Football District Member',
        loyalty_points: 0,
        role: 'customer'
      };
      await supabase.from('profiles').insert([defaultProfile]);
      setProfile(defaultProfile);
    }

    // جلب طلبات هذا الزبون فقط
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (ordersData) setOrders(ordersData);
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/catalog');
  };

  // وظيفة إعادة طلب نفس المنتجات السابقة
  const handleReorder = (orderItems: any[]) => {
    if (Array.isArray(orderItems)) {
      orderItems.forEach((item) => {
        addItem({
          id: item.id,
          title: item.title,
          price: item.price,
          image: item.image,
          quantity: item.quantity || 1
        });
      });
      alert("✅ Added previous order items to your cart!");
      router.push('/cart');
    }
  };

  // وظيفة استبدال النقاط بكود خصم
  const handleRedeemReward = (pointsCost: number, rewardValue: number) => {
    const currentPoints = profile?.loyalty_points || 0;
    if (currentPoints < pointsCost) {
      alert("⚠️ You don't have enough points for this reward yet!");
      return;
    }

    const newPoints = currentPoints - pointsCost;
    const generatedCode = `FD-${rewardValue}OFF-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    // خصم النقاط من قاعدة البيانات
    supabase
      .from('profiles')
      .update({ loyalty_points: newPoints })
      .eq('id', user.id)
      .then(() => {
        setProfile({ ...profile, loyalty_points: newPoints });
        setRedeemedCode(generatedCode);
        alert(`🎉 Congratulations! You redeemed a $${rewardValue} discount voucher!`);
      });
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Loading loyalty account...</div>;
  }

  // إذا لم يكن الزبون مسجلاً، يُعرض له خيار الدخول أو الإنشاء بحساب سريع
  if (!user) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen py-20 text-white flex items-center justify-center px-6">
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <Award className="w-16 h-16 text-[#00AEEF] mx-auto mb-6" />
          <h2 className="text-3xl font-black uppercase mb-2">Join FD Loyalty Club</h2>
          <p className="text-gray-400 text-sm mb-8">
            Create an account to earn points on every jersey purchase, unlock cash discounts, and track your Lebanon orders.
          </p>
          <div className="space-y-3">
            <Link 
              href="/catalog" 
              className="w-full bg-[#00AEEF] hover:bg-blue-500 text-white font-extrabold py-4 rounded-xl block transition shadow-[0_0_15px_rgba(0,174,239,0.3)]"
            >
              Browse Catalog First
            </Link>
            <p className="text-xs text-gray-500 mt-4">
              💡 Your points are automatically earned on every checkout!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // حساب مستوى العميل (FUT Tier Logic)
  const pts = profile?.loyalty_points || 0;
  let tier = { name: "BRONZE MEMBER 🥉", next: 200, color: "from-amber-800 to-amber-950", border: "border-amber-700" };
  if (pts >= 1000) {
    tier = { name: "VIP ICON MEMBER 👑", next: 5000, color: "from-purple-900 to-indigo-950", border: "border-purple-500" };
  } else if (pts >= 500) {
    tier = { name: "GOLD MEMBER 🥇", next: 1000, color: "from-amber-500/80 to-yellow-900", border: "border-yellow-400" };
  } else if (pts >= 200) {
    tier = { name: "SILVER MEMBER 🥈", next: 500, color: "from-slate-600 to-slate-800", border: "border-slate-400" };
  }

  const progressPercent = Math.min(100, Math.round((pts / tier.next) * 100));

  return (
    <div className="bg-[#0a0a0a] min-h-screen py-12 text-white">
      <div className="container mx-auto px-6 max-w-5xl">
        
        {/* الترويسة العليا */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 border-b border-[#1f1f1f] pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight">
              My <span className="text-[#00AEEF]">Loyalty Hub</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Football District Player Card & Order History</p>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 bg-[#141414] hover:bg-red-950/40 text-gray-400 hover:text-red-400 border border-[#222] px-4 py-2 rounded-xl text-sm transition"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* العمود الأيسر: بطاقة الولاء (FUT Card Style) والمكافآت */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* بطاقة الولاء الرقمية */}
            <div className={`bg-gradient-to-br ${tier.color} p-6 rounded-2xl border ${tier.border} shadow-2xl relative overflow-hidden`}>
              <div className="absolute -right-6 -bottom-6 opacity-10">
                <Crown className="w-48 h-48 text-white" />
              </div>

              <div className="flex justify-between items-center mb-4 relative z-10">
                <span className="text-xs font-black tracking-widest uppercase bg-black/40 px-3 py-1 rounded-full border border-white/10">
                  {tier.name}
                </span>
                <Award className="w-8 h-8 text-white" />
              </div>

              <div className="my-6 relative z-10">
                <p className="text-xs text-white/70 uppercase tracking-widest font-bold">Total Loyalty Balance</p>
                <h2 className="text-5xl font-black text-white mt-1">{pts} <span className="text-lg">PTS</span></h2>
              </div>

              <div className="space-y-2 relative z-10">
                <div className="flex justify-between text-xs font-bold text-white/80">
                  <span>Tier Progress</span>
                  <span>{pts} / {tier.next} PTS</span>
                </div>
                <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-[#00AEEF] transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* عرض كود الخصم المستبدل إن وجد */}
            {redeemedCode && (
              <div className="bg-green-950/40 border border-green-500 rounded-xl p-4 text-center">
                <p className="text-xs text-green-300 font-bold uppercase mb-1">Active Discount Code</p>
                <p className="text-xl font-black text-green-400 tracking-wider font-mono">{redeemedCode}</p>
                <p className="text-xs text-gray-400 mt-1">Use this voucher code at checkout</p>
              </div>
            )}

            {/* متجر مكافآت النقاط (Redeem Rewards) */}
            <div className="bg-[#121212] p-6 rounded-2xl border border-[#1f1f1f] space-y-4">
              <h3 className="font-bold text-lg border-b border-[#222] pb-3 flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-400" /> Redeem Rewards
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-[#1a1a1a] rounded-xl border border-[#262626]">
                  <div>
                    <p className="font-bold text-sm">$5.00 Off Voucher</p>
                    <p className="text-xs text-gray-400">Requires 100 PTS</p>
                  </div>
                  <button
                    onClick={() => handleRedeemReward(100, 5)}
                    className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold px-4 py-2 rounded-lg transition"
                  >
                    Redeem
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-[#1a1a1a] rounded-xl border border-[#262626]">
                  <div>
                    <p className="font-bold text-sm">$15.00 Off Voucher</p>
                    <p className="text-xs text-gray-400">Requires 250 PTS</p>
                  </div>
                  <button
                    onClick={() => handleRedeemReward(250, 15)}
                    className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold px-4 py-2 rounded-lg transition"
                  >
                    Redeem
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* العمود الأيمن: سجل الطلبات (My Order History) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#121212] p-6 md:p-8 rounded-2xl border border-[#1f1f1f]">
              <div className="flex justify-between items-center mb-6 border-b border-[#222] pb-4">
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#00AEEF]" /> My Order History
                </h3>
                <button 
                  onClick={fetchCustomerData} 
                  className="text-xs text-[#00AEEF] hover:underline flex items-center gap-1 font-bold"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="font-bold text-lg mb-1">No orders yet</p>
                  <p className="text-gray-400 text-sm mb-6">Start shopping to earn points on your first kit!</p>
                  <Link 
                    href="/catalog"
                    className="bg-[#00AEEF] hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition text-sm inline-block"
                  >
                    Explore 26/27 Catalog
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-[#181818] p-5 rounded-xl border border-[#262626] space-y-3">
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-mono">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase flex items-center gap-1 ${
                          order.status === 'Delivered' 
                            ? 'bg-green-950/60 text-green-400 border border-green-500/40' 
                            : 'bg-yellow-950/60 text-yellow-400 border border-yellow-500/40'
                        }`}>
                          {order.status === 'Delivered' ? <CheckCircle2 className="w-3 h-3"/> : <Clock className="w-3 h-3"/>}
                          {order.status}
                        </span>
                      </div>

                      {/* قائمة قطع البدلات المطلوبة */}
                      <div className="space-y-1 py-2 border-y border-[#242424]">
                        {Array.isArray(order.items) && order.items.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-300">{item.quantity}x {item.title}</span>
                            <span className="text-white font-semibold">${item.price}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <div>
                          <span className="text-xs text-gray-400">Total Paid: </span>
                          <span className="font-extrabold text-[#00AEEF]">${order.total_amount}</span>
                          <span className="text-[11px] text-amber-400 font-bold ml-3">
                            (+{order.points_earned || 0} PTS)
                          </span>
                        </div>

                        {/* زر إعادة طلب نفس البدلات فوراً */}
                        <button
                          onClick={() => handleReorder(order.items)}
                          className="text-xs bg-[#222] hover:bg-[#00AEEF] hover:text-white text-gray-300 font-bold px-3.5 py-2 rounded-lg transition border border-[#333]"
                        >
                          Reorder Items
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}