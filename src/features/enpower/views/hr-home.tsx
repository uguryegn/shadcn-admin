import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Gauge,
  UserCheck,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  PersonAvatar,
  RiskBadge,
  SectionCard,
  StatTile,
} from '../components/atoms'
import { PhaseStrip } from '../components/phase-strip'
import { getCoach } from '../data/people'
import { DEMO_TODAY } from '../data/program'
import { useCohortViews } from '../hooks/use-program'
import { cohortMetrics } from '../lib/cohort'
import { sortByAttention } from '../lib/derive'
import { daysUntil, milestoneDate } from '../lib/journey'

const tl = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function HrHome() {
  const cohort = useCohortViews()
  const m = cohortMetrics(cohort)
  const daysToDecision = daysUntil(milestoneDate(13), DEMO_TODAY)
  const queue = sortByAttention(cohort).filter((t) => t.risk !== 'low')

  return (
    <div className='space-y-4'>
      <ExecutiveSummary
        metrics={m}
        daysToDecision={daysToDecision}
        attention={queue.length}
      />

      <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
        <StatTile
          label='Aktif MT / başlayan'
          value={`${m.active}/${m.started}`}
          hint={`Tutundurma %${m.retention}`}
          icon={UserCheck}
        />
        <StatTile
          label='Ort. hazırlık endeksi'
          value={m.avgReadiness}
          hint='Yerleşim eşiği 70'
          icon={Gauge}
        />
        <StatTile
          label='Yüksek dikkat'
          value={m.high.length}
          hint={`Risk altındaki yatırım ${tl.format(m.investmentAtRisk)}`}
          icon={AlertTriangle}
          tone='danger'
        />
        <StatTile
          label='Yerleşim planı'
          value={`${m.planned}/${m.active}`}
          hint={`${m.openRoles} açık kalıcı rol`}
          icon={Briefcase}
          tone='spark'
        />
      </div>

      <SectionCard
        title='Kohort nerede?'
        description='Tüm kohort aynı takvimde ilerler; aktif faz vurgulu.'
      >
        <PhaseStrip />
      </SectionCard>

      <div className='grid gap-4 lg:grid-cols-5'>
        <SectionCard
          title='Dikkat listesi'
          description='Koçla birlikte aksiyon alınacak MT’ler'
          className='lg:col-span-3'
          action={
            <Button asChild size='sm' variant='outline'>
              <Link to='/cohort'>Kohort analitiği</Link>
            </Button>
          }
        >
          <ul className='divide-y'>
            {queue.map((t) => (
              <li key={t.id} className='flex flex-wrap items-start gap-3 py-3'>
                <PersonAvatar name={t.name} initials={t.initials} />
                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <Link
                      to='/journey'
                      search={{ mt: t.id }}
                      className='font-semibold hover:underline'
                    >
                      {t.name}
                    </Link>
                    <RiskBadge level={t.risk} />
                  </div>
                  <p className='mt-0.5 text-xs text-muted-foreground'>
                    {t.signals.map((s) => s.label).join(' · ')}
                  </p>
                  <p className='mt-0.5 text-xs text-muted-foreground'>
                    Sahibi: {getCoach(t.coachId)?.name} (Talent Coach)
                  </p>
                </div>
                <span className='text-sm font-bold tabular-nums'>
                  {t.readiness}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title='Yetenek arzı vs. kalıcı rol talebi'
          description='Tercih yoğunluğu / açık rol. Sıcak noktalar tutundurma riskidir.'
          className='lg:col-span-2'
          action={
            <Button asChild size='sm'>
              <Link to='/rotation-map'>
                Planla <ArrowRight />
              </Link>
            </Button>
          }
        >
          <ul className='space-y-3'>
            {m.demand
              .filter((d) => d.dept.openRoles > 0 || d.anyChoice > 0)
              .sort((a, b) => b.anyChoice - a.anyChoice)
              .map((d) => {
                const max = 6
                const hot = d.anyChoice > d.dept.openRoles * 2
                return (
                  <li key={d.dept.id}>
                    <div className='flex justify-between text-xs'>
                      <span className='font-medium'>{d.dept.name}</span>
                      <span className='text-muted-foreground tabular-nums'>
                        {d.anyChoice} tercih · {d.dept.openRoles} rol ·{' '}
                        {d.planned} planlı
                      </span>
                    </div>
                    <div className='mt-1 flex h-2 gap-0.5'>
                      <div
                        className={cn(
                          'rounded-full',
                          hot ? 'bg-destructive/70' : 'bg-primary/70'
                        )}
                        style={{ width: `${(d.anyChoice / max) * 100}%` }}
                      />
                      <div
                        className='rounded-full bg-spark'
                        style={{
                          width: `${(d.dept.openRoles / max) * 100}%`,
                        }}
                      />
                    </div>
                  </li>
                )
              })}
          </ul>
          <p className='mt-3 flex gap-3 text-[11px] text-muted-foreground'>
            <span className='flex items-center gap-1'>
              <span className='size-2 rounded-full bg-primary/70' /> Tercih
            </span>
            <span className='flex items-center gap-1'>
              <span className='size-2 rounded-full bg-spark' /> Açık rol
            </span>
            <span className='flex items-center gap-1'>
              <span className='size-2 rounded-full bg-destructive/70' /> Sıcak
              nokta
            </span>
          </p>
        </SectionCard>
      </div>
    </div>
  )
}

function ExecutiveSummary({
  metrics: m,
  daysToDecision,
  attention,
}: {
  metrics: ReturnType<typeof cohortMetrics>
  daysToDecision: number
  attention: number
}) {
  const unplanned = m.active - m.planned
  return (
    <section className='relative overflow-hidden rounded-3xl bg-sidebar p-5 text-sidebar-foreground shadow-lg sm:p-7'>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute -inset-e-20 -top-24 size-72 rounded-full bg-sidebar-primary/20 blur-3xl'
      />
      <div className='relative grid gap-5 md:grid-cols-[1.4fr_1fr]'>
        <div>
          <p className='flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-sidebar-primary uppercase'>
            <Wallet className='size-3.5' /> Yönetim özeti
          </p>
          <h2 className='mt-2 font-manrope text-xl font-extrabold tracking-tight sm:text-2xl'>
            Yerleşim kararına {daysToDecision} gün var; {unplanned} MT için
            kalıcı rol henüz netleşmedi.
          </h2>
          <p className='mt-2 text-sm opacity-80'>
            Kohort sağlıklı ilerliyor (ort. hazırlık {m.avgReadiness}), ancak{' '}
            {m.high.length} MT yüksek dikkat gerektiriyor. Erken müdahale
            edilmezse risk altındaki program yatırımı{' '}
            <strong className='text-spark'>
              {tl.format(m.investmentAtRisk)}
            </strong>
            .
          </p>
        </div>
        <ul className='space-y-2 text-sm'>
          <li className='rounded-2xl bg-white/8 p-3 ring-1 ring-white/10'>
            <span className='font-semibold'>Öneri 1 · </span>
            {attention} MT için koçlarla 2 hafta içinde odak seansı.
          </li>
          <li className='rounded-2xl bg-white/8 p-3 ring-1 ring-white/10'>
            <span className='font-semibold'>Öneri 2 · </span>
            {m.hotspots.length
              ? `${m.hotspots.map((h) => h.dept.name).join(', ')} için talep fazla; alternatif rol hikâyesi hazırla.`
              : 'Tercih ve rol dengesi yönetilebilir.'}
          </li>
          <li className='rounded-2xl bg-white/8 p-3 ring-1 ring-white/10'>
            <span className='font-semibold'>Öneri 3 · </span>
            Kalan {unplanned} yerleşimi planlayıcıda taslakla, host
            yöneticilerle kalibre et.
          </li>
        </ul>
      </div>
    </section>
  )
}
