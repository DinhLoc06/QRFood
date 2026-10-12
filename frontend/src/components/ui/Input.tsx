import type { InputHTMLAttributes } from 'react'
import type { FieldError } from 'react-hook-form'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: FieldError | string
  helperText?: string
}

export function Input({ label, error, helperText, className = '', id, ...props }: InputProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={[
          'w-full rounded-xl border px-4 py-3 text-sm text-slate-900',
          'placeholder:text-slate-400 transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent',
          errorMessage
            ? 'border-rose-400 bg-rose-50'
            : 'border-slate-200 bg-white hover:border-slate-300',
          className,
        ].join(' ')}
        {...props}
      />
      {errorMessage && (
        <p className="text-xs text-rose-500 font-medium">{errorMessage}</p>
      )}
      {helperText && !errorMessage && (
        <p className="text-xs text-slate-400">{helperText}</p>
      )}
    </div>
  )
}
