import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  // أضفنا تعريف دالة تحديث الكمية هنا
  updateQuantity: (id: string, quantity: number) => void; 
}

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

      // دالة تحديث الكمية (التي كانت تسبب الخطأ)
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map((item) =>
          item.id === id
            // نستخدم Math.max لضمان أن الكمية لا تقل عن 1 أبداً
            ? { ...item, quantity: Math.max(1, quantity) } 
            : item
        ),
      })),

    }),
    {
      name: 'football-district-cart', // اسم الملف المحفوظ في ذاكرة المتصفح
    }
  )
);