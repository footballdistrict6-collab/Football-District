import { create } from 'zustand';

// تحديد شكل المنتج داخل السلة
interface CartItem {
  id: string | number;
  title: string;
  price: string;
  image: string;
  quantity: number;
}

// تحديد وظائف السلة
interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  cartCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  // وظيفة إضافة منتج للسلة
  addItem: (item) => set((state) => {
    // التحقق مما إذا كان المنتج موجوداً مسبقاً لزيادة الكمية فقط
    const existingItem = state.items.find((i) => i.id === item.id);
    if (existingItem) {
      return { 
        items: state.items.map((i) => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ) 
      };
    }
    // إذا كان منتجاً جديداً، أضفه للسلة
    return { items: [...state.items, { ...item, quantity: 1 }] };
  }),

  // وظيفة حساب إجمالي عدد القطع في السلة
  cartCount: () => get().items.reduce((total, item) => total + item.quantity, 0),
}));