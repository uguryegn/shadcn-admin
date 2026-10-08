import { lazy, Suspense, useMemo, useState } from 'react'
import { ArrowRight, Ban, Check, TriangleAlert, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReadinessMeter, SectionCard } from '../components/atoms'
import { PageShell } from '../components/page-shell'
import { TraineePicker } from '../components/trainee-picker'
import { DEMO_TODAY, DEPARTMENTS, type DepartmentId } from '../data/program'
import { useCohortViews } from '../hooks/use-program'
import { type TraineeView } from '../lib/derive'
import {
  getDepartment,
  phaseForMonth,
  programMonth,
  validatePlacement,
} from '../lib/journey'
import { useProgramStore } from '../store/program-store'

const RotationMap = lazy(
  () => import('../components/rotation-map/rotation-map')
)

const currentPhase = phaseForMonth(programMonth(DEMO_TODAY)).id

export function RotationMapPage() {
  const role = useProgramStore((s) => s.role)
  const mtId = useProgramStore((s) => s.mtId)
  const coachId = useProgramStore((s) => s.coachId)
  const placements = useProgramStore((s) => s.placements)
  const setPlacement = useProgramStore((s) => s.setPlacement)
  const cohort = useCohortViews()
  const isMobile = useIsMobile()

  const pickable =
    role === 'coach' ? cohort.filter((t) => t.coachId === coachId) : cohort
  const [picked, setPicked] = useState<string | undefined>(
    role === 'hr' ? undefined : role === 'mt' ? mtId : pickable[0]?.id
  )
  const focusId = role === 'mt' ? mtId : picked
  const focus = cohort.find((t) => t.id === focusId)
  const isPlanner = role === 'hr'

  // MT, diğer MT'lerin taslak yerleşimlerini görmez.
  const visiblePlacements = role === 'mt' ? {} : placements

  const checks = useMemo(() => {
    if (!isPlanner || !focus) return undefined
    return Object.fromEntries(
      DEPARTMENTS.filter((d) => d.openRoles > 0).map((d) => [
        d.id,
        validatePlacement(focus, d.id, placements, focus.readiness),
      ])
    ) as Record<DepartmentId, ReturnType<typeof validatePlacement>>
  }, [isPlanner, focus, placements])

  const assignability = useMemo(
    () =>
      checks
        ? (Object.fromEntries(
            Object.entries(checks).map(([id, c]) => [
              id,
              !c.ok ? 'blocked' : c.warnings.length ? 'warn' : 'ok',
            ])
          ) as Partial<Record<DepartmentId, 'ok' | 'warn' | 'blocked'>>)
        : undefined,
    [checks]
  )

  const assign = (dept: DepartmentId) => {
    if (!focus || !checks) return
    const check = checks[dept]
    if (!check.ok) {
      toast.error(check.blocking[0])
      return
    }
    setPlacement(focus.id, dept)
    toast.success(`${focus.name} → ${getDepartment(dept).name}`, {
      description: check.warnings.length
        ? check.warnings.join(' ')
        : 'Tercih, rotasyon geçmişi ve kapasite uyumlu.',
    })
  }

  const focusIds = useMemo(() => (focusId ? [focusId] : []), [focusId])

  return (
    <PageShell
      eyebrow={isPlanner ? 'Yerleşim planlayıcı' : 'Rotasyon haritası'}
      title={isPlanner ? 'Rotasyon & Yerleşim Haritası' : 'Rotasyon Haritası'}
      description={
        isPlanner
          ? 'Bir MT seç, haritada yeşil/sarı halkalı rol kutusuna dokunarak taslak yerleşim yap. Kapasite, tercih ve hazırlık anında kontrol edilir.'
          : 'Kohortun 18 ay boyunca birimler arasındaki akışı. Kalın çizgi = daha çok MT.'
      }
      fluid
    >
      {role !== 'mt' && (
        <TraineePicker
          className='mb-4'
          trainees={pickable}
          value={picked}
          onChange={setPicked}
          allowAll
        />
      )}

      <div
        className={cn(
          'grid gap-4',
          isPlanner && focus && 'xl:grid-cols-[1fr_360px]'
        )}
      >
        <Tabs defaultValue={isMobile ? 'list' : 'map'} key={String(isMobile)}>
          <TabsList>
            <TabsTrigger value='map'>Harita</TabsTrigger>
            <TabsTrigger value='list'>Liste</TabsTrigger>
          </TabsList>
          <TabsContent value='map'>
            <div className='h-[58svh] min-h-[380px] overflow-hidden rounded-2xl border bg-card md:h-[72svh] md:min-h-[480px]'>
              <Suspense fallback={<Skeleton className='size-full' />}>
                <RotationMap
                  trainees={cohort}
                  placements={visiblePlacements}
                  currentPhase={currentPhase}
                  focusIds={focusIds}
                  assignability={assignability}
                  onAssign={assign}
                  fitToFocus={isMobile}
                />
              </Suspense>
            </div>
            <Legend planner={isPlanner} />
          </TabsContent>
          <TabsContent value='list'>
            <PathList
              trainees={
                role === 'mt' ? cohort.filter((t) => t.id === mtId) : pickable
              }
              placements={visiblePlacements}
              focusId={focusId}
            />
          </TabsContent>
        </Tabs>

        {isPlanner && focus && checks && (
          <PlannerPanel
            trainee={focus}
            checks={checks}
            placements={placements}
            onAssign={assign}
            onClear={() => {
              setPlacement(focus.id, undefined)
              toast('Taslak yerleşim kaldırıldı')
            }}
          />
        )}
      </div>
    </PageShell>
  )
}

function Legend({ planner }: { planner: boolean }) {
  return (
    <ul className='mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] text-muted-foreground'>
      <li className='flex items-center gap-1.5'>
        <span className='h-0.5 w-5 rounded bg-muted-foreground/50' />{' '}
        Gerçekleşen akış
      </li>
      <li className='flex items-center gap-1.5'>
        <span className='h-0.5 w-5 rounded border-t-2 border-dashed border-spark' />{' '}
        Taslak yerleşim
      </li>
      <li className='flex items-center gap-1.5'>
        <span className='h-0.5 w-5 rounded bg-primary' /> Seçili MT yolu
      </li>
      {planner && (
        <>
          <li className='flex items-center gap-1.5'>
            <Check className='size-3.5 text-success' /> Uygun
          </li>
          <li className='flex items-center gap-1.5'>
            <TriangleAlert className='size-3.5 text-warning' /> Uyarılı
          </li>
          <li className='flex items-center gap-1.5'>
            <Ban className='size-3.5 text-destructive' /> Kapasite yok
          </li>
        </>
      )}
    </ul>
  )
}

function PathList({
  trainees,
  placements,
  focusId,
}: {
  trainees: TraineeView[]
  placements: Record<string, DepartmentId | undefined>
  focusId?: string
}) {
  return (
    <ul className='space-y-2'>
      {trainees.map((t) => {
        const steps = [t.rotations.r1, t.rotations.r2, t.rotations.r3].filter(
          Boolean
        ) as DepartmentId[]
        const placement = placements[t.id]
        return (
          <li
            key={t.id}
            className={cn(
              'rounded-2xl border bg-card p-3',
              focusId === t.id && 'border-primary ring-2 ring-primary/20'
            )}
          >
            <p className='text-sm font-semibold'>{t.name}</p>
            <div className='mt-2 flex flex-wrap items-center gap-1.5 text-xs'>
              {steps.map((d, i) => (
                <span key={d} className='flex items-center gap-1.5'>
                  {i > 0 && (
                    <ArrowRight className='size-3 text-muted-foreground' />
                  )}
                  <span className='rounded-lg bg-accent px-2 py-1 text-accent-foreground'>
                    R{i + 1} · {getDepartment(d).name}
                  </span>
                </span>
              ))}
              <ArrowRight className='size-3 text-muted-foreground' />
              <span
                className={cn(
                  'rounded-lg border border-dashed px-2 py-1',
                  placement ? 'border-spark' : 'text-muted-foreground'
                )}
              >
                {placement ? getDepartment(placement).name : 'Kalıcı rol ?'}
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function PlannerPanel({
  trainee,
  checks,
  placements,
  onAssign,
  onClear,
}: {
  trainee: TraineeView
  checks: Record<DepartmentId, ReturnType<typeof validatePlacement>>
  placements: Record<string, DepartmentId | undefined>
  onAssign: (d: DepartmentId) => void
  onClear: () => void
}) {
  const current = trainee.placement
  return (
    <SectionCard
      title={`${trainee.name} için yerleşim`}
      description={`Tercihler: ${trainee.preferences.map((p) => getDepartment(p).name).join(' › ')}`}
      className='xl:sticky xl:top-20 xl:self-start'
    >
      <ReadinessMeter value={trainee.readiness} />
      {current && (
        <div className='mt-3 flex items-center justify-between rounded-xl bg-spark/15 px-3 py-2 text-sm'>
          <span>
            Taslak: <strong>{getDepartment(current).name}</strong>
          </span>
          <Button size='sm' variant='ghost' onClick={onClear}>
            <X /> Kaldır
          </Button>
        </div>
      )}
      <ul className='mt-4 space-y-2'>
        {(Object.keys(checks) as DepartmentId[]).map((id) => {
          const dept = getDepartment(id)
          const check = checks[id]
          const taken = Object.values(placements).filter((p) => p === id).length
          const isCurrent = current === id
          return (
            <li
              key={id}
              className={cn(
                'rounded-xl border p-2.5',
                isCurrent && 'border-spark bg-spark/5'
              )}
            >
              <div className='flex items-center gap-2'>
                {!check.ok ? (
                  <Ban className='size-4 shrink-0 text-destructive' />
                ) : check.warnings.length ? (
                  <TriangleAlert className='size-4 shrink-0 text-warning' />
                ) : (
                  <Check className='size-4 shrink-0 text-success' />
                )}
                <span className='flex-1 text-sm font-medium'>{dept.name}</span>
                <span className='text-[11px] text-muted-foreground tabular-nums'>
                  {taken}/{dept.openRoles}
                </span>
                <Button
                  size='sm'
                  variant={isCurrent ? 'secondary' : 'outline'}
                  disabled={!check.ok || isCurrent}
                  onClick={() => onAssign(id)}
                  aria-label={`${dept.name} birimine ata`}
                >
                  {isCurrent ? 'Atandı' : 'Ata'}
                </Button>
              </div>
              {[...check.blocking, ...check.warnings].length > 0 && (
                <ul className='mt-1.5 space-y-0.5 ps-6 text-[11px] text-muted-foreground'>
                  {[...check.blocking, ...check.warnings].map((w) => (
                    <li key={w}>• {w}</li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </SectionCard>
  )
}
