"use client";

import { useState } from 'react';
import { X, Ruler, User, Info, Shirt } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  // للتحكم بالتبويب النشط (Player أو Fan)
  const [activeTab, setActiveTab] = useState<'player' | 'fan'>('player');

  if (!isOpen) return null;

  // بيانات نسخة اللاعبين (Player Version)
  const playerSizeData = [
    { size: 'S', length: '69 CM', width: '49-51 CM', height: '162-170 CM', weight: '50-62 KG' },
    { size: 'M', length: '69-71 CM', width: '51-53 CM', height: '170-176 CM', weight: '62-78 KG' },
    { size: 'L', length: '71-73 CM', width: '53-55 CM', height: '176-182 CM', weight: '78-83 KG' },
    { size: 'XL', length: '73-75 CM', width: '55-57 CM', height: '182-190 CM', weight: '83-90 KG' },
  ];

  // بيانات نسخة الجماهير (Fan Version)
  const fanSizeData = [
    { size: 'S', length: '70 CM', width: '100 CM', height: '165-170 CM', weight: '50-60 KG' },
    { size: 'M', length: '73 CM', width: '104 CM', height: '170-175 CM', weight: '60-70 KG' },
    { size: 'L', length: '75 CM', width: '108 CM', height: '175-180 CM', weight: '70-80 KG' },
    { size: 'XL', length: '77 CM', width: '112 CM', height: '175-185 CM', weight: '80-90 KG' },
  ];

  const currentData = activeTab === 'player' ? playerSizeData : fanSizeData;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* الخلفية المظلمة */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* صندوق الدليل */}
      <div className="relative w-full max-w-2xl bg-[#0d0d0d] border border-[#222] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* الترويسة */}
        <div className="flex items-center justify-between p-6 border-b border-[#222] bg-[#121212]">
          <h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Ruler className="w-5 h-5 text-[#00AEEF]" /> 
            Size <span className="text-[#00AEEF]">Chart</span>
          </h2>
          <button 
            onClick={onClose}
            className="p-2 bg-[#1a1a1a] text-gray-400 hover:text-white rounded-full transition border border-[#333]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* أزرار التبويبات (Tabs) */}
        <div className="p-6 pb-2">
          <div className="flex bg-[#1a1a1a] rounded-xl p-1 border border-[#2b2b2b]">
            <button
              onClick={() => setActiveTab('player')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'player' 
                  ? 'bg-[#00AEEF] text-white shadow-md' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Shirt className="w-4 h-4" /> Player Version
            </button>
            <button
              onClick={() => setActiveTab('fan')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'fan' 
                  ? 'bg-[#00AEEF] text-white shadow-md' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <User className="w-4 h-4" /> Fan Version
            </button>
          </div>
        </div>

        {/* الجدول التفاعلي */}
        <div className="p-6 pt-2 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222]">
                <th className="py-3 px-4 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Size</th>
                <th className="py-3 px-4 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Length</th>
                <th className="py-3 px-4 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Width</th>
                <th className="py-3 px-4 text-xs font-extrabold text-[#00AEEF] uppercase tracking-wider">
                  Height & Weight
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f1f]">
              {currentData.map((row) => (
                <tr key={row.size} className="hover:bg-[#161616] transition duration-200">
                  <td className="py-4 px-4">
                    <span className="w-8 h-8 flex items-center justify-center bg-[#1a1a1a] border border-[#333] rounded-lg font-black text-white text-sm">
                      {row.size}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-gray-300">{row.length}</td>
                  <td className="py-4 px-4 text-sm font-bold text-gray-300">{row.width}</td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col text-sm font-bold">
                      <span className="text-white">{row.height}</span>
                      <span className="text-gray-500 text-xs mt-0.5">{row.weight}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ملاحظة سفلية ديناميكية تتغير حسب نوع التيشيرت */}
        <div className="p-4 bg-[#121212] border-t border-[#222] flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-400 leading-relaxed font-medium">
            <strong className="text-white">Fit Advice: </strong> 
            {activeTab === 'player' 
              ? 'Player version kits feature an athletic, slim fit designed for performance. If you prefer a looser fit, we highly recommend choosing one size larger than your usual standard size.' 
              : 'Fan version kits feature a standard, relaxed fit designed for everyday comfort. You can comfortably choose your regular size.'}
          </p>
        </div>

      </div>
    </div>
  );
}