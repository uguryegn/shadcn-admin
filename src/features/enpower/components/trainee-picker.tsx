import { cn } from '@/lib/utils'
import { type TraineeView } from '../lib/derive'

/** Yatay kaydırılabilir MT seçici; mobilde başparmakla kullanılabilir. */
export function TraineePicker({
  trainees,
  value,
  onChange,
  allowAll,
  className,
}: {
  trainees: Pick<TraineeView, 'id' | 'name' | 'initials' | 'risk'>[]
  value?: string
  onChange: (id: string | undefined) => void
  allowAll?: boolean
  className?: string
}) {
  return (
    <div
      role='listbox'
      aria-label='MT seç'
      className={cn(
        '-mx-4 no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1',
        className
      )}
    >
      {allowAll && (
        <Chip active={!value} onClick={() => onChange(undefined)}>
          Tüm kohort
        </Chip>
      )}
      {trainees.map((t) => (
        <Chip key={t.id} active={value === t.id} onClick={() => onChange(t.id)}>
          <span
            aria-hidden='true'
            className={cn(
              'size-1.5 rounded-full',
              t.risk === 'high' && 'bg-destructive',
              t.risk === 'medium' && 'bg-warning',
              t.risk === 'low' && 'bg-success'
            )}
          />
          {t.name}
        </Chip>
      ))}
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type='button'
      role='option'
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'bg-card hover:border-primary/40'
      )}
    >
      {children}
    </button>
  )
}
