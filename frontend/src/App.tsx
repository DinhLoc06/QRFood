import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { BrowserRouter, Link, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { create } from 'zustand'
import { ChefHat, ShieldCheck, UtensilsCrossed, User2, ArrowRight } from 'lucide-react'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
})

type Product = {
  id: number
  categoryId: number
  name: string
  description: string
  price: number
  imageUrl?: string
  available: boolean
}

type Order = {
  id: number
  sessionId: number
  status: string
  totalAmount: number
  note?: string
  createdAt: string
  rejectedReason?: string
  items: Array<{
    id: number
    productId: number
    productName: string
    quantity: number
    unitPrice: number
    subtotal: number
    note?: string
  }>
}

type CartItem = {
  productId: number
  name: string
  price: number
  quantity: number
}

type SessionData = {
  id: number
  tableNumber: string
  numberOfPeople: number
  status: string
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)

const useStore = create<{
  sessionId: number | null
  token: string
  cart: CartItem[]
  setSessionId: (id: number | null) => void
  setToken: (token: string) => void
  addToCart: (product: Product) => void
  removeItem: (productId: number) => void
  clearCart: () => void
}>((set) => ({
  sessionId: null,
  token: localStorage.getItem('qrfood-token') ?? '',
  cart: [],
  setSessionId: (sessionId) => set({ sessionId }),
  setToken: (token) => {
    localStorage.setItem('qrfood-token', token)
    set({ token })
  },
  addToCart: (product) =>
    set((state) => {
      const found = state.cart.find((item) => item.productId === product.id)
      if (found) {
        return {
          cart: state.cart.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        }
      }
      return {
        cart: [...state.cart, { productId: product.id, name: product.name, price: product.price, quantity: 1 }],
      }
    }),
  removeItem: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.productId !== productId),
    })),
  clearCart: () => set({ cart: [] }),
}))

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/start" element={<StartPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order/:id" element={<OrderPage />} />
          <Route path="/staff/login" element={<StaffLogin />} />
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/kitchen/dashboard" element={<KitchenDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

function HomePage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-8 p-6">
      <div className="rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 p-8 text-white shadow-xl">
        <div className="mb-6 flex items-center gap-3">
          <ChefHat className="h-10 w-10" />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-orange-100">QRFood</p>
            <h1 className="text-4xl font-black">Restaurant QR Ordering</h1>
          </div>
        </div>
        <p className="max-w-xl text-base text-orange-50">
          Scan the QR, choose your table, browse the menu, and place your order without waiting in line.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FeatureCard title="Customer" description="No login required for dining flow." icon={<User2 className="h-5 w-5" />} route="/start" />
        <FeatureCard title="Staff" description="Confirm and serve orders quickly." icon={<UtensilsCrossed className="h-5 w-5" />} route="/staff/login" />
        <FeatureCard title="Kitchen" description="Track order preparation and readiness." icon={<ChefHat className="h-5 w-5" />} route="/kitchen/dashboard" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Admin</h2>
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
        </div>
        <Link to="/admin/dashboard" className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          Open admin dashboard <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

function FeatureCard({ title, description, icon, route }: { title: string; description: string; icon: ReactNode; route: string }) {
  return (
    <Link to={route} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-bold">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
    </Link>
  )
}

function StartPage() {
  const navigate = useNavigate()
  const { setSessionId, setToken } = useStore()
  const form = useForm({
    resolver: zodResolver(z.object({ numberOfPeople: z.coerce.number().min(1).max(20) })),
    defaultValues: { numberOfPeople: 4 },
  })

  const onSubmit = async (values: { numberOfPeople: number }) => {
    try {
      const response = await api.post('/sessions', { numberOfPeople: values.numberOfPeople })
      const session = response.data.data as SessionData
      setSessionId(session.id)
      setToken('')
      navigate('/menu')
    } catch (error) {
      console.error(error)
      alert('No suitable table is available right now. Please try again later.')
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-3xl bg-white p-6 shadow-lg">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">Start dining</p>
        <h1 className="mb-6 text-3xl font-black">How many people?</h1>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Number of guests</span>
            <input
              type="number"
              min={1}
              max={20}
              {...form.register('numberOfPeople')}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500"
            />
          </label>
          <button type="submit" className="w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white hover:bg-orange-600">
            Create session
          </button>
        </form>
      </div>
    </div>
  )
}

function MenuPage() {
  const [products, setProducts] = useState<Product[]>([])
  const { addToCart } = useStore()

  useEffect(() => {
    api.get('/products').then((response) => setProducts(response.data.data ?? [])).catch(() => setProducts([]))
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">Menu</p>
          <h1 className="text-3xl font-black">Today's selection</h1>
        </div>
        <Link to="/cart" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          View cart
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-40 bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-50 p-4">
              <div className="flex h-full items-end justify-between">
                <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                  {product.available ? 'Available' : 'Sold out'}
                </span>
                <span className="rounded-full bg-slate-900 px-2 py-1 text-xs font-semibold text-white">
                  {formatCurrency(product.price)}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="mb-1 text-xl font-bold">{product.name}</h3>
              <p className="mb-4 min-h-12 text-sm text-slate-600">{product.description}</p>
              <button
                type="button"
                onClick={() => addToCart(product)}
                disabled={!product.available}
                className="w-full rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Add to cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CartPage() {
  const navigate = useNavigate()
  const cart = useStore((state) => state.cart)
  const sessionId = useStore((state) => state.sessionId)
  const clearCart = useStore((state) => state.clearCart)

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  )

  const submitOrder = async () => {
    if (!sessionId) {
      navigate('/start')
      return
    }

    try {
      const response = await api.post('/orders', {
        sessionId,
        items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      })
      const orderId = response.data.data.id
      clearCart()
      navigate(`/order/${orderId}`)
    } catch (error) {
      console.error(error)
      alert('Unable to place order right now. Please check the session and menu.')
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-black">Your cart</h1>
        <Link to="/menu" className="text-sm font-medium text-orange-600">Continue shopping</Link>
      </div>

      <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
        {cart.length === 0 ? (
          <p className="py-10 text-center text-slate-500">Your cart is empty.</p>
        ) : (
          cart.map((item) => (
            <div key={item.productId} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-slate-500">
                  {item.quantity} x {formatCurrency(item.price)}
                </p>
              </div>
              <div className="font-bold text-slate-800">{formatCurrency(item.price * item.quantity)}</div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-white">
        <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <button
          type="button"
          onClick={submitOrder}
          disabled={cart.length === 0}
          className="w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-700"
        >
          Place order
        </button>
      </div>
    </div>
  )
}

function OrderPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (!id) return
    api.get(`/orders/${id}`).then((response) => setOrder(response.data.data)).catch(() => setOrder(null))
  }, [id])

  const statusSteps = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED']
  const activeIndex = order ? statusSteps.indexOf(order.status) : -1

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-3xl bg-white p-6 shadow-lg">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">Order tracking</p>
        {order ? (
          <>
            <h1 className="text-3xl font-black">#{order.id}</h1>
            <p className="mb-6 text-slate-600">Status: <span className="font-bold text-orange-600">{order.status}</span></p>
            <div className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-6">
              {statusSteps.map((step, index) => (
                <div key={step} className={`rounded-lg border p-2 text-center text-xs font-semibold ${index <= activeIndex ? 'border-orange-500 bg-orange-100 text-orange-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                  {step}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-slate-200 py-3">
                  <div>
                    <p className="font-semibold">{item.productName}</p>
                    <p className="text-sm text-slate-500">Qty {item.quantity}</p>
                  </div>
                  <div className="font-bold">{formatCurrency(item.subtotal)}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-right text-lg font-bold">Total: {formatCurrency(order.totalAmount)}</div>
          </>
        ) : (
          <p className="text-slate-500">Loading order...</p>
        )}
      </div>
    </div>
  )
}

function StaffLogin() {
  const navigate = useNavigate()
  const { setToken } = useStore()
  const [errorMessage, setErrorMessage] = useState('')
  const form = useForm({
    defaultValues: { username: 'admin', password: 'admin123' },
  })

  const onSubmit = async (values: { username: string; password: string }) => {
    setErrorMessage('')
    try {
      const response = await api.post('/auth/login', values)
      setToken(response.data.data.token)
      navigate('/staff/dashboard')
    } catch (error: unknown) {
      console.error(error)
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ??
            (error.response ? `Login failed (${error.response.status})` : 'Cannot connect to the backend. Check that it is running.'),
        )
      } else {
        setErrorMessage('Login failed. Please try again.')
      }
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-3xl bg-white p-6 shadow-lg">
        <h1 className="mb-4 text-3xl font-black">Staff login</h1>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <input {...form.register('username')} className="w-full rounded-xl border px-4 py-3" placeholder="Username" />
          <input type="password" {...form.register('password')} className="w-full rounded-xl border px-4 py-3" placeholder="Password" />
          {errorMessage && <p role="alert" className="text-sm text-red-600">{errorMessage}</p>}
          <button type="submit" className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white">Login</button>
        </form>
      </div>
    </div>
  )
}

function StaffDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const token = useStore((state) => state.token)

  useEffect(() => {
    if (!token) return
    api.get('/orders', { headers: { Authorization: `Bearer ${token}` } }).then((response) => setOrders(response.data.data ?? [])).catch(() => setOrders([]))
  }, [token])

  const updateStatus = async (id: number, action: 'confirm' | 'reject' | 'status', status?: string) => {
    if (!token) return
    try {
      if (action === 'confirm') await api.put(`/orders/${id}/confirm`, {}, { headers: { Authorization: `Bearer ${token}` } })
      if (action === 'reject') await api.put(`/orders/${id}/reject?reason=Requested+change`, {}, { headers: { Authorization: `Bearer ${token}` } })
      if (action === 'status' && status) await api.put(`/orders/${id}/status?status=${status}`, {}, { headers: { Authorization: `Bearer ${token}` } })
      const response = await api.get('/orders', { headers: { Authorization: `Bearer ${token}` } })
      setOrders(response.data.data ?? [])
    } catch (error) {
      console.error(error)
      alert('Unable to update order. Check staff permissions.')
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">Staff dashboard</p>
          <h1 className="text-3xl font-black">Orders</h1>
        </div>
      </div>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-lg font-bold">Order #{order.id}</p>
                <p className="text-sm text-slate-500">{order.status}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => updateStatus(order.id, 'confirm')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Confirm</button>
                <button type="button" onClick={() => updateStatus(order.id, 'reject')} className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white">Reject</button>
                <button type="button" onClick={() => updateStatus(order.id, 'status', 'READY')} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white">Serve</button>
              </div>
            </div>
            {order.items.map((item) => (
              <div key={item.id} className="text-sm text-slate-600">
                {item.productName} x {item.quantity}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function KitchenDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const token = useStore((state) => state.token)

  useEffect(() => {
    if (!token) return
    api.get('/orders', { headers: { Authorization: `Bearer ${token}` } }).then((response) => setOrders(response.data.data ?? [])).catch(() => setOrders([]))
  }, [token])

  const updateStatus = async (id: number, status: string) => {
    if (!token) return
    try {
      await api.put(`/orders/${id}/status?status=${status}`, {}, { headers: { Authorization: `Bearer ${token}` } })
      const response = await api.get('/orders', { headers: { Authorization: `Bearer ${token}` } })
      setOrders(response.data.data ?? [])
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-black">Kitchen dashboard</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-lg font-bold">Order #{order.id}</p>
              <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">{order.status}</span>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => updateStatus(order.id, 'PREPARING')} className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white">Start prep</button>
              <button type="button" onClick={() => updateStatus(order.id, 'READY')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Mark ready</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminDashboard() {
  const [tables, setTables] = useState<Array<{ id: number; tableNumber: string; capacity: number; status: string }>>([])
  const [products, setProducts] = useState<Product[]>([])
  const token = useStore((state) => state.token)

  useEffect(() => {
    if (!token) return
    api.get('/tables', { headers: { Authorization: `Bearer ${token}` } }).then((r) => setTables(r.data.data ?? [])).catch(() => setTables([]))
    api.get('/products', { headers: { Authorization: `Bearer ${token}` } }).then((r) => setProducts(r.data.data ?? [])).catch(() => setProducts([]))
  }, [token])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-black">Admin dashboard</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Tables</h2>
          <div className="space-y-2">
            {tables.map((table) => (
              <div key={table.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <span>{table.tableNumber}</span>
                <span className="text-sm text-slate-500">{table.capacity} seats</span>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold">{table.status}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Products</h2>
          <div className="space-y-2">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <span>{product.name}</span>
                <span className="text-sm text-slate-500">{formatCurrency(product.price)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
