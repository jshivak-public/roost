import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
export function Dialog({ open, onOpenChange, title, description, children, wide = false }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: string; children: ReactNode; wide?: boolean }) {
  return <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}><DialogPrimitive.Portal><DialogPrimitive.Overlay className="dialog-overlay" /><DialogPrimitive.Content className={`dialog-content ${wide ? 'wide' : ''}`}><DialogPrimitive.Title className="dialog-title">{title}</DialogPrimitive.Title><DialogPrimitive.Description className="muted">{description || 'Make yourself at home.'}</DialogPrimitive.Description><DialogPrimitive.Close className="icon-button dialog-close" aria-label="Close"><X size={20} /></DialogPrimitive.Close>{children}</DialogPrimitive.Content></DialogPrimitive.Portal></DialogPrimitive.Root>
}
