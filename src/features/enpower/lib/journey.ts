import {
  addMonths,
  differenceInCalendarDays,
  differenceInMonths,
} from 'date-fns'
import { type Trainee } from '../data/people'
import {
  COHORT,
  COMPETENCIES,
  COMPETENCY_TARGET,
  DEPARTMENTS,
  MILESTONES,
  PHASES,
  type CompetencyId,
  type Department,
  type DepartmentId,
  type Phase,
} from '../data/program'

/* ------------------------------------------------------------------ */
/* Zaman                                                               */
/* ------------------------------------------------------------------ */

/** Programın kaçıncı ayındayız (1–18). */
export function programMonth(today: Date, start: Date = COHORT.startDate) {
  const elapsed = differenceInMonths(today, start) + 1
  return Math.min(COHORT.durationMonths, Math.max(1, elapsed))
}

export function phaseForMonth(month: number): Phase {
  return (
    PHASES.find((p) => month >= p.startMonth && month <= p.endMonth) ??
    PHASES[PHASES.length - 1]
  )
}

export function phaseWindow(phase: Phase, start: Date = COHORT.startDate) {
  return {
    start: addMonths(start, phase.startMonth - 1),
    end: addMonths(start, phase.endMonth),
  }
}

/** Mevcut fazın ne kadarının tamamlandığı (0–1). */
export function phaseProgress(today: Date, start: Date = COHORT.startDate) {
  const phase = phaseForMonth(programMonth(today, start))
  const { start: from, end: to } = phaseWindow(phase, start)
  const total = differenceInCalendarDays(to, from)
  const done = differenceInCalendarDays(today, from)
  return clamp01(done / total)
}

/** Tüm 18 aylık programın tamamlanma oranı (0–1). */
export function programProgress(today: Date, start: Date = COHORT.startDate) {
  const end = addMonths(start, COHORT.durationMonths)
  return clamp01(
    differenceInCalendarDays(today, start) /
      differenceInCalendarDays(end, start)
  )
}

export function daysUntil(date: string | Date, today: Date) {
  return differenceInCalendarDays(new Date(date), today)
}

export function nextMilestone(month: number) {
  return MILESTONES.find((m) => m.month >= month) ?? null
}

/* ------------------------------------------------------------------ */
/* Rotasyon                                                            */
/* ------------------------------------------------------------------ */

export function getDepartment(id: DepartmentId): Department {
  const dept = DEPARTMENTS.find((d) => d.id === id)
  if (!dept) throw new Error(`Unknown department: ${id}`)
  return dept
}

/** Belirli bir fazda MT'nin bulunduğu birim (bootcamp/launch için yok). */
export function departmentInPhase(
  trainee: Pick<Trainee, 'rotations'>,
  phaseId: Phase['id']
): DepartmentId | undefined {
  if (phaseId === 'r1' || phaseId === 'r2' || phaseId === 'r3')
    return trainee.rotations[phaseId]
  return undefined
}

/* ------------------------------------------------------------------ */
/* Yetkinlik & hazırlık                                                */
/* ------------------------------------------------------------------ */

export function competencyAverage(scores: Record<CompetencyId, number>) {
  const values = COMPETENCIES.map((c) => scores[c.id])
  return round1(values.reduce((a, b) => a + b, 0) / values.length)
}

/** Hedefe en uzak yetkinlikler önce. */
export function competencyGaps(scores: Record<CompetencyId, number>) {
  return COMPETENCIES.map((c) => ({
    competency: c,
    score: scores[c.id],
    gap: round1(COMPETENCY_TARGET - scores[c.id]),
  })).sort((a, b) => b.gap - a.gap)
}

/** Bugüne kadar tamamlanmış olması beklenen çıktı sayısı. */
export function expectedDeliverables(total: number, rotationProgress: number) {
  return Math.max(1, Math.round(total * clamp01(rotationProgress)))
}

export type ReadinessInput = Pick<
  Trainee,
  'competencies' | 'hostFeedback' | 'deliverablesDone'
> & {
  totalDeliverables: number
  rotationProgress: number
}

/**
 * Kalıcı role hazırlık endeksi (0–100).
 * %50 yetkinlik (hedefe göre) · %30 host geri bildirimi · %20 teslim ritmi.
 * Ölçekler 1'den başlar; ham ortalama yerine kazanılan mesafe ölçülür.
 */
export function readinessIndex(input: ReadinessInput) {
  // 1–5 ölçeği 0–1'e taşınır: 1 = başlangıç, hedef/5 = tam puan.
  const comp = clamp01(
    (competencyAverage(input.competencies.m12) - 1) / (COMPETENCY_TARGET - 1)
  )
  const feedback = input.hostFeedback.length
    ? clamp01((avg(input.hostFeedback) - 1) / 4)
    : 0
  const expected = expectedDeliverables(
    input.totalDeliverables,
    input.rotationProgress
  )
  const delivery = clamp01(input.deliverablesDone / expected)
  return Math.round((comp * 0.5 + feedback * 0.3 + delivery * 0.2) * 100)
}

/** Nabız eğilimi: son 3 hafta ortalaması − önceki 3 hafta ortalaması. */
export function pulseTrend(pulse: number[]) {
  if (pulse.length < 6) return 0
  const recent = avg(pulse.slice(-3))
  const before = avg(pulse.slice(-6, -3))
  return round1(recent - before)
}

/* ------------------------------------------------------------------ */
/* Risk sinyalleri                                                     */
/* ------------------------------------------------------------------ */

export type RiskLevel = 'high' | 'medium' | 'low'

export type RiskSignal = {
  id: string
  level: Exclude<RiskLevel, 'low'>
  label: string
  detail: string
}

export type RiskContext = {
  today: Date
  readiness: number
  expectedDeliverables: number
  placement?: DepartmentId
}

export function riskSignals(
  trainee: Pick<
    Trainee,
    'pulse' | 'lastSessionDate' | 'deliverablesDone' | 'preferences'
  >,
  ctx: RiskContext
): RiskSignal[] {
  const signals: RiskSignal[] = []
  const recentPulse = avg(trainee.pulse.slice(-3))
  const trend = pulseTrend(trainee.pulse)

  if (recentPulse <= 2.5 || trend <= -1) {
    signals.push({
      id: 'pulse',
      level: 'high',
      label: 'Enerji düşüşü',
      detail: `Son 3 hafta nabız ortalaması ${round1(recentPulse)} (eğilim ${trend}).`,
    })
  } else if (trend <= -0.5 || recentPulse < 3.3) {
    signals.push({
      id: 'pulse',
      level: 'medium',
      label: 'Enerji yavaşlıyor',
      detail: `Nabız eğilimi ${trend}, ortalama ${round1(recentPulse)}.`,
    })
  }

  const silence = differenceInCalendarDays(
    ctx.today,
    new Date(trainee.lastSessionDate)
  )
  if (silence > 35) {
    signals.push({
      id: 'coaching',
      level: 'high',
      label: 'Koçluk teması koptu',
      detail: `${silence} gündür koçluk seansı yapılmadı.`,
    })
  } else if (silence > 21) {
    signals.push({
      id: 'coaching',
      level: 'medium',
      label: 'Seans aralığı açıldı',
      detail: `${silence} gündür koçluk seansı yok (hedef ≤ 21 gün).`,
    })
  }

  if (trainee.deliverablesDone < ctx.expectedDeliverables) {
    const behind = ctx.expectedDeliverables - trainee.deliverablesDone
    signals.push({
      id: 'delivery',
      level: behind >= 2 ? 'high' : 'medium',
      label: 'Teslim ritmi geride',
      detail: `Rotasyon planına göre ${behind} çıktı geride.`,
    })
  }

  if (ctx.readiness < 70) {
    signals.push({
      id: 'readiness',
      level: ctx.readiness < 60 ? 'high' : 'medium',
      label: 'Yerleşime hazırlık düşük',
      detail: `Hazırlık endeksi ${ctx.readiness}/100 (eşik 70).`,
    })
  }

  if (ctx.placement && !trainee.preferences.includes(ctx.placement)) {
    signals.push({
      id: 'preference',
      level: 'medium',
      label: 'Tercih uyumsuzluğu',
      detail: `Planlanan rol (${getDepartment(ctx.placement).name}) MT tercihleri arasında değil.`,
    })
  }

  return signals
}

export function riskLevel(signals: RiskSignal[]): RiskLevel {
  if (signals.some((s) => s.level === 'high')) return 'high'
  if (signals.length >= 2) return 'high'
  if (signals.length === 1) return 'medium'
  return 'low'
}

/* ------------------------------------------------------------------ */
/* Yerleşim planlama                                                   */
/* ------------------------------------------------------------------ */

export type PlacementCheck = {
  ok: boolean
  blocking: string[]
  warnings: string[]
}

export function validatePlacement(
  trainee: Pick<Trainee, 'id' | 'rotations' | 'preferences'>,
  deptId: DepartmentId,
  placements: Record<string, DepartmentId | undefined>,
  readiness: number
): PlacementCheck {
  const dept = getDepartment(deptId)
  const blocking: string[] = []
  const warnings: string[] = []

  const taken = Object.entries(placements).filter(
    ([id, d]) => d === deptId && id !== trainee.id
  ).length
  if (dept.openRoles === 0)
    blocking.push(`${dept.name} biriminde açık rol yok.`)
  else if (taken >= dept.openRoles)
    blocking.push(`${dept.name} kapasitesi dolu (${taken}/${dept.openRoles}).`)

  const rotated = Object.values(trainee.rotations).includes(deptId)
  if (!rotated)
    warnings.push('MT bu birimde rotasyon yapmadı; ilk 90 gün desteği gerekir.')
  if (!trainee.preferences.includes(deptId))
    warnings.push('MT’nin ilk iki tercihi arasında değil; tutundurma riski.')
  if (readiness < 70)
    warnings.push(
      `Hazırlık endeksi ${readiness}; geçiş planı ile desteklenmeli.`
    )

  return { ok: blocking.length === 0, blocking, warnings }
}

/* ------------------------------------------------------------------ */
/* yardımcılar                                                          */
/* ------------------------------------------------------------------ */

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

function avg(values: number[]) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
}

export function round1(n: number) {
  return Math.round(n * 10) / 10
}

/** Kilometre taşının hedef tarihi: ilgili ayın son haftası. */
export function milestoneDate(month: number, start: Date = COHORT.startDate) {
  const endOfMonth = addMonths(start, month)
  return new Date(endOfMonth.getTime() - 7 * 24 * 60 * 60 * 1000)
}
