import { useState } from 'react'
import { format } from 'date-fns'
import { Link } from '@tanstack/react-router'
import { tr } from 'date-fns/locale'
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Circle,
  MapPin,
  NotebookPen,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  MonthRing,
  ReadinessMeter,
  SectionCard,
  Sparkline,
} from '../components/atoms'
import { CompetencyRadar } from '../components/competency-radar'
import { getCoach } from '../data/people'
import { COHORT, DEMO_TODAY } from '../data/program'
import { useTraineeView } from '../hooks/use-program'
import { type TraineeView } from '../lib/derive'
import {
  competencyGaps,
  daysUntil,
  getDepartment,
  milestoneDate,
  nextMilestone,
  phaseForMonth,
  phaseProgress,
  programMonth,
  programProgress,
} from '../lib/journey'
import { useProgramStore } from '../store/program-store'

const PULSE_OPTIONS = [
  { value: 1, label: 'Tükenmiş' },
  { value: 2, label: 'Yorgun' },
  { value: 3, label: 'Dengede' },
  { value: 4, label: 'Enerjik' },
  { value: 5, label: 'Coşkulu' },
]

export function MtHome() {
  const mtId = useProgramStore((s) => s.mtId)
  const trainee = useTraineeView(mtId)
  if (!trainee) return null

  return (
    <div className='grid items-start gap-4 lg:grid-cols-3'>
      <Hero trainee={trainee} />
      <PulseCheckin trainee={trainee} />
      <Deliverables trainee={trainee} />
      <SectionCard
        title='Liderlik Pusulan'
        description='6. ay ve 12. ay değerlendirmesi, 18. ay hedefiyle birlikte.'
        className='lg:col-span-1'
      >
        <CompetencyRadar
          m6={trainee.competencies.m6}
          m12={trainee.competencies.m12}
        />
        <GrowthEdge trainee={trainee} />
      </SectionCard>
      <Reflections trainee={trainee} />
      <Readiness trainee={trainee} />
    </div>
  )
}

function Hero({ trainee }: { trainee: TraineeView }) {
  const month = programMonth(DEMO_TODAY)
  const phase = phaseForMonth(month)
  const milestone = nextMilestone(month)
  const coach = getCoach(trainee.coachId)
  const firstName = trainee.name.split(' ')[0]

  return (
    <section className='relative overflow-hidden rounded-3xl bg-sidebar p-5 text-sidebar-foreground shadow-lg sm:p-7 lg:col-span-3'>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute -inset-e-24 -top-24 size-72 rounded-full bg-sidebar-primary/25 blur-3xl'
      />
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-s-1/3 -bottom-28 size-64 rounded-full bg-spark/20 blur-3xl'
      />
      <div className='relative flex flex-col gap-6 md:flex-row md:items-center'>
        <MonthRing
          month={month}
          total={COHORT.durationMonths}
          progress={programProgress(DEMO_TODAY)}
        />
        <div className='flex-1 space-y-3'>
          <div>
            <p className='text-xs font-semibold tracking-[0.14em] text-sidebar-primary uppercase'>
              {phase.title}
            </p>
            <h2 className='mt-1 font-manrope text-2xl font-extrabold tracking-tight sm:text-3xl'>
              Merhaba {firstName}, yolculuğunun %
              {Math.round(programProgress(DEMO_TODAY) * 100)} kadarı tamam.
            </h2>
            <p className='mt-1 max-w-xl text-sm opacity-80'>{phase.promise}</p>
          </div>
          <div className='flex flex-wrap gap-2 text-xs'>
            {trainee.currentDept && (
              <span className='inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5'>
                <MapPin className='size-3.5' />
                {trainee.currentDept.name} · {trainee.currentDept.city}
              </span>
            )}
            <span className='inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5'>
              Rotasyon %{Math.round(phaseProgress(DEMO_TODAY) * 100)}
            </span>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5'>
              Buddy: {trainee.buddy}
            </span>
          </div>
        </div>
        <div className='grid gap-2 sm:grid-cols-2 md:w-72 md:grid-cols-1'>
          {milestone && (
            <div className='rounded-2xl bg-white/8 p-3 ring-1 ring-white/10'>
              <p className='text-[11px] opacity-70'>Sıradaki kilometre taşı</p>
              <p className='font-semibold'>{milestone.title}</p>
              <p className='text-xs text-spark'>
                {daysUntil(milestoneDate(milestone.month), DEMO_TODAY)} gün
                kaldı
              </p>
            </div>
          )}
          <div className='rounded-2xl bg-white/8 p-3 ring-1 ring-white/10'>
            <p className='text-[11px] opacity-70'>Koçluk seansı</p>
            <p className='font-semibold'>{coach?.name}</p>
            <p className='flex items-center gap-1 text-xs opacity-80'>
              <CalendarClock className='size-3.5' />
              {format(new Date(trainee.nextSessionDate), 'd MMMM EEEE', {
                locale: tr,
              })}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function PulseCheckin({ trainee }: { trainee: TraineeView }) {
  const checkins = useProgramStore((s) => s.pulseCheckins)
  const checkIn = useProgramStore((s) => s.checkIn)
  const current = checkins[trainee.id]

  return (
    <SectionCard
      title='Bu haftaki enerjin'
      description='10 saniyelik nabız. Yalnızca koçun ve program ekibi görür.'
    >
      <div
        role='radiogroup'
        aria-label='Enerji seviyesi'
        className='grid grid-cols-5 gap-1.5'
      >
        {PULSE_OPTIONS.map((o) => (
          <button
            key={o.value}
            type='button'
            role='radio'
            aria-checked={current === o.value}
            onClick={() => {
              checkIn(trainee.id, o.value)
              toast.success('Nabız kaydedildi', {
                description: 'Koçun bir sonraki seansta bunu görecek.',
              })
            }}
            className={cn(
              'flex flex-col items-center gap-1 rounded-xl border px-1 py-2.5 text-[11px] font-medium transition-all',
              current === o.value
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'hover:border-primary/40 hover:bg-accent'
            )}
          >
            <span className='font-manrope text-lg font-extrabold'>
              {o.value}
            </span>
            {o.label}
          </button>
        ))}
      </div>
      <div className='mt-4 flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2'>
        <span className='text-xs text-muted-foreground'>Son 8 hafta</span>
        <Sparkline values={trainee.pulse} />
      </div>
    </SectionCard>
  )
}

function Deliverables({ trainee }: { trainee: TraineeView }) {
  const toggle = useProgramStore((s) => s.toggleDeliverable)
  const dept = trainee.currentDept
  if (!dept) return null
  const done = trainee.doneDeliverables
  const onTrack = done.length >= trainee.expectedDeliverables

  return (
    <SectionCard
      title='Rotasyon çıktıların'
      description={`${dept.name} · Host yönetici ${dept.hostManager}`}
      action={
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[11px] font-semibold',
            onTrack ? 'bg-success/15 text-success' : 'bg-warning/20'
          )}
        >
          {done.length}/{dept.deliverables.length} · plan{' '}
          {trainee.expectedDeliverables}
        </span>
      }
    >
      <ul className='space-y-1.5'>
        {dept.deliverables.map((d, i) => {
          const checked = done.includes(i)
          return (
            <li key={d}>
              <button
                type='button'
                role='checkbox'
                aria-checked={checked}
                onClick={() => toggle(trainee.id, i)}
                className='flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-start text-sm transition-colors hover:bg-accent'
              >
                {checked ? (
                  <CheckCircle2 className='size-5 shrink-0 text-primary' />
                ) : (
                  <Circle className='size-5 shrink-0 text-muted-foreground/60' />
                )}
                <span
                  className={cn(
                    checked && 'text-muted-foreground line-through'
                  )}
                >
                  {d}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </SectionCard>
  )
}

function GrowthEdge({ trainee }: { trainee: TraineeView }) {
  const [edge] = competencyGaps(trainee.competencies.m12)
  return (
    <div className='mt-4 rounded-xl border border-dashed border-spark/60 bg-spark/8 p-3'>
      <p className='flex items-center gap-1.5 text-xs font-semibold'>
        <Sparkles className='size-3.5 text-spark' />
        Büyüme kenarın: {edge.competency.name}
      </p>
      <p className='mt-1 text-xs text-muted-foreground'>
        Hedefe {edge.gap.toFixed(1)} puan. Bu hafta kendine sor: “
        {edge.competency.coachingQuestion}”
      </p>
    </div>
  )
}

function Reflections({ trainee }: { trainee: TraineeView }) {
  const [text, setText] = useState('')
  const add = useProgramStore((s) => s.addReflection)

  return (
    <SectionCard
      title='Öğrenme günlüğü'
      description='Kısa yansımalar koçluk seansının gündemini besler.'
      className='lg:col-span-1'
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!text.trim()) return
          add(trainee.id, text.trim())
          setText('')
          toast.success('Yansıma kaydedildi')
        }}
        className='space-y-2'
      >
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Bu hafta ne öğrendin, neyi farklı yapardın?'
          aria-label='Yeni yansıma'
          className='min-h-20 resize-none'
        />
        <Button type='submit' size='sm' disabled={!text.trim()}>
          <NotebookPen /> Kaydet
        </Button>
      </form>
      <ul className='mt-4 space-y-3'>
        {trainee.allReflections.slice(0, 3).map((r) => (
          <li key={r.id} className='border-s-2 border-primary/40 ps-3'>
            <p className='text-[11px] text-muted-foreground'>
              {format(new Date(r.date), 'd MMM', { locale: tr })}
            </p>
            <p className='text-sm'>{r.text}</p>
          </li>
        ))}
        {trainee.allReflections.length === 0 && (
          <li className='text-sm text-muted-foreground'>
            Henüz yansıma yok. İlkini yaz, koçun görsün.
          </li>
        )}
      </ul>
    </SectionCard>
  )
}

function Readiness({ trainee }: { trainee: TraineeView }) {
  return (
    <SectionCard
      title='Kalıcı role hazırlık'
      description='Yerleşim kararı 13. ayda; tercihlerin ve hazırlığın birlikte değerlendirilir.'
      className='lg:col-span-1'
    >
      <ReadinessMeter value={trainee.readiness} />
      <p className='mt-2 text-xs text-muted-foreground'>
        %50 yetkinlik · %30 host geri bildirimi · %20 teslim ritmi. Çizgi = 70
        eşiği.
      </p>
      <div className='mt-4 space-y-2'>
        <p className='text-xs font-semibold'>Tercihlerin</p>
        {trainee.preferences.map((p, i) => (
          <div
            key={p}
            className='flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2 text-sm'
          >
            <span>
              <span className='me-2 text-xs font-bold text-primary'>
                {i + 1}.
              </span>
              {getDepartment(p).name}
            </span>
            <span className='text-xs text-muted-foreground'>
              {getDepartment(p).openRoles} açık rol
            </span>
          </div>
        ))}
      </div>
      <Button asChild variant='outline' size='sm' className='mt-4 w-full'>
        <Link to='/journey'>
          18 aylık yolculuğumu gör <ArrowRight />
        </Link>
      </Button>
    </SectionCard>
  )
}
