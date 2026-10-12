import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UtensilsCrossed,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  AlertCircle,
  Users,
  CreditCard,
  Banknote,
  QrCode,
} from 'lucide-react'
import { api } from '../services/api'
import { useStore } from '../store/useStore'
import { formatCurrency, formatDate, statusLabel, statusClass } from '../utils/format'
import { PageLoader, EmptyState } from '../components/ui/Loader'
import { Badge } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import type { Order, Payment } from '../types'

function DashboardHeader({ title, onRefresh, onLogout, refreshing }: {
  title: string
  onRefresh: () => void
  onLogout: () => void
  refreshing: boolean
}) {
  return (
    <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-500">QRFood</p>
            <h1 className="text-base font-extrabold text-slate-900">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="refresh-orders-btn"
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-all font-medium disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Cập nhật</span>
          </button>
          <button
            id="logout-btn"
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function OrderCard({ order, onAction }: {
  order: Order
  onAction: (id: number, action: 'confirm' | 'reject' | 'serve' | 'complete') => void
}) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleAction = async (action: 'confirm' | 'reject' | 'serve' | 'complete') => {
    setActionLoading(action)
    await onAction(order.id, action)
    setActionLoading(null)
  }

  const canConfirm = order.status === 'PENDING'
  const canReject = order.status === 'PENDING'
  const canServe = order.status === 'READY'
  const canComplete = order.status === 'SERVED'

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in-up">
      {/* Order header */}
      <div className="px-5 py-4 border-b border-slate-50 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-extrabold text-slate-900 text-lg">#{order.id}</p>
            <Badge className={statusClass[order.status] ?? 'bg-slate-100 text-slate-600'}>
              {statusLabel[order.status] ?? order.status}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Tổng tiền</p>
          <p className="font-bold text-slate-900">{formatCurrency(order.totalAmount)}</p>
        </div>
      </div>

      {/* Items */}
      <div className="px-5 py-3">
        <div className="space-y-1.5">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <span className="w-5 h-5 rounded bg-slate-100 text-xs font-bold flex items-center justify-center text-slate-500">
                  {item.quantity}
                </span>
                {item.productName}
              </div>
              <span className="text-slate-400">{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>

        {order.rejectedReason && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-rose-600">{order.rejectedReason}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {(canConfirm || canReject || canServe || canComplete) && (
        <div className="px-5 py-4 border-t border-slate-50 flex gap-2 flex-wrap">
          {canConfirm && (
            <Button
              id={`confirm-order-${order.id}`}
              variant="success"
              size="sm"
              loading={actionLoading === 'confirm'}
              onClick={() => handleAction('confirm')}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Xác nhận
            </Button>
          )}
          {canReject && (
            <Button
              id={`reject-order-${order.id}`}
              variant="danger"
              size="sm"
              loading={actionLoading === 'reject'}
              onClick={() => handleAction('reject')}
            >
              <XCircle className="w-3.5 h-3.5" />
              Từ chối
            </Button>
          )}
          {canServe && (
            <Button
              id={`serve-order-${order.id}`}
              variant="secondary"
              size="sm"
              loading={actionLoading === 'serve'}
              onClick={() => handleAction('serve')}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              Phục vụ
            </Button>
          )}
          {canComplete && (
            <Button size="sm" loading={actionLoading === 'complete'} onClick={() => handleAction('complete')}>
              <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn tất
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default function StaffDashboard() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { token, role, logout } = useStore()

  const fetchOrders = async () => {
    if (!token || !role || !['ADMIN', 'STAFF'].includes(role)) {
      navigate('/staff/login')
      return
    }
    try {
      const [ordersResponse, paymentsResponse] = await Promise.all([
        api.get('/orders'),
        api.get('/payments'),
      ])
      setOrders(ordersResponse.data.data ?? [])
      setPayments(paymentsResponse.data.data ?? [])
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 15000)
    return () => clearInterval(interval)
  }, [token])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchOrders()
  }

  const handleLogout = () => {
    logout()
    navigate('/staff/login')
  }

  const handleAction = async (id: number, action: 'confirm' | 'reject' | 'serve' | 'complete') => {
    try {
      if (action === 'confirm') await api.put(`/orders/${id}/confirm`, {})
      if (action === 'reject') await api.put(`/orders/${id}/reject?reason=Theo+yêu+cầu`, {})
      if (action === 'serve') await api.put(`/orders/${id}/status?status=SERVED`, {})
      if (action === 'complete') {
        await api.put(`/orders/${id}/status?status=COMPLETED`, {})
      }
      await fetchOrders()
    } catch {
      alert('Không thể cập nhật đơn hàng.')
    }
  }

  // Group orders by status priority
  const pendingOrders = orders.filter((o) => o.status === 'PENDING')
  const activeOrders = orders.filter((o) => ['CONFIRMED', 'PREPARING', 'READY'].includes(o.status))
  const doneOrders = orders.filter((o) => ['SERVED', 'COMPLETED', 'CANCELLED'].includes(o.status))
  const pendingPayments = payments.filter((payment) => payment.status === 'PENDING')

  const confirmPayment = async (id: number) => {
    try {
      await api.post(`/payments/${id}/confirm`, {})
      await fetchOrders()
    } catch {
      alert('Không thể xác nhận thanh toán.')
    }
  }

  const stats = [
    { label: 'Chờ xác nhận', value: pendingOrders.length, color: 'bg-amber-100 text-amber-700' },
    { label: 'Đang xử lý', value: activeOrders.length, color: 'bg-blue-100 text-blue-700' },
    { label: 'Hoàn thành', value: doneOrders.length, color: 'bg-emerald-100 text-emerald-700' },
  ]

  if (loading) {
    return (
      <div>
        <DashboardHeader title="Nhân viên" onRefresh={handleRefresh} onLogout={handleLogout} refreshing={refreshing} />
        <div className="flex items-center justify-center min-h-64"><PageLoader /></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader title="Nhân viên" onRefresh={handleRefresh} onLogout={handleLogout} refreshing={refreshing} />

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {pendingPayments.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-500" />
              <h2 className="font-bold text-slate-900">Yêu cầu thanh toán ({pendingPayments.length})</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {pendingPayments.map((payment) => (
                <div key={payment.id} className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Bàn</p>
                      <p className="text-xl font-extrabold text-slate-900">{payment.tableNumber}</p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                      {payment.method === 'QR' ? <QrCode className="h-3.5 w-3.5" /> : <Banknote className="h-3.5 w-3.5" />}
                      {payment.method === 'QR' ? 'QR' : 'Tiền mặt'}
                    </div>
                  </div>
                  <p className="mb-1 text-2xl font-extrabold text-orange-600">{formatCurrency(payment.amount)}</p>
                  <p className="mb-4 font-mono text-xs text-slate-400">{payment.referenceCode}</p>
                  <Button fullWidth variant="success" onClick={() => confirmPayment(payment.id)}>
                    <CheckCircle2 className="h-4 w-4" /> Xác nhận đã thanh toán
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
              <p className={`text-2xl font-extrabold mb-1 rounded-xl px-2 py-1 inline-block ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Pending orders - priority */}
        {pendingOrders.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="font-bold text-slate-900">Chờ xác nhận ({pendingOrders.length})</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 stagger-children">
              {pendingOrders.map((order) => (
                <OrderCard key={order.id} order={order} onAction={handleAction} />
              ))}
            </div>
          </section>
        )}

        {/* Active orders */}
        {activeOrders.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <h2 className="font-bold text-slate-900">Đang xử lý ({activeOrders.length})</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 stagger-children">
              {activeOrders.map((order) => (
                <OrderCard key={order.id} order={order} onAction={handleAction} />
              ))}
            </div>
          </section>
        )}

        {/* Done orders */}
        {doneOrders.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-slate-300" />
              <h2 className="font-bold text-slate-700">Đã xong ({doneOrders.length})</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 stagger-children opacity-70">
              {doneOrders.map((order) => (
                <OrderCard key={order.id} order={order} onAction={handleAction} />
              ))}
            </div>
          </section>
        )}

        {/* Empty */}
        {orders.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <EmptyState
              icon={<Users className="w-8 h-8" />}
              title="Chưa có đơn hàng nào"
              description="Khi khách đặt hàng, đơn sẽ xuất hiện ở đây."
            />
          </div>
        )}
      </div>
    </div>
  )
}
