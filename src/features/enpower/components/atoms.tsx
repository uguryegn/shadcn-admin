import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { type RiskLevel } from '../lib/journey'

const RISK_STYLE: Record<RiskLevel, { label: string; className: string }> = {
  high: {
    label: 'Yüksek dikkat',
    className: 'border-destructive/30 bg-destructive/10 text-destructive',
  },
  medium: {
    label: 'İzle',
    className: 'border-warning/40 bg-warning/15 text-foreground',
  },
  low: {
    label: 'Yolunda',
    className: 'border-success/30 bg-success/12 text-foreground',
  },
}

export function RiskBadge({
  level,
  className,
}: {
  level: RiskLevel
  className?: string
}) {
  const style = RISK_STYLE[level]
  return (
    <Badge variant='outline' className={cn(style.className, className)}>
      <span
        aria-hidden='true'
        className={cn(
          'size-1.5 rounded-full',
          level === 'high' && 'bg-destructive',
          level === 'medium' && 'bg-warning',
          level === 'low' && 'bg-success'
        )}
      />
      {style.label}
    </Badge>
  )
}

const AVATAR_TONES = [
  'bg-chart-1/15 text-chart-1',
  'bg-chart-2/20 text-spark-foreground dark:text-chart-2',
  'bg-chart-3/15 text-chart-3',
  'bg-chart-4/15 text-chart-4',
  'bg-chart-5/15 text-chart-5',
]

export function PersonAvatar({
  name,
  initials,
  className,
}: {
  name: string
  initials: string
  className?: string
}) {
  const tone =
    AVATAR_TONES[
      [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_TONES.length
    ]
  return (
    <span
      aria-hidden='true'
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold',
        tone,
        className
      )}
    >
      {initials}
    </span>
  )
}

/** 18 aylık ilerlemeyi gösteren halka. */
export function MonthRing({
  month,
  total,
  progress,
  size = 112,
}: {
  month: number
  total: number
  progress: number
  size?: number
}) {
  const stroke = 9
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div
      className='relative shrink-0'
      style={{ width: size, height: size }}
      role='img'
      aria-label={`Program ayı ${month} / ${total}`}
    >
      <svg width={size} height={size} className='-rotate-90'>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill='none'
          strokeWidth={stroke}
          className='stroke-white/15'
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill='none'
          strokeWidth={stroke}
          strokeLinecap='round'
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
          className='stroke-spark transition-[stroke-dashoffset] duration-700'
        />
      </svg>
      <div className='absolute inset-0 flex flex-col items-center justify-center leading-none'>
        <span className='font-manrope text-3xl font-extrabold'>{month}</span>
        <span className='mt-1 text-[11px] opacity-75'>/ {total} ay</span>
      </div>
    </div>
  )
}

export function Sparkline({
  values,
  className,
  min = 1,
  max = 5,
}: {
  values: number[]
  className?: string
  min?: number
  max?: number
}) {
  const w = 96
  const h = 28
  if (values.length < 2) return null
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (w - 4) + 2
    const y = h - 3 - ((v - min) / (max - min)) * (h - 6)
    return [x, y] as const
  })
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ')
  const last = pts[pts.length - 1]
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn('h-7 w-24 overflow-visible', className)}
      role='img'
      aria-label={`Son ${values.length} hafta enerji nabzı: ${values.join(', ')}`}
    >
      <path
        d={d}
        fill='none'
        strokeWidth='2'
        strokeLinejoin='round'
        strokeLinecap='round'
        className='stroke-primary'
      />
      <circle cx={last[0]} cy={last[1]} r='3' className='fill-spark' />
    </svg>
  )
}

/** Hazırlık endeksi çubuğu; 70 eşiği işaretlidir. */
export function ReadinessMeter({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  const tone =
    value >= 80
      ? 'bg-success'
      : value >= 70
        ? 'bg-primary'
        : value >= 60
          ? 'bg-warning'
          : 'bg-destructive'
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className='relative h-2 flex-1 overflow-hidden rounded-full bg-muted'
        role='meter'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-label='Hazırlık endeksi'
      >
        <div
          className={cn('h-full rounded-full transition-[width]', tone)}
          style={{ width: `${value}%` }}
        />
        <span
          aria-hidden='true'
          className='absolute inset-y-0 w-px bg-foreground/40'
          style={{ left: '70%' }}
        />
      </div>
      <span className='w-8 text-end text-xs font-semibold tabular-nums'>
        {value}
      </span>
    </div>
  )
}

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'default',
}: {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  icon?: React.ElementType
  tone?: 'default' | 'spark' | 'danger'
}) {
  return (
    <div className='rounded-2xl border bg-card p-4 shadow-xs'>
      <div className='flex items-center justify-between gap-2'>
        <p className='text-xs font-medium text-muted-foreground'>{label}</p>
        {Icon && (
          <span
            className={cn(
              'flex size-7 items-center justify-center rounded-lg',
              tone === 'default' && 'bg-primary/10 text-primary',
              tone === 'spark' &&
                'bg-spark/20 text-spark-foreground dark:text-spark',
              tone === 'danger' && 'bg-destructive/10 text-destructive'
            )}
          >
            <Icon className='size-4' />
          </span>
        )}
      </div>
      <p className='mt-2 font-manrope text-2xl font-extrabold tracking-tight tabular-nums'>
        {value}
      </p>
      {hint && <p className='mt-0.5 text-xs text-muted-foreground'>{hint}</p>}
    </div>
  )
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border bg-card p-4 shadow-xs sm:p-5',
        className
      )}
    >
      <header className='mb-4 flex items-start justify-between gap-3'>
        <div>
          <h2 className='font-manrope text-base font-bold tracking-tight'>
            {title}
          </h2>
          {description && (
            <p className='mt-0.5 text-xs text-muted-foreground'>
              {description}
            </p>
          )}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}
