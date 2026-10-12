import { create } from 'zustand'
import type { CartItem, Product, Role } from '../types'

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    return fallback
  }
}

type StoreState = {
  sessionId: number | null
  token: string
  role: Role | null
  cart: CartItem[]
  setSessionId: (id: number | null) => void
  setToken: (token: string) => void
  setRole: (role: Role) => void
  addToCart: (product: Product) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  logout: () => void
}

export const useStore = create<StoreState>((set) => ({
  sessionId: readJson<number | null>('qrfood-session-id', null),
  token: localStorage.getItem('qrfood-token') ?? '',
  role: localStorage.getItem('qrfood-role') as Role | null,
  cart: readJson<CartItem[]>('qrfood-cart', []),

  setSessionId: (sessionId) => {
    if (sessionId === null) localStorage.removeItem('qrfood-session-id')
    else localStorage.setItem('qrfood-session-id', JSON.stringify(sessionId))
    set({ sessionId })
  },

  setToken: (token) => {
    localStorage.setItem('qrfood-token', token)
    set({ token })
  },

  setRole: (role) => {
    localStorage.setItem('qrfood-role', role)
    set({ role })
  },

  addToCart: (product) =>
    set((state) => {
      const found = state.cart.find((item) => item.productId === product.id)
      if (found) {
        const cart = state.cart.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        localStorage.setItem('qrfood-cart', JSON.stringify(cart))
        return { cart }
      }
      const cart = [
          ...state.cart,
          { productId: product.id, name: product.name, price: product.price, quantity: 1 },
        ]
      localStorage.setItem('qrfood-cart', JSON.stringify(cart))
      return { cart }
    }),

  removeItem: (productId) => set((state) => {
    const cart = state.cart.filter((item) => item.productId !== productId)
    localStorage.setItem('qrfood-cart', JSON.stringify(cart))
    return { cart }
  }),

  updateQuantity: (productId, quantity) =>
    set((state) => {
      const cart =
        quantity <= 0
          ? state.cart.filter((item) => item.productId !== productId)
          : state.cart.map((item) =>
              item.productId === productId ? { ...item, quantity } : item,
            )
      localStorage.setItem('qrfood-cart', JSON.stringify(cart))
      return { cart }
    }),

  clearCart: () => {
    localStorage.removeItem('qrfood-cart')
    set({ cart: [] })
  },

  logout: () => {
    localStorage.removeItem('qrfood-token')
    localStorage.removeItem('qrfood-role')
    set({ token: '', role: null })
  },
}))
