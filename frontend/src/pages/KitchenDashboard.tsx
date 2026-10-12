import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChefHat, RefreshCcw, LogOut, Flame, CheckCircle2, Clock } from 'lucide-react'
import { api } from '../services/api'
import { useStore } from '../store/useStore'
import { formatCurrency, formatDate, statusLabel, statusClass } from '../utils/format'
import { PageLoader, EmptyState } from '../components/ui/Loader'
import { Badge } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import type { Order } from '../types'

function KitchenOrderCard({ order, onUpdate }: {
  order: Order
  onUpdate: (id: number, status: string) => Promise<void>
}) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpdate = async (status: string) => {
    setLoading(status)
    await onUpdate(order.id, status)
    setLoading(null)
  }

  const canStartPrep = order.status === 'CONFIRMED'
  const canMarkReady = order.status === 'PREPARING'

  // Time elapsed
  const createdAt = new Date(order.createdAt)
  const minutesElapsed = Math.floor((Date.now() - createdAt.getTime()) / 60000)
  const isUrgent = minutesElapsed > 15 && ['CONFIRMED', 'PREPARING'].includes(order.status)

  return (
    <div
      className={[
        'bg-white rounded-2xl border shadow-sm overflow-hidden animate-fade-in-up transition-all',
        isUrgent ? 'border-orange-300 shadow-orange-100' : 'border-slate-100',
      ].join(' ')}
    >
      {/* Header */}
      <div className={`px-5 py-4 border-b border-slate-50 ${isUrgent ? 'bg-orange-50' : ''}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-extrabold text-slate-900 text-xl">#{order.id}</p>
              {isUrgent && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold">
                  <Flame className="w-3 h-3" />
                  Khẩn
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(order.createdAt)}
              {minutesElapsed > 0 && (
                <span className={`ml-1 font-semibold ${isUrgent ? 'text-orange-500' : 'text-slate-500'}`}>
                  ({minutesElapsed} phút trước)
                </span>
              )}
            </p>
          </div>
          <Badge className={statusClass[order.status] ?? 'bg-slate-100 text-slate-600'}>
            {statusLabel[order.status] ?? order.status}
          </Badge>
        </div>
      </div>

      {/* Items */}
      <div className="px-5 py-4">
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                  <ChefHat className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{item.productName}</p>
                  <p className="text-xs text-slate-400">{formatCurrency(item.unitPrice)}</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center">
                <span className="text-white font-bold text-sm">×{item.quantity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {(canStartPrep || canMarkReady) && (
        <div className="px-5 py-4 border-t border-slate-50 flex gap-2">
          {canStartPrep && (
            <Button
              id={`start-prep-${order.id}`}
              variant="primary"
              size="sm"
              loading={loading === 'PREPARING'}
              onClick={() => handleUpdate('PREPARING')}
            >
              <Flame className="w-3.5 h-3.5" />
              Bắt đầu chuẩn bị
            </Button>
          )}
          {canMarkReady && (
            <Button
              id={`mark-ready-${order.id}`}
              variant="success"
              size="sm"
              loading={loading === 'READY'}
              onClick={() => handleUpdate('READY')}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã sẵn sàng
            </Button>
          )}
        </div>
      )}

      {/* Ready state */}
      {order.status === 'READY' && (
        <div className="mx-5 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <p className="text-sm font-semibold text-emerald-700">Sẵn sàng phục vụ!</p>
        </div>
      )}
    </div>
  )
}

export default function KitchenDashboard() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { token, role, logout } = useStore()

  const fetchOrders = async () => {
    if (!token || !role || !['ADMIN', 'KITCHEN'].includes(role)) {
      navigate('/staff/login')
      return
    }
    try {
      const response = await api.get('/orders')
      const kitchenOrders = (response.data.data ?? []).filter((o: Order) =>
        ['CONFIRMED', 'PREPARING', 'READY'].includes(o.status),
      )
      setOrders(kitchenOrders)
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 10000)
    return () => clearInterval(interval)
  }, [token])

  const handleUpdate = async (id: number, status: string) => {
    try {
      await api.put(`/orders/${id}/status?status=${status}`, {})
      await fetchOrders()
    } catch {
      alert('Không thể cập nhật trạng thái.')
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchOrders()
  }

  const handleLogout = () => {
    logout()
    navigate('/staff/login')
  }

  const preparingOrders = orders.filter((o) => o.status === 'PREPARING')
  const confirmedOrders = orders.filter((o) => o.status === 'CONFIRMED')
  const readyOrders = orders.filter((o) => o.status === 'READY')

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm px-4 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-extrabold text-slate-900">Bếp</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-64"><PageLoader /></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-amber-50/30">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-500">QRFood</p>
              <h1 className="text-base font-extrabold text-slate-900">Bếp</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="kitchen-refresh-btn"
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-all font-medium disabled:opacity-50"
            >
              <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Cập nhật</span>
            </button>
            <button
              id="kitchen-logout-btn"
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all font-medium"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Live stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Mới vào', value: confirmedOrders.length, color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400' },
            { label: 'Đang nấu', value: preparingOrders.length, color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
            { label: 'Sẵn sàng', value: readyOrders.length, color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
              <p className={`text-2xl font-extrabold mb-1 rounded-xl px-2 py-1 inline-block ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Preparing (top priority) */}
        {preparingOrders.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <h2 className="font-bold text-slate-900">Đang nấu ({preparingOrders.length})</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 stagger-children">
              {preparingOrders.map((order) => (
                <KitchenOrderCard key={order.id} order={order} onUpdate={handleUpdate} />
              ))}
            </div>
          </section>
        )}

        {/* Confirmed (waiting to start) */}
        {confirmedOrders.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <h2 className="font-bold text-slate-900">Chờ bắt đầu ({confirmedOrders.length})</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 stagger-children">
              {confirmedOrders.map((order) => (
                <KitchenOrderCard key={order.id} order={order} onUpdate={handleUpdate} />
              ))}
            </div>
          </section>
        )}

        {/* Ready */}
        {readyOrders.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <h2 className="font-bold text-slate-900">Sẵn sàng ({readyOrders.length})</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 stagger-children">
              {readyOrders.map((order) => (
                <KitchenOrderCard key={order.id} order={order} onUpdate={handleUpdate} />
              ))}
            </div>
          </section>
        )}

        {orders.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <EmptyState
              icon={<ChefHat className="w-8 h-8" />}
              title="Không có đơn nào trong bếp"
              description="Tất cả các đơn đã được phục vụ hoặc chưa có đơn mới."
            />
          </div>
        )}
      </div>
    </div>
  )
}
