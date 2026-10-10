import { useState } from 'react'
import { format } from 'date-fns'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { tr } from 'date-fns/locale'
import { CheckCheck, Lightbulb, MessageSquareQuote } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  PersonAvatar,
  ReadinessMeter,
  RiskBadge,
  SectionCard,
  Sparkline,
} from '../components/atoms'
import { PageShell } from '../components/page-shell'
import { TraineePicker } from '../components/trainee-picker'
import { getCoach } from '../data/people'
import { DEMO_TODAY } from '../data/program'
import { useCohortViews } from '../hooks/use-program'
import { sortByAttention, type TraineeView } from '../lib/derive'
import {
  competencyGaps,
  daysUntil,
  getDepartment,
  programMonth,
  pulseTrend,
} from '../lib/journey'
import { useProgramStore } from '../store/program-store'

const route = getRouteApi('/_authenticated/coaching/')

export function CoachingPage() {
  const { mt } = route.useSearch()
  const role = useProgramStore((s) => s.role)
  const coachId = useProgramStore((s) => s.coachId)
  const navigate = useNavigate()
  const cohort = useCohortViews()
  const visible = sortByAttention(
    role === 'coach' ? cohort.filter((t) => t.coachId === coachId) : cohort
  )
  const trainee = visible.find((t) => t.id === mt) ?? visible[0]
  if (!trainee) return null

  return (
    <PageShell
      eyebrow='Seans hazırlığı'
      title={`${trainee.name} ile koçluk`}
      description='Sinyallerden ajandaya: 5 dakikada hazırlan, seansı kaydet, taahhüdü takip et.'
    >
      <TraineePicker
        className='mb-4'
        trainees={visible}
        value={trainee.id}
        onChange={(id) =>
          navigate({ to: '/coaching', search: { mt: id }, replace: true })
        }
      />
      <div className='grid gap-4 lg:grid-cols-3'>
        <Snapshot trainee={trainee} />
        <Agenda trainee={trainee} />
        <SessionLog trainee={trainee} key={trainee.id} />
      </div>
    </PageShell>
  )
}

function Snapshot({ trainee: t }: { trainee: TraineeView }) {
  return (
    <SectionCard title='Durum' className='lg:row-span-2'>
      <div className='flex items-center gap-3'>
        <PersonAvatar name={t.name} initials={t.initials} className='size-11' />
        <div className='min-w-0 flex-1'>
          <p className='font-semibold'>{t.name}</p>
          <p className='truncate text-xs text-muted-foreground'>
            {t.currentDept?.name} · Koç {getCoach(t.coachId)?.name}
          </p>
        </div>
        <RiskBadge level={t.risk} />
      </div>
      <div className='mt-4 space-y-3'>
        <div>
          <p className='mb-1 text-xs text-muted-foreground'>Hazırlık</p>
          <ReadinessMeter value={t.readiness} />
        </div>
        <div className='flex items-center justify-between'>
          <p className='text-xs text-muted-foreground'>
            Enerji nabzı (eğilim {pulseTrend(t.pulse)})
          </p>
          <Sparkline values={t.pulse} />
        </div>
      </div>
      <h3 className='mt-5 mb-2 text-xs font-semibold'>Sinyaller</h3>
      {t.signals.length ? (
        <ul className='space-y-2'>
          {t.signals.map((s) => (
            <li
              key={s.id}
              className='rounded-xl border-s-4 bg-muted/50 px-3 py-2 data-[level=high]:border-destructive data-[level=medium]:border-warning'
              data-level={s.level}
            >
              <p className='text-sm font-medium'>{s.label}</p>
              <p className='text-xs text-muted-foreground'>{s.detail}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className='text-sm text-muted-foreground'>
          Sinyal yok. Bu seansı büyüme hedeflerine ayırabilirsin.
        </p>
      )}
      <h3 className='mt-5 mb-2 text-xs font-semibold'>
        MT’nin son yansımaları
      </h3>
      <ul className='space-y-2'>
        {t.allReflections.slice(0, 3).map((r) => (
          <li key={r.id} className='flex gap-2 text-sm'>
            <MessageSquareQuote className='mt-0.5 size-4 shrink-0 text-primary' />
            <span>
              {r.text}
              <span className='block text-[11px] text-muted-foreground'>
                {format(new Date(r.date), 'd MMM', { locale: tr })}
              </span>
            </span>
          </li>
        ))}
        {t.allReflections.length === 0 && (
          <li className='text-sm text-muted-foreground'>
            Yansıma yok; seansı “Bu ay seni en çok ne şaşırttı?” ile aç.
          </li>
        )}
      </ul>
    </SectionCard>
  )
}

/** Kurallara dayalı (yapay zekâ değil) seans ajandası önerisi. */
function Agenda({ trainee: t }: { trainee: TraineeView }) {
  const gaps = competencyGaps(t.competencies.m12).slice(0, 2)
  const month = programMonth(DEMO_TODAY)
  const items = [
    {
      title: 'Açılış · nabız',
      body: `Son nabız ${t.pulse[t.pulse.length - 1]}/5. “Bu hafta enerjini en çok ne besledi, ne tüketti?”`,
    },
    ...(t.signals.length
      ? [
          {
            title: 'Sinyal üzerine',
            body: `${t.signals[0].label}: ${t.signals[0].detail} Yargılamadan merak et; MT’nin kendi okumasını iste.`,
          },
        ]
      : []),
    ...gaps.map((g) => ({
      title: `Büyüme · ${g.competency.short} (hedefe ${g.gap.toFixed(1)})`,
      body: g.competency.coachingQuestion,
    })),
    ...(month >= 12
      ? [
          {
            title: 'Yerleşim beklentisi',
            body: `Tercihler: ${t.preferences.map((p) => getDepartment(p).name).join(' › ')}. “İlk tercihin olmazsa seni ne heyecanlandırır?”`,
          },
        ]
      : []),
    {
      title: 'Kapanış · taahhüt',
      body: 'Önümüzdeki 2 hafta için tek, gözlemlenebilir bir davranış taahhüdü.',
    },
  ]

  return (
    <SectionCard
      title='Önerilen ajanda'
      description='Sinyallerden kural tabanlı üretilir; koç kendi yargısıyla uyarlar.'
      action={<Lightbulb className='size-4 text-spark' />}
    >
      <ol className='space-y-3'>
        {items.map((item, i) => (
          <li key={item.title} className='flex gap-3'>
            <span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary'>
              {i + 1}
            </span>
            <div>
              <p className='text-sm font-semibold'>{item.title}</p>
              <p className='text-sm text-muted-foreground'>{item.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </SectionCard>
  )
}

function SessionLog({ trainee: t }: { trainee: TraineeView }) {
  const logSession = useProgramStore((s) => s.logSession)
  const [note, setNote] = useState('')
  const [commitment, setCommitment] = useState('')
  const silence = -daysUntil(t.lastSessionDate, DEMO_TODAY)

  return (
    <SectionCard
      title='Seans kaydı'
      description={`Son seans ${silence} gün önce · sıradaki ${format(new Date(t.nextSessionDate), 'd MMM', { locale: tr })}`}
    >
      <form
        className='space-y-3'
        onSubmit={(e) => {
          e.preventDefault()
          if (!note.trim()) return
          logSession(t.id, note.trim(), commitment.trim())
          setNote('')
          setCommitment('')
          toast.success('Seans kaydedildi', {
            description: 'Koçluk teması sinyali güncellendi.',
          })
        }}
      >
        <div className='space-y-1.5'>
          <Label htmlFor='session-note'>Ana içgörü</Label>
          <Textarea
            id='session-note'
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder='Bugün ne netleşti?'
            className='min-h-20 resize-none'
          />
        </div>
        <div className='space-y-1.5'>
          <Label htmlFor='session-commitment'>MT’nin taahhüdü</Label>
          <Input
            id='session-commitment'
            value={commitment}
            onChange={(e) => setCommitment(e.target.value)}
            placeholder='Örn. Host yöneticiyle haftalık 15 dk sync'
          />
        </div>
        <Button type='submit' disabled={!note.trim()} className='w-full'>
          <CheckCheck /> Seansı kaydet
        </Button>
      </form>

      {t.sessionNotes.length > 0 && (
        <ul className='mt-5 space-y-3 border-t pt-4'>
          {t.sessionNotes.map((s) => (
            <li key={s.id} className='text-sm'>
              <p className='text-[11px] text-muted-foreground'>
                {format(new Date(s.date), 'd MMM yyyy', { locale: tr })}
              </p>
              <p>{s.note}</p>
              {s.commitment && (
                <p className='mt-0.5 text-xs text-primary'>
                  Taahhüt: {s.commitment}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
