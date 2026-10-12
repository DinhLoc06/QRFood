import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ChefHat, Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react'
import axios from 'axios'
import { api } from '../services/api'
import { useStore } from '../store/useStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

type FormValues = {
  username: string
  password: string
}

export default function StaffLogin() {
  const navigate = useNavigate()
  const { setToken, setRole } = useStore()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const form = useForm<FormValues>({
    defaultValues: { username: 'admin', password: 'admin123' },
  })

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    setErrorMessage('')
    try {
      const response = await api.post('/auth/login', values)
      const token = response.data.data.token
      setToken(token)

      // Navigate based on role
      const role = response.data.data.role ?? 'STAFF'
      setRole(role)
      if (role === 'ADMIN') navigate('/admin/dashboard')
      else if (role === 'KITCHEN') navigate('/kitchen/dashboard')
      else navigate('/staff/dashboard')
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ??
            (error.response
              ? `Đăng nhập thất bại (${error.response.status})`
              : 'Không thể kết nối đến máy chủ. Hãy đảm bảo backend đang chạy.'),
        )
      } else {
        setErrorMessage('Đăng nhập thất bại. Vui lòng thử lại.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Back button */}
      <div className="px-4 pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors font-medium"
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
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-900/40">
                <ChefHat className="w-11 h-11 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-400 border-2 border-slate-900 flex items-center justify-center">
                <Lock className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-1">QRFood</p>
            <h1 className="text-3xl font-extrabold text-white text-center">Đăng nhập</h1>
            <p className="text-slate-400 text-sm mt-2 text-center">Dành cho nhân viên, bếp và quản trị viên</p>
          </div>

          {/* Login card */}
          <div
            className="glass rounded-3xl p-6 border border-white/10 animate-fade-in-up shadow-2xl"
            style={{ animationDelay: '100ms', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}
          >
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Input
                id="username"
                label="Tên đăng nhập"
                placeholder="admin"
                autoComplete="username"
                {...form.register('username')}
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:ring-orange-400"
              />

              {/* Password with toggle */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-slate-300">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...form.register('password')}
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 pr-11 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    id="toggle-password-visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="flex items-start gap-2 rounded-xl bg-rose-900/30 border border-rose-500/30 px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                  <p role="alert" className="text-sm text-rose-300">{errorMessage}</p>
                </div>
              )}

              <Button
                id="login-btn"
                type="submit"
                loading={loading}
                fullWidth
                size="lg"
                className="mt-2"
              >
                <Lock className="w-4 h-4" />
                Đăng nhập
              </Button>
            </form>

            {/* Default credentials hint */}
            <div className="mt-4 rounded-xl bg-white/5 border border-white/10 px-4 py-3">
              <p className="text-xs text-slate-400 text-center">
                Tài khoản mặc định: <span className="text-orange-300 font-semibold">admin</span> / <span className="text-orange-300 font-semibold">admin123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


