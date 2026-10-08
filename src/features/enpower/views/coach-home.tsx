import { format } from 'date-fns'
import { Link } from '@tanstack/react-router'
import { tr } from 'date-fns/locale'
import {
  AlertTriangle,
  CalendarClock,
  Gauge,
  MessageCircleHeart,
  Route,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  PersonAvatar,
  ReadinessMeter,
  RiskBadge,
  SectionCard,
  Sparkline,
  StatTile,
} from '../components/atoms'
import { getCoach } from '../data/people'
import { DEMO_TODAY } from '../data/program'
import { useCohortViews } from '../hooks/use-program'
import { sortByAttention, type TraineeView } from '../lib/derive'
import { daysUntil } from '../lib/journey'
import { useProgramStore } from '../store/program-store'

export function CoachHome() {
  const coachId = useProgramStore((s) => s.coachId)
  const coach = getCoach(coachId)
  const coachees = sortByAttention(
    useCohortViews().filter((t) => t.coachId === coachId)
  )
  const attention = coachees.filter((t) => t.risk !== 'low').length
  const avgReadiness = Math.round(
    coachees.reduce((a, t) => a + t.readiness, 0) / (coachees.length || 1)
  )
  const upcoming = [...coachees].sort(
    (a, b) =>
      new Date(a.nextSessionDate).getTime() -
      new Date(b.nextSessionDate).getTime()
  )

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
        <StatTile
          label='Koçluk ilişkisi'
          value={coachees.length}
          icon={Users}
        />
        <StatTile
          label='Dikkat gerektiren'
          value={attention}
          hint='Yüksek dikkat + izle'
          icon={AlertTriangle}
          tone={attention ? 'danger' : 'default'}
        />
        <StatTile
          label='Ort. hazırlık'
          value={avgReadiness}
          hint='Eşik 70'
          icon={Gauge}
        />
        <StatTile
          label='Sıradaki seans'
          value={
            upcoming[0]
              ? `${daysUntil(upcoming[0].nextSessionDate, DEMO_TODAY)} gün`
              : '—'
          }
          hint={upcoming[0]?.name}
          icon={CalendarClock}
          tone='spark'
        />
      </div>

      <div className='grid gap-4 lg:grid-cols-3'>
        <SectionCard
          title='Öncelik kuyruğu'
          description={`${coach?.name ?? ''} · sinyallere göre sıralı. Önce kimle konuşmalısın?`}
          className='lg:col-span-2'
        >
          <ul className='space-y-3'>
            {coachees.map((t) => (
              <CoacheeCard key={t.id} trainee={t} />
            ))}
          </ul>
        </SectionCard>

        <SectionCard title='Seans ajandası' description='Önümüzdeki görüşmeler'>
          <ol className='relative space-y-4 border-s ps-4'>
            {upcoming.map((t) => (
              <li key={t.id} className='relative'>
                <span className='absolute -inset-s-[21px] top-1.5 size-2.5 rounded-full bg-primary ring-4 ring-card' />
                <p className='text-xs text-muted-foreground'>
                  {format(new Date(t.nextSessionDate), 'd MMMM EEEE', {
                    locale: tr,
                  })}
                </p>
                <p className='text-sm font-semibold'>{t.name}</p>
                <Link
                  to='/coaching'
                  search={{ mt: t.id }}
                  className='text-xs font-medium text-primary hover:underline'
                >
                  Hazırlık notlarını aç →
                </Link>
              </li>
            ))}
          </ol>
        </SectionCard>
      </div>
    </div>
  )
}

function CoacheeCard({ trainee: t }: { trainee: TraineeView }) {
  const silence = -daysUntil(t.lastSessionDate, DEMO_TODAY)
  return (
    <li className='rounded-2xl border p-3 transition-colors hover:border-primary/40 sm:p-4'>
      <div className='flex flex-wrap items-center gap-3'>
        <PersonAvatar name={t.name} initials={t.initials} />
        <div className='min-w-0 flex-1'>
          <p className='font-semibold'>{t.name}</p>
          <p className='truncate text-xs text-muted-foreground'>
            {t.currentDept?.name} · son seans {silence} gün önce
          </p>
        </div>
        <RiskBadge level={t.risk} />
      </div>

      <div className='mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center'>
        <ReadinessMeter value={t.readiness} />
        <Sparkline values={t.pulse} />
      </div>

      {t.signals.length > 0 && (
        <ul className='mt-3 flex flex-wrap gap-1.5'>
          {t.signals.map((s) => (
            <li
              key={s.id}
              title={s.detail}
              className='rounded-full bg-muted px-2 py-0.5 text-[11px]'
            >
              {s.label}
            </li>
          ))}
        </ul>
      )}

      <div className='mt-3 flex flex-wrap gap-2'>
        <Button asChild size='sm'>
          <Link to='/coaching' search={{ mt: t.id }}>
            <MessageCircleHeart /> Seansa hazırlan
          </Link>
        </Button>
        <Button asChild size='sm' variant='ghost'>
          <Link to='/journey' search={{ mt: t.id }}>
            <Route /> Yolculuk
          </Link>
        </Button>
      </div>
    </li>
  )
}
