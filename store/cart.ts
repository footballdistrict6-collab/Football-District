import { create } from 'zustand';

interface CartItem {
  id: string | number;
  title: string;
  price: string;
  image: string;
  quantity: number;
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