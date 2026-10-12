import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ChefHat,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
  ArrowLeft,
  CreditCard,
} from 'lucide-react'
import { api } from '../services/api'
import { formatCurrency, formatDate, statusLabel, statusClass } from '../utils/format'
import { PageLoader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Card'
import type { Order, OrderStatus } from '../types'

const ORDER_STEPS: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED']

const stepIcons: Partial<Record<OrderStatus, React.ReactNode>> = {
  PENDING: <Clock className="w-4 h-4" />,
  CONFIRMED: <CheckCircle2 className="w-4 h-4" />,
  PREPARING: <ChefHat className="w-4 h-4" />,
  READY: <CheckCircle2 className="w-4 h-4" />,
  SERVED: <CheckCircle2 className="w-4 h-4" />,
  COMPLETED: <CheckCircle2 className="w-4 h-4" />,
}

export default function OrderPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchOrder = async () => {
    if (!id) return
    try {
      const res = await api.get(`/orders/${id}`)
      setOrder(res.data.data)
    } catch {
      setOrder(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchOrder()
    // Auto-refresh every 10 seconds for live tracking
    const interval = setInterval(fetchOrder, 10000)
    return () => clearInterval(interval)
  }, [id])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchOrder()
  }

  const activeIndex = order ? ORDER_STEPS.indexOf(order.status as OrderStatus) : -1
  const isRejected = order?.status === 'CANCELLED'

  if (loading) return <div className="min-h-screen flex items-center justify-center"><PageLoader /></div>

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">Theo dõi đơn</span>
          </div>
          <button
            id="refresh-order-btn"
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Cập nhật
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {!order ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
            <XCircle className="w-12 h-12 text-rose-300 mx-auto mb-3" />
            <h2 className="font-bold text-slate-900 mb-1">Không tìm thấy đơn hàng</h2>
            <p className="text-slate-400 text-sm mb-4">Đơn hàng #{id} không tồn tại hoặc đã bị xóa.</p>
            <Link to="/menu" className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700">
              Quay về thực đơn <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Order header card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-fade-in-up">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Đơn hàng</p>
                  <h1 className="text-3xl font-extrabold text-slate-900">#{order.id}</h1>
                </div>
                <Badge className={statusClass[order.status] ?? 'bg-slate-100 text-slate-600'}>
                  {statusLabel[order.status] ?? order.status}
                </Badge>
              </div>
              <p className="text-sm text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {formatDate(order.createdAt)}
              </p>

              {/* Rejected reason */}
              {isRejected && order.rejectedReason && (
                <div className="mt-3 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-rose-700">Lý do từ chối</p>
                    <p className="text-sm text-rose-600">{order.rejectedReason}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Progress tracker */}
            {!isRejected && (
              <div
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-fade-in-up"
                style={{ animationDelay: '80ms' }}
              >
                <h2 className="font-bold text-slate-900 mb-4">Tiến độ đơn hàng</h2>
                <div className="space-y-3">
                  {ORDER_STEPS.map((step, index) => {
                    const isDone = index <= activeIndex
                    const isCurrent = index === activeIndex
                    return (
                      <div key={step} className="flex items-center gap-3">
                        {/* Step icon */}
                        <div
                          className={[
                            'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300',
                            isDone
                              ? isCurrent
                                ? 'bg-orange-500 text-white shadow-md shadow-orange-200 scale-110'
                                : 'bg-emerald-100 text-emerald-600'
                              : 'bg-slate-100 text-slate-300',
                          ].join(' ')}
                        >
                          {stepIcons[step]}
                        </div>
                        {/* Step label */}
                        <div className="flex-1">
                          <p
                            className={[
                              'text-sm font-semibold transition-colors',
                              isCurrent ? 'text-orange-600' : isDone ? 'text-slate-700' : 'text-slate-300',
                            ].join(' ')}
                          >
                            {statusLabel[step]}
                          </p>
                        </div>
                        {/* Connector line (except last) */}
                        {index < ORDER_STEPS.length - 1 && (
                          <div className={`hidden`} />
                        )}
                        {isCurrent && (
                          <span className="text-xs text-orange-500 font-bold bg-orange-50 px-2 py-0.5 rounded-full">
                            Hiện tại
                          </span>
                        )}
                        {isDone && !isCurrent && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Items */}
            <div
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in-up"
              style={{ animationDelay: '160ms' }}
            >
              <div className="px-5 py-4 border-b border-slate-50">
                <h2 className="font-bold text-slate-900">Chi tiết món ăn</h2>
              </div>
              <div className="divide-y divide-slate-50">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                      <ChefHat className="w-5 h-5 text-orange-300" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-sm">{item.productName}</p>
                      <p className="text-xs text-slate-400">
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <p className="font-bold text-slate-900 text-sm">{formatCurrency(item.subtotal)}</p>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <span className="font-semibold text-slate-600 text-sm">Tổng cộng</span>
                <span className="font-extrabold text-orange-600 text-lg">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>

            {/* Back to menu */}
            <div className="text-center pt-2">
              {order.status === 'COMPLETED' && (
                <Link
                  to={`/payment/${order.sessionId}`}
                  className="mb-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 font-semibold text-white shadow-sm hover:bg-orange-600"
                >
                  <CreditCard className="w-5 h-5" />
                  Yêu cầu thanh toán
                </Link>
              )}
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại thực đơn
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}


