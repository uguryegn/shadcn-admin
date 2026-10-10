import { cn } from '@/lib/utils'
import { COHORT, DEMO_TODAY, MILESTONES, PHASES } from '../data/program'
import { programMonth } from '../lib/journey'

/** 18 ayı tek şeritte gösterir; mobilde de sığar. */
export function PhaseStrip() {
  const month = programMonth(DEMO_TODAY)
  const months = Array.from({ length: COHORT.durationMonths }, (_, i) => i + 1)
  return (
    <div>
      <div
        className='grid gap-1'
        style={{ gridTemplateColumns: `repeat(${COHORT.durationMonths}, 1fr)` }}
      >
        {months.map((m) => {
          const milestone = MILESTONES.find((x) => x.month === m)
          return (
            <div
              key={m}
              title={milestone ? `${m}. ay · ${milestone.title}` : `${m}. ay`}
              className={cn(
                'relative h-9 rounded-md',
                m < month && 'bg-primary/70',
                m === month &&
                  'bg-spark ring-2 ring-spark/40 ring-offset-2 ring-offset-card',
                m > month && 'bg-muted'
              )}
            >
              {milestone && (
                <span
                  aria-hidden='true'
                  className={cn(
                    'absolute top-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full',
                    m < month ? 'bg-primary-foreground' : 'bg-foreground/40'
                  )}
                />
              )}
              <span
                className={cn(
                  'absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[9px] font-semibold tabular-nums sm:text-[10px]',
                  m < month && 'text-primary-foreground',
                  m === month && 'text-spark-foreground',
                  m > month && 'text-muted-foreground'
                )}
              >
                {m}
              </span>
            </div>
          )
        })}
      </div>
      <div
        className='mt-2 grid gap-1'
        style={{ gridTemplateColumns: `repeat(${COHORT.durationMonths}, 1fr)` }}
      >
        {PHASES.map((p) => (
          <div
            key={p.id}
            className='border-t-2 border-border pt-1 text-[10px] leading-tight text-muted-foreground sm:text-xs'
            style={{ gridColumn: `${p.startMonth} / ${p.endMonth + 1}` }}
          >
            <span className='hidden sm:inline'>{p.short}</span>
            <span className='sm:hidden'>
              {p.id === 'bootcamp' ? 'B' : p.short.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>
      <p className='mt-3 text-xs text-muted-foreground'>
        Bugün {month}. ay · noktalar kilometre taşlarını gösterir.
      </p>
    </div>
  )
}
