import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { BookOpen, Check, Flag, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DEMO_TODAY,
  LEARNING_BY_PHASE,
  MILESTONES,
  PHASES,
  type MilestoneKind,
} from '../data/program'
import { type TraineeView } from '../lib/derive'
import {
  departmentInPhase,
  getDepartment,
  milestoneDate,
  phaseProgress,
  phaseWindow,
  programMonth,
} from '../lib/journey'

const KIND_LABEL: Record<MilestoneKind, string> = {
  ritual: 'Ritüel',
  assessment: 'Değerlendirme',
  showcase: 'Sunum',
  decision: 'Karar',
}

/** 18 aylık yolculuk: dikey zaman çizelgesi (mobil ve masaüstünde aynı mantık). */
export function JourneyTimeline({
  trainee,
  showPlacement = false,
}: {
  trainee: TraineeView
  /** MT'ye taslak yerleşim gösterilmez; karar 13. ayda paylaşılır. */
  showPlacement?: boolean
}) {
  const month = programMonth(DEMO_TODAY)

  return (
    <ol className='relative space-y-4'>
      {PHASES.map((phase, index) => {
        const status =
          month > phase.endMonth
            ? 'done'
            : month >= phase.startMonth
              ? 'active'
              : 'upcoming'
        const deptId = departmentInPhase(trainee, phase.id)
        const dept = deptId ? getDepartment(deptId) : undefined
        const placement =
          showPlacement && phase.id === 'launch' && trainee.placement
            ? getDepartment(trainee.placement)
            : undefined
        const feedback =
          index >= 1 && index <= 3 ? trainee.hostFeedback[index - 1] : undefined
        const window = phaseWindow(phase)
        const milestones = MILESTONES.filter(
          (m) => m.month >= phase.startMonth && m.month <= phase.endMonth
        )

        return (
          <li key={phase.id} className='relative ps-10 sm:ps-14'>
            {/* ray */}
            {index < PHASES.length - 1 && (
              <span
                aria-hidden='true'
                className={cn(
                  'absolute inset-s-[15px] top-9 bottom-[-1rem] w-0.5 sm:inset-s-[23px]',
                  status === 'done' ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
            <span
              aria-hidden='true'
              className={cn(
                'absolute inset-s-0 top-1 flex size-8 items-center justify-center rounded-full border-2 text-xs font-bold sm:inset-s-2',
                status === 'done' &&
                  'border-primary bg-primary text-primary-foreground',
                status === 'active' &&
                  'border-spark bg-spark text-spark-foreground shadow-[0_0_0_6px] shadow-spark/25',
                status === 'upcoming' && 'border-border bg-card'
              )}
            >
              {status === 'done' ? <Check className='size-4' /> : index + 1}
            </span>

            <article
              className={cn(
                'rounded-2xl border bg-card p-4 sm:p-5',
                status === 'active' && 'border-spark/60 shadow-md'
              )}
            >
              <header className='flex flex-wrap items-start justify-between gap-2'>
                <div>
                  <p className='text-[11px] font-semibold tracking-wider text-muted-foreground uppercase'>
                    {phase.startMonth === phase.endMonth
                      ? `${phase.startMonth}. ay`
                      : `${phase.startMonth}–${phase.endMonth}. ay`}{' '}
                    · {format(window.start, 'MMM yyyy', { locale: tr })}
                  </p>
                  <h3 className='font-manrope text-lg font-bold tracking-tight'>
                    {phase.title}
                  </h3>
                </div>
                <StatusPill status={status} phaseId={phase.id} />
              </header>

              <p className='mt-1 text-sm text-muted-foreground'>
                {phase.promise}
              </p>

              {(dept || placement) && (
                <div className='mt-3 flex flex-wrap items-center gap-2 text-sm'>
                  <span className='rounded-lg bg-accent px-2.5 py-1 font-medium text-accent-foreground'>
                    {(dept ?? placement)!.name}
                  </span>
                  {placement && (
                    <span className='text-xs text-muted-foreground'>
                      taslak yerleşim
                    </span>
                  )}
                  {dept && (
                    <span className='text-xs text-muted-foreground'>
                      Host: {dept.hostManager} · {dept.city}
                    </span>
                  )}
                  {feedback && (
                    <span className='ms-auto inline-flex items-center gap-1 text-xs font-semibold'>
                      <Star className='size-3.5 fill-spark text-spark' />
                      {feedback.toFixed(1)}
                    </span>
                  )}
                </div>
              )}

              {status === 'active' && (
                <div className='mt-3'>
                  <div className='h-1.5 overflow-hidden rounded-full bg-muted'>
                    <div
                      className='h-full rounded-full bg-spark'
                      style={{ width: `${phaseProgress(DEMO_TODAY) * 100}%` }}
                    />
                  </div>
                  <p className='mt-1 text-[11px] text-muted-foreground'>
                    Faz %{Math.round(phaseProgress(DEMO_TODAY) * 100)} tamam ·{' '}
                    {trainee.deliverablesDone}/{dept?.deliverables.length ?? 0}{' '}
                    çıktı
                  </p>
                </div>
              )}

              <div className='mt-4 grid gap-4 sm:grid-cols-2'>
                {milestones.length > 0 && (
                  <div>
                    <p className='mb-1.5 flex items-center gap-1.5 text-xs font-semibold'>
                      <Flag className='size-3.5 text-primary' /> Kilometre
                      taşları
                    </p>
                    <ul className='space-y-1.5'>
                      {milestones.map((m) => (
                        <li key={m.title} className='text-sm'>
                          <span
                            className={cn(
                              m.month < month && 'text-muted-foreground'
                            )}
                          >
                            {m.title}
                          </span>
                          <span className='block text-[11px] text-muted-foreground'>
                            {KIND_LABEL[m.kind]} · {m.owner} ·{' '}
                            {format(milestoneDate(m.month), 'd MMM', {
                              locale: tr,
                            })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <p className='mb-1.5 flex items-center gap-1.5 text-xs font-semibold'>
                    <BookOpen className='size-3.5 text-primary' /> Öğrenme
                  </p>
                  <ul className='flex flex-wrap gap-1.5'>
                    {LEARNING_BY_PHASE[phase.id].map((l) => (
                      <li
                        key={l}
                        className='rounded-full border px-2 py-0.5 text-[11px]'
                      >
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          </li>
        )
      })}
    </ol>
  )
}

function StatusPill({
  status,
  phaseId,
}: {
  status: 'done' | 'active' | 'upcoming'
  phaseId: string
}) {
  const label =
    status === 'done' ? 'Tamamlandı' : status === 'active' ? 'Şu an' : 'Sırada'
  return (
    <span
      data-phase={phaseId}
      className={cn(
        'rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
        status === 'done' && 'bg-primary/10 text-primary',
        status === 'active' &&
          'bg-spark/25 text-spark-foreground dark:text-spark',
        status === 'upcoming' && 'bg-muted text-muted-foreground'
      )}
    >
      {label}
    </span>
  )
}
