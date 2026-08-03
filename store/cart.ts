import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // 👈 استدعاء خاصية الحفظ

export interface CartItem {
  id: string;
  title: string;
  price: string;
  image: string;
  quantity: number;
  category?: string;
  loyalty_points_earned?: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  // إذا كان لديك دوال أخرى مثل تقليل الكمية ضعها هنا
}

// 👈 تغليف الـ Store بـ persist
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      // دالة الإضافة
      addItem: (newItem) => set((state) => {
        const existingItem = state.items.find((item) => item.id === newItem.id);
        if (existingItem) {
          return {
            items: state.items.map((item) =>
              item.id === newItem.id
                ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
                : item
            ),
          };
        }
        return { items: [...state.items, newItem] };
      }),

      // دالة الحذف
      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),

      // دالة تفريغ السلة
      clearCart: () => set({ items: [] }),
      
      // إذا كان لديك دوال أخرى في ملفك الحالي، انسخها وضعها هنا...
    }),
    {
      name: 'football-district-cart', // 👈 هذا هو اسم الملف الذي سيُحفظ في المتصفح
    }
  )
);