import { Link } from 'react-router-dom'
import {
  ChefHat,
  UtensilsCrossed,
  ShieldCheck,
  User2,
  QrCode,
  ArrowRight,
  Star,
  Clock,
  Zap,
} from 'lucide-react'

type PortalCard = {
  id: string
  title: string
  subtitle: string
  description: string
  icon: React.ReactNode
  route: string
  gradient: string
  iconBg: string
}

const portals: PortalCard[] = [
  {
    id: 'customer',
    title: 'Khách hàng',
    subtitle: 'Customer',
    description: 'Quét mã QR, chọn món và đặt hàng nhanh chóng không cần đăng nhập.',
    icon: <User2 className="w-6 h-6" />,
    route: '/start',
    gradient: 'from-orange-50 to-amber-50',
    iconBg: 'bg-orange-100 text-orange-600',
  },
  {
    id: 'staff',
    title: 'Nhân viên',
    subtitle: 'Staff',
    description: 'Xác nhận, theo dõi và phục vụ đơn hàng của khách.',
    icon: <UtensilsCrossed className="w-6 h-6" />,
    route: '/staff/login',
    gradient: 'from-blue-50 to-indigo-50',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'kitchen',
    title: 'Bếp',
    subtitle: 'Kitchen',
    description: 'Cập nhật tiến độ món ăn: đang chuẩn bị và sẵn sàng phục vụ.',
    icon: <ChefHat className="w-6 h-6" />,
    route: '/kitchen/dashboard',
    gradient: 'from-amber-50 to-yellow-50',
    iconBg: 'bg-amber-100 text-amber-600',
  },
  {
    id: 'admin',
    title: 'Quản trị viên',
    subtitle: 'Admin',
    description: 'Quản lý bàn, thực đơn, sản phẩm và tài khoản nhân sự.',
    icon: <ShieldCheck className="w-6 h-6" />,
    route: '/admin/dashboard',
    gradient: 'from-purple-50 to-violet-50',
    iconBg: 'bg-purple-100 text-purple-600',
  },
]

const features = [
  {
    icon: <QrCode className="w-5 h-5" />,
    title: 'Quét QR nhanh',
    desc: 'Không cần app, chỉ cần camera điện thoại',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Đặt món tức thì',
    desc: 'Từ chọn món đến bếp nhận đơn trong vài giây',
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: 'Theo dõi thời gian thực',
    desc: 'Biết chính xác đơn đang ở bước nào',
  },
  {
    icon: <Star className="w-5 h-5" />,
    title: 'Trải nghiệm tốt nhất',
    desc: 'Giao diện tối ưu cho điện thoại và máy tính',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/20">
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200 rounded-full opacity-20 blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-200 rounded-full opacity-20 blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-10">
          {/* Logo & brand */}
          <div className="animate-fade-in-up flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200">
              <ChefHat className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-500">QRFood</p>
              <p className="text-xs text-slate-400">Restaurant Management System</p>
            </div>
          </div>

          {/* Hero text */}
          <div className="animate-fade-in-up" style={{ animationDelay: '80ms' }}>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
              Đặt món thông minh
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                qua mã QR
              </span>
            </h1>
            <p className="text-slate-500 text-lg max-w-lg leading-relaxed">
              Hệ thống quản lý đặt món nhà hàng hiện đại — nhanh chóng, minh bạch và không cần chờ đợi.
            </p>
          </div>
        </div>
      </div>

      {/* Portal cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children"
        >
          {portals.map((portal) => (
            <Link
              key={portal.id}
              to={portal.route}
              id={`portal-${portal.id}`}
              className={[
                'group relative rounded-2xl p-6 border border-slate-100 bg-gradient-to-br shadow-sm',
                'transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-slate-200',
                portal.gradient,
                'animate-fade-in-up',
              ].join(' ')}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${portal.iconBg}`}>
                  {portal.icon}
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all duration-200" />
              </div>
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <h2 className="text-lg font-bold text-slate-900">{portal.title}</h2>
                  <span className="text-xs text-slate-400 font-medium">{portal.subtitle}</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{portal.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="rounded-2xl bg-slate-900 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-2">Tính năng</p>
          <h2 className="text-2xl font-bold text-white mb-6">Tại sao dùng QRFood?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-orange-400">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
