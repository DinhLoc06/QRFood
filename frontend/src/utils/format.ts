export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)

export const formatDate = (dateString: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))

export const statusLabel: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PREPARING: 'Đang chuẩn bị',
  READY: 'Sẵn sàng',
  SERVED: 'Đã phục vụ',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  AVAILABLE: 'Trống',
  OCCUPIED: 'Đang dùng',
  ACTIVE: 'Đang hoạt động',
  CLOSED: 'Đã đóng',
}

export const statusClass: Record<string, string> = {
  PENDING: 'status-pending',
  CONFIRMED: 'status-confirmed',
  PREPARING: 'status-preparing',
  READY: 'status-ready',
  SERVED: 'status-served',
  COMPLETED: 'status-completed',
  CANCELLED: 'status-rejected',
  AVAILABLE: 'status-available',
  OCCUPIED: 'status-occupied',
}
