import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowDownUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  PersonAvatar,
  ReadinessMeter,
  RiskBadge,
  SectionCard,
  Sparkline,
} from '../components/atoms'
import { PageShell } from '../components/page-shell'
import { getCoach } from '../data/people'
import { COMPETENCIES, COMPETENCY_TARGET } from '../data/program'
import { useCohortViews } from '../hooks/use-program'
import { type TraineeView } from '../lib/derive'
import { competencyAverage, getDepartment, round1 } from '../lib/journey'

/** 1–5 skoru, hedefe göre renk yoğunluğuna çevirir. */
function heatClass(score: number) {
  const delta = score - COMPETENCY_TARGET
  if (delta >= 0.3) return 'bg-primary text-primary-foreground'
  if (delta >= 0) return 'bg-primary/70 text-primary-foreground'
  if (delta >= -0.4) return 'bg-primary/35'
  if (delta >= -0.8) return 'bg-primary/15'
  return 'bg-destructive/20'
}

type SortKey = 'readiness' | 'name' | 'risk'

export function CohortPage() {
  const cohort = useCohortViews()
  const [sort, setSort] = useState<SortKey>('readiness')
  const sorted = [...cohort].sort((a, b) =>
    sort === 'name'
      ? a.name.localeCompare(b.name, 'tr')
      : sort === 'risk'
        ? b.signals.length - a.signals.length
        : b.readiness - a.readiness
  )
  const compAvg = COMPETENCIES.map((c) =>
    round1(
      cohort.reduce((a, t) => a + t.competencies.m12[c.id], 0) / cohort.length
    )
  )

  return (
    <PageShell
      eyebrow='Kohort analitiği'
      title='Yetenek haritası'
      description='12. ay kalibrasyonu: kim nerede güçlü, kohort olarak nereye yatırım yapmalıyız?'
    >
      <div className='grid gap-4'>
        <SectionCard
          title='Yetkinlik ısı haritası (12. ay)'
          description={`Koyu = hedef ${COMPETENCY_TARGET} ve üstü · kırmızı = hedefin 0.8+ altında`}
        >
          <div className='-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0'>
            <table className='w-full min-w-[560px] border-separate border-spacing-1 text-xs'>
              <thead>
                <tr>
                  <th className='w-36 text-start font-medium text-muted-foreground'>
                    MT
                  </th>
                  {COMPETENCIES.map((c) => (
                    <th
                      key={c.id}
                      title={c.name}
                      className='font-medium text-muted-foreground'
                    >
                      {c.short}
                    </th>
                  ))}
                  <th className='font-medium text-muted-foreground'>Ort.</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((t) => (
                  <tr key={t.id}>
                    <td className='truncate pe-2 font-medium'>
                      <Link
                        to='/journey'
                        search={{ mt: t.id }}
                        className='hover:underline'
                      >
                        {t.name}
                      </Link>
                    </td>
                    {COMPETENCIES.map((c) => (
                      <td
                        key={c.id}
                        className={cn(
                          'h-8 rounded-md text-center font-semibold tabular-nums',
                          heatClass(t.competencies.m12[c.id])
                        )}
                      >
                        {t.competencies.m12[c.id].toFixed(1)}
                      </td>
                    ))}
                    <td className='text-center font-bold tabular-nums'>
                      {competencyAverage(t.competencies.m12).toFixed(1)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className='pt-2 font-semibold'>Kohort</td>
                  {compAvg.map((v, i) => (
                    <td
                      key={COMPETENCIES[i].id}
                      className='pt-2 text-center font-bold tabular-nums'
                    >
                      {v.toFixed(1)}
                    </td>
                  ))}
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
          <CohortInsight averages={compAvg} />
        </SectionCard>

        <SectionCard
          title='MT listesi'
          action={
            <Button
              size='sm'
              variant='outline'
              onClick={() =>
                setSort(
                  sort === 'readiness'
                    ? 'risk'
                    : sort === 'risk'
                      ? 'name'
                      : 'readiness'
                )
              }
            >
              <ArrowDownUp />
              {sort === 'readiness'
                ? 'Hazırlık'
                : sort === 'risk'
                  ? 'Sinyal'
                  : 'İsim'}
            </Button>
          }
        >
          <div className='-mx-4 overflow-x-auto sm:mx-0'>
            <Table className='min-w-[720px]'>
              <TableHeader>
                <TableRow>
                  <TableHead>MT</TableHead>
                  <TableHead>R3 birimi</TableHead>
                  <TableHead className='w-40'>Hazırlık</TableHead>
                  <TableHead>Nabız</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Taslak yerleşim</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((t) => (
                  <Row key={t.id} t={t} />
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      </div>
    </PageShell>
  )
}

function Row({ t }: { t: TraineeView }) {
  return (
    <TableRow>
      <TableCell>
        <div className='flex items-center gap-2'>
          <PersonAvatar
            name={t.name}
            initials={t.initials}
            className='size-7 text-[10px]'
          />
          <div>
            <p className='font-medium'>{t.name}</p>
            <p className='text-[11px] text-muted-foreground'>
              Koç: {getCoach(t.coachId)?.name}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className='text-xs'>{t.currentDept?.name}</TableCell>
      <TableCell>
        <ReadinessMeter value={t.readiness} />
      </TableCell>
      <TableCell>
        <Sparkline values={t.pulse} />
      </TableCell>
      <TableCell>
        <RiskBadge level={t.risk} />
      </TableCell>
      <TableCell className='text-xs'>
        {t.placement ? (
          getDepartment(t.placement).name
        ) : (
          <span className='text-muted-foreground'>—</span>
        )}
      </TableCell>
    </TableRow>
  )
}

function CohortInsight({ averages }: { averages: number[] }) {
  const lowest = averages
    .map((v, i) => ({ v, c: COMPETENCIES[i] }))
    .sort((a, b) => a.v - b.v)[0]
  return (
    <p className='mt-4 rounded-xl bg-spark/10 p-3 text-sm'>
      <strong>Kohort içgörüsü:</strong> En düşük ortalama{' '}
      <strong>{lowest.c.name}</strong> ({lowest.v.toFixed(1)}). Launchpad öncesi
      bu alana kohort düzeyinde bir öğrenme sprinti, bireysel koçluktan daha
      verimli olur.
    </p>
  )
}
