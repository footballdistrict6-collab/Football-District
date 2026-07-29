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

  cartCount: () => get().items.reduce((total, item) => total + item.quantity, 0),

  // وظيفة تفريغ السلة
  clearCart: () => set({ items: [] }),
}));