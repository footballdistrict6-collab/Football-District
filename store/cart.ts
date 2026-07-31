import { create } from 'zustand';

export interface CartItem {
    id: string;
    title: string;
    price: string;
    image: string;
    quantity: number;
    loyalty_points_earned?: number; // <-- أضف هذا السطر هنا
    category?: string;
  }

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  cartCount: () => number;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  addItem: (item) => set((state) => {
    const existingItem = state.items.find((i) => i.id === item.id);
    if (existingItem) {
      return { 
        items: state.items.map((i) => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ) 
      };
    }
    return { items: [...state.items, { ...item, quantity: 1 }] };
  }),

  // وظيفة حذف منتج بالكامل من السلة
  removeItem: (id) => set((state) => ({
    items: state.items.filter((i) => i.id !== id)
  })),

  // وظيفة تعديل الكمية (بالزيادة أو النقصان)
  updateQuantity: (id, quantity) => set((state) => {
    if (quantity <= 0) {
      return { items: state.items.filter((i) => i.id !== id) };
    }
    return {
      items: state.items.map((i) => 
        i.id === id ? { ...i, quantity } : i
      )
    };
  }),

  cartCount: () => get().items.reduce((total, item) => total + item.quantity, 0),

  clearCart: () => set({ items: [] }),
}));