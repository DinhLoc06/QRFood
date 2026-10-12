import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  Search,
  ChefHat,
  Plus,
  Check,
  Coffee,
  UtensilsCrossed,
  IceCream,
} from 'lucide-react'
import { api } from '../services/api'
import { useStore } from '../store/useStore'
import { formatCurrency } from '../utils/format'
import { CardSkeleton, EmptyState } from '../components/ui/Loader'
import type { Product, Category } from '../types'

const categoryIcons: Record<string, React.ReactNode> = {
  Burger: <UtensilsCrossed className="w-4 h-4" />,
  Pizza: <UtensilsCrossed className="w-4 h-4" />,
  Drink: <Coffee className="w-4 h-4" />,
  Dessert: <IceCream className="w-4 h-4" />,
}

function ProductCard({ product, onAdd, isAdded }: {
  product: Product
  onAdd: () => void
  isAdded: boolean
}) {
  const [adding, setAdding] = useState(false)

  const handleAdd = () => {
    if (!product.available) return
    setAdding(true)
    onAdd()
    setTimeout(() => setAdding(false), 600)
  }

  return (
    <div className="group rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden card-hover animate-fade-in-up">
      {/* Image area */}
      <div className="relative h-44 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center overflow-hidden">
        <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center animate-float">
          <ChefHat className="w-10 h-10 text-orange-300" />
        </div>
        {/* Badges */}
        <div className="absolute top-3 left-3">
          {!product.available && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-600">
              Hết món
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900 text-white">
            {formatCurrency(product.price)}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-slate-900 text-base mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-sm text-slate-400 mb-4 line-clamp-2 min-h-[2.5rem]">{product.description}</p>

        <button
          id={`add-to-cart-${product.id}`}
          type="button"
          onClick={handleAdd}
          disabled={!product.available}
          className={[
            'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300',
            !product.available
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : adding || isAdded
              ? 'bg-emerald-500 text-white scale-95 shadow-md shadow-emerald-200'
              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-100 active:scale-95',
          ].join(' ')}
        >
          {adding || isAdded ? (
            <>
              <Check className="w-4 h-4" />
              Đã thêm
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Thêm vào giỏ
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default function MenuPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [recentlyAdded, setRecentlyAdded] = useState<Set<number>>(new Set())
  const { addToCart, cart, sessionId } = useStore()

  useEffect(() => {
    if (!sessionId) {
      navigate('/start')
      return
    }
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories').catch(() => ({ data: { data: [] } })),
        ])
        setProducts(prodRes.data.data ?? [])
        setCategories(catRes.data.data ?? [])
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [sessionId, navigate])

  const handleAdd = (product: Product) => {
    addToCart(product)
    setRecentlyAdded((prev) => new Set(prev).add(product.id))
    setTimeout(() => {
      setRecentlyAdded((prev) => {
        const next = new Set(prev)
        next.delete(product.id)
        return next
      })
    }, 1500)
  }

  const filteredProducts = products.filter((p) => {
    const matchCategory = activeCategory === null || p.categoryId === activeCategory
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchCategory && matchSearch
  })

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-slate-900 hidden sm:block">Thực đơn</span>
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="menu-search"
                type="text"
                placeholder="Tìm món..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
              />
            </div>

            {/* Cart button */}
            <Link
              to="/cart"
              id="view-cart-btn"
              className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Giỏ hàng</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-fade-in">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Category tabs */}
          {categories.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
              <button
                id="cat-all"
                type="button"
                onClick={() => setActiveCategory(null)}
                className={[
                  'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all',
                  activeCategory === null
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                ].join(' ')}
              >
                Tất cả
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  id={`cat-${cat.id}`}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={[
                    'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all',
                    activeCategory === cat.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                  ].join(' ')}
                >
                  {categoryIcons[cat.name] ?? <UtensilsCrossed className="w-3 h-3" />}
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Products grid */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon={<ChefHat className="w-8 h-8" />}
            title="Không tìm thấy món"
            description="Thử tìm kiếm từ khóa khác hoặc chọn danh mục khác."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={() => handleAdd(product)}
                isAdded={recentlyAdded.has(product.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating cart summary */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <Link
            to="/cart"
            className="flex items-center gap-3 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-xl shadow-slate-400/30 hover:bg-slate-800 transition-all active:scale-95"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-semibold text-sm">{cartCount} món trong giỏ</span>
            <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              Xem →
            </span>
          </Link>
        </div>
      )}
    </div>
  )
}
