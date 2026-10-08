import { describe, expect, it } from 'vitest'
import { TRAINEES } from '../data/people'
import { COHORT, DEMO_TODAY } from '../data/program'
import {
  competencyGaps,
  expectedDeliverables,
  phaseForMonth,
  programMonth,
  pulseTrend,
  readinessIndex,
  riskLevel,
  riskSignals,
  validatePlacement,
} from './journey'

const at = (iso: string) => new Date(`${iso}T09:00:00`)

describe('programMonth', () => {
  it('starts at month 1 and clamps to 18', () => {
    expect(programMonth(COHORT.startDate)).toBe(1)
    expect(programMonth(at('2025-01-01'))).toBe(1)
    expect(programMonth(at('2030-01-01'))).toBe(18)
  })

  it('places the demo date in month 12 (Rotation 3)', () => {
    expect(programMonth(DEMO_TODAY)).toBe(12)
    expect(phaseForMonth(12).id).toBe('r3')
  })

  it('maps every month to exactly one phase', () => {
    expect(phaseForMonth(1).id).toBe('bootcamp')
    expect(phaseForMonth(5).id).toBe('r1')
    expect(phaseForMonth(6).id).toBe('r2')
    expect(phaseForMonth(14).id).toBe('launch')
  })
})

describe('readinessIndex', () => {
  const base = {
    competencies: TRAINEES[0].competencies,
    hostFeedback: [4.5, 4.5],
    totalDeliverables: 4,
    rotationProgress: 0.5,
  }

  it('rewards on-track delivery', () => {
    const behind = readinessIndex({ ...base, deliverablesDone: 0 })
    const onTrack = readinessIndex({ ...base, deliverablesDone: 2 })
    expect(onTrack - behind).toBe(20)
  })

  it('stays within 0–100', () => {
    const max = readinessIndex({
      ...base,
      competencies: {
        m6: TRAINEES[0].competencies.m6,
        m12: {
          business: 5,
          systems: 5,
          data: 5,
          influence: 5,
          ownership: 5,
          safety: 5,
        },
      },
      hostFeedback: [5],
      deliverablesDone: 4,
    })
    expect(max).toBe(100)
  })
})

describe('expectedDeliverables', () => {
  it('expects at least one deliverable once a rotation starts', () => {
    expect(expectedDeliverables(4, 0)).toBe(1)
    expect(expectedDeliverables(4, 0.55)).toBe(2)
    expect(expectedDeliverables(4, 1)).toBe(4)
  })
})

describe('risk signals', () => {
  const ctx = { today: DEMO_TODAY, readiness: 85, expectedDeliverables: 2 }
  const healthy = {
    pulse: [4, 4, 4, 4, 4, 4, 4, 4],
    lastSessionDate: '2026-10-01',
    deliverablesDone: 2,
    preferences: ['data' as const],
  }

  it('returns no signals for a healthy trainee', () => {
    const signals = riskSignals(healthy, ctx)
    expect(signals).toEqual([])
    expect(riskLevel(signals)).toBe('low')
  })

  it('flags a sharp pulse drop as high', () => {
    const signals = riskSignals(
      { ...healthy, pulse: [4, 4, 4, 4, 4, 2, 2, 2] },
      ctx
    )
    expect(signals.find((s) => s.id === 'pulse')?.level).toBe('high')
    expect(pulseTrend([4, 4, 4, 4, 4, 2, 2, 2])).toBe(-2)
  })

  it('flags long coaching silence', () => {
    const signals = riskSignals(
      { ...healthy, lastSessionDate: '2026-08-20' },
      ctx
    )
    expect(signals.map((s) => s.id)).toContain('coaching')
  })

  it('flags a placement outside preferences', () => {
    const signals = riskSignals(healthy, { ...ctx, placement: 'grid' })
    expect(signals.map((s) => s.id)).toEqual(['preference'])
    expect(riskLevel(signals)).toBe('medium')
  })
})

describe('validatePlacement', () => {
  const ece = TRAINEES[0]

  it('accepts a preferred, rotated department with capacity', () => {
    const check = validatePlacement(ece, 'data', {}, 90)
    expect(check).toEqual({ ok: true, blocking: [], warnings: [] })
  })

  it('blocks a department with no open roles', () => {
    expect(validatePlacement(ece, 'supply', {}, 90).ok).toBe(false)
  })

  it('blocks when capacity is already taken by others', () => {
    const check = validatePlacement(ece, 'strategy', { t07: 'strategy' }, 90)
    expect(check.ok).toBe(false)
  })

  it('does not count the trainee’s own current placement against capacity', () => {
    expect(
      validatePlacement(ece, 'strategy', { [ece.id]: 'strategy' }, 90).ok
    ).toBe(true)
  })

  it('warns on non-preferred, non-rotated, low-readiness placements', () => {
    const check = validatePlacement(ece, 'esg', {}, 55)
    expect(check.ok).toBe(true)
    expect(check.warnings).toHaveLength(3)
  })
})

describe('competencyGaps', () => {
  it('sorts the largest gap first', () => {
    const gaps = competencyGaps(TRAINEES[0].competencies.m12)
    expect(gaps[0].competency.id).toBe('influence')
    expect(gaps[0].gap).toBeGreaterThanOrEqual(gaps[1].gap)
  })
})
