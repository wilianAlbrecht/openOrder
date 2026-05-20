import clsx from 'clsx'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode
  variant?: ButtonVariant
}

export function Button({
  children,
  className,
  icon,
  type = 'button',
  variant = 'secondary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx('ui-button', `ui-button-${variant}`, className)}
      type={type}
      {...props}
    >
      {icon ? <span className="ui-button-icon">{icon}</span> : null}
      <span>{children}</span>
    </button>
  )
}
