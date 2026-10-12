import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ShieldCheck,
  RefreshCcw,
  LogOut,
  LayoutDashboard,
  UtensilsCrossed,
  ChefHat,
  Users,
  TableProperties,
  Plus,
  Edit3,
  Activity,
  TrendingUp,
} from 'lucide-react'
import { api } from '../services/api'
import { useStore } from '../store/useStore'
import { formatCurrency, statusLabel, statusClass } from '../utils/format'
import { PageLoader, EmptyState } from '../components/ui/Loader'
import { Badge } from '../components/ui/Card'
import type { Table, Product, Order, Category, User } from '../types'

type AdminTab = 'overview' | 'tables' | 'products' | 'orders' | 'users'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [tables, setTables] = useState<Table[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshMessage, setRefreshMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const { token, role, logout } = useStore()

  const fetchAll = async () => {
    if (!token || role !== 'ADMIN') {
      navigate('/staff/login')
      return false
    }
    try {
      const [tablesRes, productsRes, ordersRes, categoriesRes, usersRes] = await Promise.all([
        api.get('/tables'),
        api.get('/products'),
        api.get('/orders'),
        api.get('/categories'),
        api.get('/users'),
      ])
      setTables(tablesRes.data.data ?? [])
      setProducts(productsRes.data.data ?? [])
      setOrders(ordersRes.data.data ?? [])
      setCategories(categoriesRes.data.data ?? [])
      setUsers(usersRes.data.data ?? [])
      setLastUpdated(new Date())
      return true
    } catch {
      return false
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [token])

  const handleRefresh = async () => {
    setRefreshing(true)
    setRefreshMessage(null)
    const success = await fetchAll()
    setRefreshMessage(success
      ? { type: 'success', text: 'Đã cập nhật dữ liệu mới nhất.' }
      : { type: 'error', text: 'Không thể cập nhật dữ liệu. Hãy kiểm tra backend.' })
    window.setTimeout(() => setRefreshMessage(null), 3000)
  }

  const handleLogout = () => {
    logout()
    navigate('/staff/login')
  }

  const addTable = async () => {
    const tableNumber = window.prompt('Số bàn (ví dụ A05):')?.trim()
    if (!tableNumber) return
    const capacity = Number(window.prompt('Sức chứa:', '4'))
    if (!Number.isInteger(capacity) || capacity < 1) return window.alert('Sức chứa không hợp lệ.')
    try {
      await api.post('/tables', { tableNumber, capacity, status: 'AVAILABLE' })
      await fetchAll()
    } catch { window.alert('Không thể thêm bàn. Số bàn có thể đã tồn tại.') }
  }

  const saveProduct = async (product?: Product) => {
    const name = window.prompt('Tên món:', product?.name ?? '')?.trim()
    if (!name) return
    const description = window.prompt('Mô tả:', product?.description ?? '') ?? ''
    const price = Number(window.prompt('Giá (VND):', String(product?.price ?? 50000)))
    const categoryId = Number(window.prompt(
      `ID danh mục (${categories.map((c) => `${c.id}: ${c.name}`).join(', ')}):`,
      String(product?.categoryId ?? categories[0]?.id ?? ''),
    ))
    if (price <= 0 || !categories.some((category) => category.id === categoryId)) {
      return window.alert('Giá hoặc danh mục không hợp lệ.')
    }
    const imageUrl = window.prompt('URL hình ảnh (có thể để trống):', product?.imageUrl ?? '')?.trim() ?? ''
    const availableAnswer = window.prompt('Trạng thái: AVAILABLE hoặc UNAVAILABLE', product?.available === false ? 'UNAVAILABLE' : 'AVAILABLE')?.trim().toUpperCase() ?? ''
    if (!['AVAILABLE', 'UNAVAILABLE'].includes(availableAnswer)) {
      return window.alert('Trạng thái không hợp lệ.')
    }
    const payload = { name, description, price, categoryId, imageUrl, available: availableAnswer === 'AVAILABLE' }
    try {
      if (product) await api.put(`/products/${product.id}`, payload)
      else await api.post('/products', payload)
      await fetchAll()
    } catch { window.alert('Không thể lưu sản phẩm.') }
  }

  const saveCategory = async (category?: Category) => {
    const name = window.prompt('Tên danh mục:', category?.name ?? '')?.trim()
    if (!name) return
    const description = window.prompt('Mô tả danh mục:', category?.description ?? '')?.trim() ?? ''
    try {
      if (category) await api.put(`/categories/${category.id}`, { name, description })
      else await api.post('/categories', { name, description })
      await fetchAll()
    } catch {
      window.alert('Không thể lưu danh mục. Tên danh mục có thể đã tồn tại.')
    }
  }

  const addUser = async () => {
    const username = window.prompt('Tên đăng nhập:')?.trim()
    if (!username) return
    const password = window.prompt('Mật khẩu (ít nhất 6 ký tự):') ?? ''
    const fullName = window.prompt('Họ tên:')?.trim()
    const roleValue = window.prompt('Vai trò: ADMIN, STAFF hoặc KITCHEN', 'STAFF')?.toUpperCase()
    if (!fullName || password.length < 6 || !['ADMIN', 'STAFF', 'KITCHEN'].includes(roleValue ?? '')) {
      return window.alert('Thông tin tài khoản không hợp lệ.')
    }
    try {
      await api.post('/users', { username, password, fullName, role: roleValue })
      await fetchAll()
    } catch { window.alert('Không thể tạo tài khoản. Tên đăng nhập có thể đã tồn tại.') }
  }

  // Stats
  const availableTables = tables.filter((t) => t.status === 'AVAILABLE').length
  const occupiedTables = tables.filter((t) => t.status === 'OCCUPIED').length
  const availableProducts = products.filter((p) => p.available).length
  const pendingOrders = orders.filter((o) => o.status === 'PENDING').length
  const totalRevenue = orders
    .filter((o) => ['SERVED', 'COMPLETED'].includes(o.status))
    .reduce((sum, o) => sum + o.totalAmount, 0)

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Tổng quan', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'tables', label: 'Bàn', icon: <TableProperties className="w-4 h-4" /> },
    { id: 'products', label: 'Sản phẩm', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { id: 'orders', label: 'Đơn hàng', icon: <Activity className="w-4 h-4" /> },
    { id: 'users', label: 'Tài khoản', icon: <Users className="w-4 h-4" /> },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm px-4 py-4">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-extrabold text-slate-900">Quản trị viên</h1>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-64"><PageLoader /></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-purple-500">QRFood</p>
              <h1 className="text-base font-extrabold text-slate-900">Quản trị viên</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="hidden text-xs text-slate-400 lg:inline">
                Cập nhật lúc {lastUpdated.toLocaleTimeString('vi-VN', {
                  hour: '2-digit', minute: '2-digit', second: '2-digit',
                })}
              </span>
            )}
            <button
              id="admin-refresh-btn"
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-all font-medium disabled:opacity-50"
            >
              <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Cập nhật</span>
            </button>
            <button
              id="admin-logout-btn"
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 pb-0 flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`admin-tab-${tab.id}`}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all',
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700',
              ].join(' ')}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {refreshMessage && (
        <div className="fixed right-4 top-20 z-50 animate-fade-in">
          <div className={`rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${
            refreshMessage.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}>
            {refreshMessage.text}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* KPI cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-children">
              {[
                {
                  label: 'Bàn trống',
                  value: availableTables,
                  total: tables.length,
                  icon: <TableProperties className="w-5 h-5" />,
                  color: 'text-emerald-600 bg-emerald-100',
                },
                {
                  label: 'Bàn đang dùng',
                  value: occupiedTables,
                  total: tables.length,
                  icon: <Users className="w-5 h-5" />,
                  color: 'text-orange-600 bg-orange-100',
                },
                {
                  label: 'Sản phẩm',
                  value: availableProducts,
                  total: products.length,
                  icon: <UtensilsCrossed className="w-5 h-5" />,
                  color: 'text-blue-600 bg-blue-100',
                },
                {
                  label: 'Chờ xác nhận',
                  value: pendingOrders,
                  total: null,
                  icon: <Activity className="w-5 h-5" />,
                  color: 'text-amber-600 bg-amber-100',
                },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-fade-in-up">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}>
                    {kpi.icon}
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900">
                    {kpi.value}
                    {kpi.total !== null && (
                      <span className="text-sm font-medium text-slate-400">/{kpi.total}</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{kpi.label}</p>
                </div>
              ))}
            </div>

            {/* Revenue card */}
            <div className="bg-gradient-to-br from-purple-600 to-violet-700 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-purple-200 mb-2">Doanh thu (hoàn thành)</p>
                  <p className="text-4xl font-extrabold">{formatCurrency(totalRevenue)}</p>
                  <p className="text-sm text-purple-200 mt-1">
                    Từ {orders.filter((o) => ['SERVED', 'COMPLETED'].includes(o.status)).length} đơn hoàn thành
                  </p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Quick links to other dashboards */}
            <div className="grid sm:grid-cols-2 gap-3">
              <Link
                to="/staff/dashboard"
                id="goto-staff-dashboard"
                className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-blue-200 hover:shadow-md transition-all card-hover"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Dashboard Nhân viên</p>
                  <p className="text-sm text-slate-400">Quản lý và xác nhận đơn hàng</p>
                </div>
              </Link>
              <Link
                to="/kitchen/dashboard"
                id="goto-kitchen-dashboard"
                className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-amber-200 hover:shadow-md transition-all card-hover"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <ChefHat className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Dashboard Bếp</p>
                  <p className="text-sm text-slate-400">Theo dõi tiến độ nấu ăn</p>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* TABLES TAB */}
        {activeTab === 'tables' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-lg">Danh sách bàn ({tables.length})</h2>
              <button
                id="add-table-btn"
                type="button"
                onClick={addTable}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                Thêm bàn
              </button>
            </div>

            {tables.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                <EmptyState icon={<TableProperties className="w-8 h-8" />} title="Chưa có bàn nào" />
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
                {tables.map((table) => (
                  <div
                    key={table.id}
                    id={`table-card-${table.id}`}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-fade-in-up"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
                        <span className="text-white font-extrabold text-sm">{table.tableNumber}</span>
                      </div>
                      <Badge className={statusClass[table.status] ?? 'bg-slate-100 text-slate-600'}>
                        {statusLabel[table.status] ?? table.status}
                      </Badge>
                    </div>
                    <p className="font-bold text-slate-900">{table.tableNumber}</p>
                    <p className="text-sm text-slate-400">{table.capacity} chỗ ngồi</p>

                    <div className={`mt-3 h-1.5 rounded-full ${table.status === 'AVAILABLE' ? 'bg-emerald-200' : 'bg-orange-200'}`}>
                      <div
                        className={`h-full rounded-full transition-all ${table.status === 'AVAILABLE' ? 'bg-emerald-500 w-full' : 'bg-orange-500 w-3/4'}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Danh mục thực đơn</h2>
                  <p className="text-sm text-slate-400">Thêm hoặc đổi tên các nhóm như Burger, Pizza, Đồ uống.</p>
                </div>
                <button
                  id="add-category-btn"
                  type="button"
                  onClick={() => saveCategory()}
                  className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                >
                  <Plus className="h-4 w-4" /> Thêm danh mục
                </button>
              </div>
              {categories.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Chưa có danh mục nào.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900">{category.name}</p>
                        <p className="truncate text-xs text-slate-400">{category.description || 'Chưa có mô tả'}</p>
                        <p className="mt-1 text-xs font-medium text-orange-500">
                          {products.filter((product) => product.categoryId === category.id).length} món
                        </p>
                      </div>
                      <button
                        id={`edit-category-${category.id}`}
                        type="button"
                        onClick={() => saveCategory(category)}
                        title="Sửa danh mục"
                        className="ml-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-purple-300 hover:text-purple-600"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-lg">Sản phẩm ({products.length})</h2>
              <button
                id="add-product-btn"
                type="button"
                onClick={() => saveProduct()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                Thêm món
              </button>
            </div>

            {products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                <EmptyState icon={<UtensilsCrossed className="w-8 h-8" />} title="Chưa có sản phẩm nào" />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-50">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      id={`product-row-${product.id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors animate-fade-in"
                    >
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                        <UtensilsCrossed className="w-5 h-5 text-orange-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{product.name}</p>
                        <p className="text-sm text-slate-400 truncate">{product.description}</p>
                        <p className="mt-1 text-xs font-semibold text-purple-500">
                          {categories.find((category) => category.id === product.categoryId)?.name ?? 'Không có danh mục'}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-slate-900">{formatCurrency(product.price)}</p>
                        <Badge className={product.available ? 'status-available' : 'status-rejected'}>
                          {product.available ? 'Có sẵn' : 'Hết'}
                        </Badge>
                      </div>
                      <button
                        id={`edit-product-${product.id}`}
                        type="button"
                        onClick={() => saveProduct(product)}
                        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-purple-600 hover:border-purple-300 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="font-bold text-slate-900 text-lg">Tất cả đơn hàng ({orders.length})</h2>

            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                <EmptyState icon={<Activity className="w-8 h-8" />} title="Chưa có đơn hàng nào" />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-50">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      id={`order-row-${order.id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 font-extrabold text-xs">#{order.id}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm">
                          {order.items.length} món · Session #{order.sessionId}
                        </p>
                        <p className="text-xs text-slate-400">{order.items.map(i => i.productName).join(', ')}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-slate-900 text-sm">{formatCurrency(order.totalAmount)}</p>
                        <Badge className={statusClass[order.status] ?? 'bg-slate-100 text-slate-600'}>
                          {statusLabel[order.status] ?? order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-lg">Tài khoản ({users.length})</h2>
              <button type="button" onClick={addUser} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold">
                <Plus className="w-4 h-4" /> Thêm tài khoản
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between px-5 py-4">
                  <div><p className="font-semibold text-slate-900">{user.fullName}</p><p className="text-sm text-slate-400">{user.username}</p></div>
                  <Badge className="bg-purple-100 text-purple-700">{user.role}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
