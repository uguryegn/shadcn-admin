import { describe, expect, it } from 'vitest'
import { getTrainee } from '../data/people'
import { DEMO_TODAY } from '../data/program'
import { initialProgramState } from '../store/program-store'
import { deriveTrainee, sortByAttention } from './derive'

describe('deriveTrainee', () => {
  const state = initialProgramState()

  it('resolves the current R3 department', () => {
    const view = deriveTrainee(getTrainee('t01')!, state, DEMO_TODAY)
    expect(view.currentDept?.id).toBe('data')
    expect(view.risk).toBe('low')
  })

  it('surfaces a fictional at-risk trainee', () => {
    const view = deriveTrainee(getTrainee('t03')!, state, DEMO_TODAY)
    expect(view.risk).toBe('high')
    expect(view.signals.map((s) => s.id)).toEqual(
      expect.arrayContaining(['pulse', 'coaching'])
    )
  })

  it('clears the coaching signal after a session is logged', () => {
    const logged = {
      ...state,
      sessions: {
        t03: [{ id: 's1', date: '2026-10-08', note: 'x', commitment: '' }],
      },
    }
    const view = deriveTrainee(getTrainee('t03')!, logged, DEMO_TODAY)
    expect(view.signals.map((s) => s.id)).not.toContain('coaching')
  })

  it('applies this week’s pulse check-in', () => {
    const view = deriveTrainee(
      getTrainee('t01')!,
      { ...state, pulseCheckins: { t01: 1 } },
      DEMO_TODAY
    )
    expect(view.pulse[view.pulse.length - 1]).toBe(1)
    expect(view.pulse).toHaveLength(8)
  })

  it('orders the attention queue by risk first', () => {
    const views = ['t01', 't03', 't09'].map((id) =>
      deriveTrainee(getTrainee(id)!, state, DEMO_TODAY)
    )
    expect(sortByAttention(views)[views.length - 1].id).toBe('t01')
  })
})
