import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Banknote, CheckCircle2, ChevronLeft, Clock, CreditCard, QrCode } from 'lucide-react'
import { api } from '../services/api'
import { Button } from '../components/ui/Button'
import { formatCurrency } from '../utils/format'
import type { Payment } from '../types'

export default function PaymentPage() {
  const { sessionId } = useParams()
  const [payment, setPayment] = useState<Payment | null>(null)
  const [method, setMethod] = useState<'CASH' | 'QR'>('QR')
  const [qrImage, setQrImage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadPayment = async () => {
    if (!sessionId) return
    try {
      const response = await api.get(`/payments/session/${sessionId}`)
      setPayment(response.data.data)
    } catch {
      // A payment does not exist until the customer requests it.
    }
  }

  useEffect(() => {
    loadPayment()
    const timer = setInterval(loadPayment, 5000)
    return () => clearInterval(timer)
  }, [sessionId])

  useEffect(() => {
    if (payment?.method !== 'QR' || !payment.qrContent) {
      setQrImage('')
      return
    }
    api.get('/qr', { params: { url: payment.qrContent } })
      .then((response) => setQrImage(`data:${response.data.data.imageMimeType};base64,${response.data.data.imageBase64}`))
      .catch(() => setQrImage(''))
  }, [payment?.id, payment?.method, payment?.qrContent])

  const requestPayment = async () => {
    if (!sessionId) return
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/payments', { sessionId: Number(sessionId), method })
      setPayment(response.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Không thể tạo yêu cầu thanh toán.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-100 bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <CreditCard className="h-6 w-6 text-orange-500" />
          <h1 className="text-lg font-extrabold text-slate-900">Thanh toán</h1>
        </div>
      </header>

      <main className="mx-auto max-w-xl space-y-4 px-4 py-6">
        {!payment ? (
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-1 font-bold text-slate-900">Chọn phương thức thanh toán</h2>
            <p className="mb-5 text-sm text-slate-500">Nhân viên sẽ kiểm tra và xác nhận sau khi nhận tiền.</p>
            <div className="mb-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setMethod('QR')} className={`rounded-xl border-2 p-4 text-left ${method === 'QR' ? 'border-orange-500 bg-orange-50' : 'border-slate-200'}`}>
                <QrCode className="mb-2 h-6 w-6 text-orange-500" />
                <p className="font-bold">QR chuyển khoản</p>
                <p className="text-xs text-slate-500">Mô phỏng tại local</p>
              </button>
              <button type="button" onClick={() => setMethod('CASH')} className={`rounded-xl border-2 p-4 text-left ${method === 'CASH' ? 'border-orange-500 bg-orange-50' : 'border-slate-200'}`}>
                <Banknote className="mb-2 h-6 w-6 text-emerald-500" />
                <p className="font-bold">Tiền mặt</p>
                <p className="text-xs text-slate-500">Thanh toán tại quầy</p>
              </button>
            </div>
            {error && <p className="mb-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}
            <Button fullWidth size="lg" loading={loading} onClick={requestPayment}>Gửi yêu cầu thanh toán</Button>
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm">
            {payment.status === 'PAID' ? (
              <>
                <CheckCircle2 className="mx-auto mb-3 h-14 w-14 text-emerald-500" />
                <h2 className="text-xl font-extrabold text-slate-900">Thanh toán thành công</h2>
                <p className="mt-2 text-sm text-slate-500">Cảm ơn bạn. Phiên bàn đã được đóng.</p>
              </>
            ) : (
              <>
                <Clock className="mx-auto mb-3 h-12 w-12 text-amber-500" />
                <h2 className="text-xl font-extrabold text-slate-900">Chờ nhân viên xác nhận</h2>
                <p className="mt-1 text-sm text-slate-500">Bàn {payment.tableNumber} · {payment.method === 'QR' ? 'QR chuyển khoản' : 'Tiền mặt'}</p>
                {payment.method === 'QR' && qrImage && <img src={qrImage} alt="Mã QR thanh toán" className="mx-auto my-4 h-56 w-56" />}
                <p className="mt-4 text-3xl font-extrabold text-orange-600">{formatCurrency(payment.amount)}</p>
                <p className="mt-2 font-mono text-sm text-slate-500">{payment.referenceCode}</p>
              </>
            )}
          </section>
        )}
        <Link to="/menu" className="flex items-center justify-center gap-1 text-sm font-semibold text-slate-500"><ChevronLeft className="h-4 w-4" /> Quay lại thực đơn</Link>
      </main>
    </div>
  )
}
