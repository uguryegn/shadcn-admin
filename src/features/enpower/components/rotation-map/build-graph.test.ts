import { describe, expect, it } from 'vitest'
import { ACTIVE_TRAINEES } from '../../data/people'
import { DEPARTMENTS } from '../../data/program'
import { buildRotationGraph } from './build-graph'

const base = {
  trainees: ACTIVE_TRAINEES,
  placements: {},
  currentPhase: 'r3' as const,
}

describe('buildRotationGraph', () => {
  it('creates bootcamp, 9 rotation slots and one slot per open-role department', () => {
    const { nodes } = buildRotationGraph(base)
    const launch = DEPARTMENTS.filter((d) => d.openRoles > 0).length
    expect(nodes).toHaveLength(1 + 9 + launch)
  })

  it('conserves trainee flow between consecutive phases', () => {
    const { edges } = buildRotationGraph(base)
    const sum = (prefix: string) =>
      edges
        .filter((e) => e.source.startsWith(prefix))
        .reduce((a, e) => a + (e.data?.count ?? 0), 0)
    expect(sum('bootcamp')).toBe(ACTIVE_TRAINEES.length)
    expect(sum('r1:')).toBe(ACTIVE_TRAINEES.length)
    expect(sum('r2:')).toBe(ACTIVE_TRAINEES.length)
    expect(sum('r3:')).toBe(0)
  })

  it('adds dashed planned edges only for placed trainees', () => {
    const { edges } = buildRotationGraph({
      ...base,
      placements: { t01: 'trading' },
    })
    const planned = edges.filter((e) => e.data?.planned)
    expect(planned).toHaveLength(1)
    expect(planned[0]).toMatchObject({
      source: 'r3:data',
      target: 'launch:trading',
    })
  })

  it('highlights the focused trainee path and dims the rest', () => {
    const { nodes, edges } = buildRotationGraph({ ...base, focusIds: ['t01'] })
    const highlighted = nodes.filter((n) => n.data.highlighted).map((n) => n.id)
    expect(highlighted).toEqual([
      'bootcamp',
      'r1:grid',
      'r2:trading',
      'r3:data',
    ])
    expect(edges.filter((e) => e.data?.highlighted)).toHaveLength(3)
    expect(nodes.find((n) => n.id === 'r1:renew')?.data.dimmed).toBe(true)
  })

  it('marks placement slots with assignability', () => {
    const { nodes } = buildRotationGraph({
      ...base,
      assignability: { data: 'ok', strategy: 'blocked' },
    })
    expect(nodes.find((n) => n.id === 'launch:data')?.data.assignable).toBe(
      'ok'
    )
    expect(nodes.find((n) => n.id === 'launch:strategy')?.data.assignable).toBe(
      'blocked'
    )
  })
})
