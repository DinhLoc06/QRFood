import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChefHat, Users, ArrowLeft, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { useStore } from '../store/useStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import type { SessionData } from '../types'

const schema = z.object({
  numberOfPeople: z.coerce.number().min(1, 'Ít nhất 1 người').max(20, 'Tối đa 20 người'),
})

type FormValues = z.infer<typeof schema>

const quickSelections = [2, 3, 4, 6, 8]

export default function StartPage() {
  const navigate = useNavigate()
  const { setSessionId, setToken } = useStore()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { numberOfPeople: 2 },
  })

  const numberOfPeople = form.watch('numberOfPeople')

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    setErrorMsg('')
    try {
      const response = await api.post('/sessions', { numberOfPeople: values.numberOfPeople })
      const session = response.data.data as SessionData
      setSessionId(session.id)
      setToken('')
      navigate('/menu')
    } catch {
      setErrorMsg('Không tìm thấy bàn phù hợp. Vui lòng thử lại sau.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50/50 flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Trang chủ
        </Link>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          {/* Brand */}
          <div className="flex flex-col items-center mb-8 animate-fade-in-up">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-200 mb-4 animate-float">
              <ChefHat className="w-9 h-9 text-white" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-1">QRFood</p>
            <h1 className="text-3xl font-extrabold text-slate-900 text-center">Bắt đầu dùng bữa</h1>
            <p className="text-slate-400 text-sm mt-2 text-center">Nhập số người để tìm bàn phù hợp</p>
          </div>

          {/* Card */}
          <div
            className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 p-6 border border-slate-100 animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            {/* Quick select */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Chọn nhanh
              </p>
              <div className="flex gap-2 flex-wrap">
                {quickSelections.map((n) => (
                  <button
                    key={n}
                    type="button"
                    id={`quick-select-${n}`}
                    onClick={() => form.setValue('numberOfPeople', n)}
                    className={[
                      'flex-1 min-w-[44px] py-2.5 rounded-xl text-sm font-bold border-2 transition-all duration-150',
                      numberOfPeople === n
                        ? 'border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-200'
                        : 'border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-600',
                    ].join(' ')}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Number input */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <Input
                id="number-of-people"
                label="Số khách"
                type="number"
                min={1}
                max={20}
                error={form.formState.errors.numberOfPeople}
                helperText="Từ 1 đến 20 người"
                {...form.register('numberOfPeople')}
              />

              {errorMsg && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 flex items-start gap-2">
                  <span className="text-rose-500 text-sm">⚠️</span>
                  <p className="text-sm text-rose-600 font-medium">{errorMsg}</p>
                </div>
              )}

              <Button
                type="submit"
                loading={isLoading}
                fullWidth
                size="lg"
                id="start-session-btn"
              >
                <Users className="w-5 h-5" />
                Tìm bàn ngay
              </Button>
            </form>
          </div>

          {/* Hint */}
          <div
            className="mt-4 rounded-2xl bg-white/70 border border-orange-100 px-4 py-3 flex items-center gap-3 animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            <Sparkles className="w-4 h-4 text-orange-400 flex-shrink-0" />
            <p className="text-xs text-slate-500">
              Hệ thống sẽ tự chọn bàn nhỏ nhất phù hợp số người của bạn
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
