"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User, Lock, Mail, ArrowRight, Award } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      // إنشاء حساب جديد
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });

      if (error) {
        alert("Sign up failed: " + error.message);
      } else {
        // إنشاء بروفايل أولي في جدول profiles
        if (data.user) {
          await supabase.from('profiles').insert([
            {
              id: data.user.id,
              full_name: fullName,
              loyalty_points: 0,
              role: 'customer'
            }
          ]);
        }
        alert("✅ Account created successfully! Welcome to Football District.");
        router.push('/profile');
      }
    } else {
      // تسجيل الدخول لحساب قائم
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        alert("Login failed: " + error.message);
      } else {
        router.push('/profile');
      }
    }

    setLoading(false);
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen py-20 text-white flex items-center justify-center px-6">
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-8 md:p-10 max-w-md w-full shadow-2xl relative">
        
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#333] text-[#00AEEF]">
            <Award className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">
            {isSignUp ? "Create FD Account" : "Welcome Back"}
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            {isSignUp ? "Join the loyalty club & earn points on kits" : "Sign in to check your points and orders"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
                <input 
                  type="text" 
                  required 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Hussein Cherry"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3.5 pl-11 text-white text-sm focus:outline-none focus:border-[#00AEEF]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3.5 pl-11 text-white text-sm focus:outline-none focus:border-[#00AEEF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3.5 pl-11 text-white text-sm focus:outline-none focus:border-[#00AEEF]"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#00AEEF] hover:bg-blue-500 text-white font-extrabold py-4 rounded-xl transition shadow-[0_0_15px_rgba(0,174,239,0.3)] text-sm uppercase tracking-wide mt-2"
          >
            {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-[#222] pt-6">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-gray-400 hover:text-white transition"
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Create one"}
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link href="/catalog" className="text-xs text-[#00AEEF] hover:underline">
            ← Back to Store Catalog
          </Link>
        </div>

      </div>
    </div>
  );
}