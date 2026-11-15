import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import type { ButtonHTMLAttributes } from 'react'
const variants = cva('button', { variants: { variant: { default: 'button-primary', outline: 'button-outline', ghost: 'button-ghost' } }, defaultVariants: { variant: 'default' } })
export function Button({ asChild, variant, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean; variant?: 'default' | 'outline' | 'ghost' }) {
  const Component = asChild ? Slot : 'button'
  return <Component className={cn(variants({ variant }), className)} {...props} />
}
