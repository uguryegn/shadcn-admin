import { TRAINEES } from '../data/people'
import { COHORT, DEPARTMENTS } from '../data/program'
import { type TraineeView } from './derive'

/** İK kokpiti için kohort seviyesinde metrikler. */
export function cohortMetrics(cohort: TraineeView[]) {
  const started = TRAINEES.length
  const active = cohort.length
  const high = cohort.filter((t) => t.risk === 'high')
  const planned = cohort.filter((t) => t.placement).length
  const openRoles = DEPARTMENTS.reduce((a, d) => a + d.openRoles, 0)
  const avgReadiness = Math.round(
    cohort.reduce((a, t) => a + t.readiness, 0) / (active || 1)
  )
  const demand = DEPARTMENTS.map((d) => ({
    dept: d,
    firstChoice: cohort.filter((t) => t.preferences[0] === d.id).length,
    anyChoice: cohort.filter((t) => t.preferences.includes(d.id)).length,
    planned: cohort.filter((t) => t.placement === d.id).length,
  }))
  return {
    started,
    active,
    retention: Math.round((active / started) * 100),
    high,
    planned,
    openRoles,
    avgReadiness,
    investmentAtRisk: high.length * COHORT.investmentPerTrainee,
    demand,
    hotspots: demand.filter((d) => d.anyChoice > d.dept.openRoles * 2),
  }
}
