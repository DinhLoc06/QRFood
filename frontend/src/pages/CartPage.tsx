import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, ArrowLeft, Minus, Plus, Trash2, ChefHat, AlertCircle } from 'lucide-react'
import { useStore } from '../store/useStore'
import { formatCurrency } from '../utils/format'
import { api } from '../services/api'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/Loader'

export default function CartPage() {
  const navigate = useNavigate()
  const { cart, sessionId, clearCart, updateQuantity } = useStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  )

  const submitOrder = async () => {
    if (!sessionId) {
      navigate('/start')
      return
    }
    if (cart.length === 0) return

    setLoading(true)
    setError('')
    try {
      const response = await api.post('/orders', {
        sessionId,
        items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      })
      const orderId = response.data.data.id
      clearCart()
      navigate(`/order/${orderId}`)
    } catch {
      setError('Không thể đặt hàng lúc này. Vui lòng kiểm tra phiên bàn và thực đơn.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tiếp tục chọn món</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">Giỏ hàng</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Cart items */}
        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <EmptyState
              icon={<ShoppingCart className="w-8 h-8" />}
              title="Giỏ hàng trống"
              description="Hãy thêm món từ thực đơn để bắt đầu."
            />
            <div className="pb-6 flex justify-center">
              <Link
                to="/menu"
                className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors"
              >
                Xem thực đơn
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-50">
                <h2 className="font-bold text-slate-900">
                  {cart.length} loại món ({cart.reduce((s, i) => s + i.quantity, 0)} phần)
                </h2>
              </div>
              <div className="divide-y divide-slate-50">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    id={`cart-item-${item.productId}`}
                    className="flex items-center gap-4 px-5 py-4 animate-fade-in"
                  >
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                      <ChefHat className="w-6 h-6 text-orange-300" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                      <p className="text-sm text-slate-400">{formatCurrency(item.price)} / phần</p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      <button
                        id={`decrease-${item.productId}`}
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:border-slate-300 transition-all active:scale-90"
                      >
                        {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-rose-400" /> : <Minus className="w-3.5 h-3.5" />}
                      </button>
                      <span className="w-7 text-center font-bold text-slate-900 text-sm">{item.quantity}</span>
                      <button
                        id={`increase-${item.productId}`}
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-all active:scale-90"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right flex-shrink-0 min-w-[4rem]">
                      <p className="font-bold text-slate-900 text-sm">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order summary */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 mb-4">Tổng đơn hàng</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Tạm tính ({cart.reduce((s, i) => s + i.quantity, 0)} phần)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Phí phục vụ</span>
                  <span className="text-emerald-500">Miễn phí</span>
                </div>
                <div className="h-px bg-slate-100 my-2" />
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Tổng cộng</span>
                  <span className="text-orange-600 text-lg">{formatCurrency(subtotal)}</span>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 mb-4">
                  <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-rose-600">{error}</p>
                </div>
              )}

              <Button
                id="place-order-btn"
                onClick={submitOrder}
                loading={loading}
                disabled={cart.length === 0}
                fullWidth
                size="lg"
              >
                <ShoppingCart className="w-5 h-5" />
                Đặt hàng ngay
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
