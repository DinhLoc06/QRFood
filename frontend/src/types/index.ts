export type Product = {
  id: number
  categoryId: number
  name: string
  description: string
  price: number
  imageUrl?: string
  available: boolean
}

export type Category = {
  id: number
  name: string
  description?: string
}

export type OrderItem = {
  id: number
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
  note?: string
}

export type Order = {
  id: number
  sessionId: number
  status: OrderStatus
  totalAmount: number
  note?: string
  createdAt: string
  rejectedReason?: string
  items: OrderItem[]
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'COMPLETED'
  | 'CANCELLED'

export type CartItem = {
  productId: number
  name: string
  price: number
  quantity: number
}

export type SessionData = {
  id: number
  tableNumber: string
  numberOfPeople: number
  status: string
}

export type Table = {
  id: number
  tableNumber: string
  capacity: number
  status: 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE'
}

export type User = {
  id: number
  username: string
  fullName: string
  role: 'ADMIN' | 'STAFF' | 'KITCHEN'
}

export type Role = User['role']

export type Payment = {
  id: number
  sessionId: number
  tableNumber: string
  amount: number
  method: 'CASH' | 'QR'
  status: 'PENDING' | 'PAID' | 'CANCELLED'
  referenceCode: string
  qrContent?: string
  createdAt: string
  paidAt?: string
}
