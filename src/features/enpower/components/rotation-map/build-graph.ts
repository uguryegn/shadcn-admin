import { type Edge, type Node } from '@xyflow/react'
import { type Trainee } from '../../data/people'
import {
  DEPARTMENTS,
  PHASES,
  type DepartmentId,
  type PhaseId,
} from '../../data/program'

export type SlotStatus = 'done' | 'active' | 'upcoming'

export type Member = { id: string; initials: string; name: string }

export type SlotNodeData = {
  kind: 'bootcamp' | 'rotation' | 'placement'
  phaseId: PhaseId
  phaseLabel: string
  title: string
  subtitle?: string
  members: Member[]
  capacity?: number
  status: SlotStatus
  highlighted: boolean
  dimmed: boolean
  /** Planlayıcı modunda seçili MT buraya atanabilir mi? */
  assignable?: 'ok' | 'warn' | 'blocked'
}

export type FlowEdgeData = {
  count: number
  highlighted: boolean
  dimmed: boolean
  planned: boolean
  status: SlotStatus
}

export type SlotNode = Node<SlotNodeData, 'slot'>
export type FlowEdge = Edge<FlowEdgeData, 'flow'>

export const COLUMN_GAP = 290
export const ROW_GAP = 150
/** Launchpad kolonu 8 rol taşır; daha sık dizilir. */
export const LAUNCH_ROW_GAP = 96

type BuildInput = {
  trainees: Pick<Trainee, 'id' | 'name' | 'initials' | 'rotations'>[]
  placements: Record<string, DepartmentId | undefined>
  currentPhase: PhaseId
  /** Vurgulanacak MT'ler (boşsa hepsi normal). */
  focusIds?: string[]
  assignability?: Partial<Record<DepartmentId, 'ok' | 'warn' | 'blocked'>>
}

const ROTATION_PHASES = ['r1', 'r2', 'r3'] as const

export function slotId(phase: PhaseId, dept?: DepartmentId) {
  return dept ? `${phase}:${dept}` : phase
}

function statusOf(phase: PhaseId, current: PhaseId): SlotStatus {
  const order = PHASES.map((p) => p.id)
  const a = order.indexOf(phase)
  const b = order.indexOf(current)
  return a < b ? 'done' : a === b ? 'active' : 'upcoming'
}

/**
 * Rotasyon haritasını sütunlara (faz) ve satırlara (birim) yerleşen
 * düğümler + MT akışlarını taşıyan kenarlar olarak üretir.
 */
export function buildRotationGraph({
  trainees,
  placements,
  currentPhase,
  focusIds = [],
  assignability,
}: BuildInput): { nodes: SlotNode[]; edges: FlowEdge[] } {
  const focus = new Set(focusIds)
  const hasFocus = focus.size > 0
  const toMember = (t: BuildInput['trainees'][number]): Member => ({
    id: t.id,
    initials: t.initials,
    name: t.name,
  })

  const columns: SlotNode[][] = []

  // Kolon 0 — Bootcamp
  const bootcamp = PHASES[0]
  columns.push([
    makeNode({
      id: slotId('bootcamp'),
      kind: 'bootcamp',
      phaseId: 'bootcamp',
      phaseLabel: bootcamp.short,
      title: 'Kampüs haftası',
      subtitle: 'Tüm kohort',
      members: trainees.map(toMember),
      status: statusOf('bootcamp', currentPhase),
    }),
  ])

  // Kolon 1–3 — Rotasyonlar
  for (const phaseId of ROTATION_PHASES) {
    const phase = PHASES.find((p) => p.id === phaseId)!
    const depts = DEPARTMENTS.filter((d) => d.track === phase.track)
    columns.push(
      depts.map((d) =>
        makeNode({
          id: slotId(phaseId, d.id),
          kind: 'rotation',
          phaseId,
          phaseLabel: phase.short,
          title: d.name,
          subtitle: d.hostManager,
          members: trainees
            .filter((t) => t.rotations[phaseId] === d.id)
            .map(toMember),
          capacity: d.rotationCapacity,
          status: statusOf(phaseId, currentPhase),
        })
      )
    )
  }

  // Kolon 4 — Launchpad (açık kalıcı roller)
  const launch = PHASES[PHASES.length - 1]
  columns.push(
    DEPARTMENTS.filter((d) => d.openRoles > 0).map((d) =>
      makeNode({
        id: slotId('launch', d.id),
        kind: 'placement',
        phaseId: 'launch',
        phaseLabel: launch.short,
        title: d.name,
        subtitle: `${d.openRoles} açık rol`,
        members: trainees
          .filter((t) => placements[t.id] === d.id)
          .map(toMember),
        capacity: d.openRoles,
        status: statusOf('launch', currentPhase),
        assignable: assignability?.[d.id],
      })
    )
  )

  // Konumlandırma: her kolon dikeyde ortalanır.
  columns.forEach((col, c) => {
    col.forEach((node, r) => {
      node.position = {
        x: c * COLUMN_GAP,
        y:
          (r - (col.length - 1) / 2) *
          (node.data.kind === 'placement' ? LAUNCH_ROW_GAP : ROW_GAP),
      }
    })
  })

  // Kenarlar: ardışık iki slot arasında MT akışı
  const edgeMap = new Map<string, FlowEdge & { data: FlowEdgeData }>()
  const addFlow = (
    source: string,
    target: string,
    traineeId: string,
    phase: PhaseId,
    planned = false
  ) => {
    const id = `${source}->${target}`
    const existing = edgeMap.get(id)
    const isFocus = focus.has(traineeId)
    if (existing) {
      existing.data.count += 1
      existing.data.highlighted ||= isFocus
      existing.data.dimmed = hasFocus && !existing.data.highlighted
      return
    }
    edgeMap.set(id, {
      id,
      source,
      target,
      type: 'flow',
      data: {
        count: 1,
        highlighted: isFocus,
        dimmed: hasFocus && !isFocus,
        planned,
        status: statusOf(phase, currentPhase),
      },
    })
  }

  for (const t of trainees) {
    const { r1, r2, r3 } = t.rotations
    addFlow(slotId('bootcamp'), slotId('r1', r1), t.id, 'r1')
    if (r2) addFlow(slotId('r1', r1), slotId('r2', r2), t.id, 'r2')
    if (r2 && r3) addFlow(slotId('r2', r2), slotId('r3', r3), t.id, 'r3')
    const placement = placements[t.id]
    if (r3 && placement)
      addFlow(
        slotId('r3', r3),
        slotId('launch', placement),
        t.id,
        'launch',
        true
      )
  }

  const nodes = columns.flat().map((n) => {
    const highlighted = n.data.members.some((m) => focus.has(m.id))
    return {
      ...n,
      data: { ...n.data, highlighted, dimmed: hasFocus && !highlighted },
    }
  })

  return { nodes, edges: [...edgeMap.values()] }
}

function makeNode(
  data: Omit<SlotNodeData, 'highlighted' | 'dimmed'> & { id: string }
): SlotNode {
  const { id, ...rest } = data
  return {
    id,
    type: 'slot',
    position: { x: 0, y: 0 },
    data: { ...rest, highlighted: false, dimmed: false },
    draggable: false,
    connectable: false,
  }
}
