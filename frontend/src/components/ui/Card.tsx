import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export function Card({ children, className = '', hover = false, padding = 'md' }: CardProps) {
  return (
    <div
      className={[
        'rounded-2xl bg-white border border-slate-100 shadow-sm',
        hover ? 'card-hover cursor-pointer' : '',
        paddingStyles[padding],
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

type BadgeProps = {
  children: ReactNode
  className?: string
}

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
