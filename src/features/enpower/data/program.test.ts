import { describe, expect, it } from 'vitest'
import { ACTIVE_TRAINEES, COACHES, TRAINEES } from './people'
import { DEPARTMENTS, PHASES } from './program'

describe('fictional program data', () => {
  it('covers 18 months without gaps', () => {
    let month = 1
    for (const phase of PHASES) {
      expect(phase.startMonth).toBe(month)
      month = phase.endMonth + 1
    }
    expect(month - 1).toBe(18)
  })

  it('assigns each active trainee one rotation per track', () => {
    for (const t of ACTIVE_TRAINEES) {
      const tracks = [t.rotations.r1, t.rotations.r2, t.rotations.r3].map(
        (id) => DEPARTMENTS.find((d) => d.id === id)?.track
      )
      expect(tracks).toEqual(['operations', 'commercial', 'transformation'])
    }
  })

  it('respects rotation capacity in every phase', () => {
    for (const phase of ['r1', 'r2', 'r3'] as const) {
      for (const d of DEPARTMENTS) {
        const n = TRAINEES.filter((t) => t.rotations[phase] === d.id).length
        expect(n).toBeLessThanOrEqual(d.rotationCapacity)
      }
    }
  })

  it('gives every coach a balanced caseload', () => {
    for (const c of COACHES) {
      expect(ACTIVE_TRAINEES.filter((t) => t.coachId === c.id)).toHaveLength(3)
    }
  })

  it('has enough open roles for the active cohort', () => {
    const roles = DEPARTMENTS.reduce((a, d) => a + d.openRoles, 0)
    expect(roles).toBeGreaterThanOrEqual(ACTIVE_TRAINEES.length)
  })
})
