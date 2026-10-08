import { type Reflection, type Trainee } from '../data/people'
import { type Department, type DepartmentId } from '../data/program'
import { type SessionNote } from '../store/program-store'
import {
  departmentInPhase,
  expectedDeliverables,
  getDepartment,
  phaseForMonth,
  phaseProgress,
  programMonth,
  readinessIndex,
  riskLevel,
  riskSignals,
  type RiskLevel,
  type RiskSignal,
} from './journey'

export type DerivedState = {
  pulseCheckins: Record<string, number>
  deliverables: Record<string, number[]>
  placements: Record<string, DepartmentId | undefined>
  reflections: Record<string, Reflection[]>
  sessions: Record<string, SessionNote[]>
}

export type TraineeView = Trainee & {
  currentDept?: Department
  doneDeliverables: number[]
  expectedDeliverables: number
  readiness: number
  risk: RiskLevel
  signals: RiskSignal[]
  placement?: DepartmentId
  allReflections: Reflection[]
  sessionNotes: SessionNote[]
}

/** Seed veriyi kullanıcının demo içindeki etkileşimleriyle birleştirir. */
export function deriveTrainee(
  trainee: Trainee,
  state: DerivedState,
  today: Date
): TraineeView {
  const phase = phaseForMonth(programMonth(today))
  const deptId = departmentInPhase(trainee, phase.id)
  const currentDept = deptId ? getDepartment(deptId) : undefined
  const total = currentDept?.deliverables.length ?? 4
  const progress = phaseProgress(today)
  const done = state.deliverables[trainee.id] ?? []
  const checkin = state.pulseCheckins[trainee.id]
  const pulse = checkin ? [...trainee.pulse.slice(1), checkin] : trainee.pulse
  const sessionNotes = state.sessions[trainee.id] ?? []
  const lastSessionDate = sessionNotes[0]?.date ?? trainee.lastSessionDate
  const placement = state.placements[trainee.id]

  const expected = expectedDeliverables(total, progress)
  const readiness = readinessIndex({
    competencies: trainee.competencies,
    hostFeedback: trainee.hostFeedback,
    deliverablesDone: done.length,
    totalDeliverables: total,
    rotationProgress: progress,
  })
  const signals = riskSignals(
    {
      pulse,
      lastSessionDate,
      deliverablesDone: done.length,
      preferences: trainee.preferences,
    },
    { today, readiness, expectedDeliverables: expected, placement }
  )

  return {
    ...trainee,
    pulse,
    lastSessionDate,
    deliverablesDone: done.length,
    currentDept,
    doneDeliverables: done,
    expectedDeliverables: expected,
    readiness,
    risk: riskLevel(signals),
    signals,
    placement,
    allReflections: [
      ...(state.reflections[trainee.id] ?? []),
      ...trainee.reflections,
    ],
    sessionNotes,
  }
}

const RISK_ORDER = { high: 0, medium: 1, low: 2 } as const

/** Önce yüksek dikkat, sonra sinyal sayısı, sonra düşük hazırlık. */
export function sortByAttention(list: TraineeView[]) {
  return [...list].sort(
    (a, b) =>
      RISK_ORDER[a.risk] - RISK_ORDER[b.risk] ||
      b.signals.length - a.signals.length ||
      a.readiness - b.readiness
  )
}
