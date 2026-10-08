import { useMemo } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  type NodeMouseHandler,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useTheme } from '@/context/theme-provider'
import { type Trainee } from '../../data/people'
import { type DepartmentId, type PhaseId } from '../../data/program'
import { buildRotationGraph, type SlotNode } from './build-graph'
import { FlowEdgeView } from './flow-edge'
import { SlotNodeView } from './slot-node'

const nodeTypes = { slot: SlotNodeView }
const edgeTypes = { flow: FlowEdgeView }

type RotationMapProps = {
  trainees: Pick<Trainee, 'id' | 'name' | 'initials' | 'rotations'>[]
  placements: Record<string, DepartmentId | undefined>
  currentPhase: PhaseId
  focusIds: string[]
  assignability?: Partial<Record<DepartmentId, 'ok' | 'warn' | 'blocked'>>
  onAssign?: (dept: DepartmentId) => void
  /** Verilirse kamera yalnızca bu düğümlere odaklanır (mobilde okunabilirlik). */
  fitToFocus?: boolean
}

export default function RotationMap({
  trainees,
  placements,
  currentPhase,
  focusIds,
  assignability,
  onAssign,
  fitToFocus,
}: RotationMapProps) {
  const { resolvedTheme } = useTheme()
  const { nodes, edges } = useMemo(
    () =>
      buildRotationGraph({
        trainees,
        placements,
        currentPhase,
        focusIds,
        assignability,
      }),
    [trainees, placements, currentPhase, focusIds, assignability]
  )

  const onNodeClick: NodeMouseHandler<SlotNode> = (_, node) => {
    if (node.data.kind !== 'placement' || !onAssign) return
    if (!node.data.assignable || node.data.assignable === 'blocked') return
    onAssign(node.id.split(':')[1] as DepartmentId)
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeClick={onNodeClick}
      colorMode={resolvedTheme}
      fitView
      fitViewOptions={{
        padding: 0.12,
        nodes:
          fitToFocus && focusIds.length
            ? nodes.filter((n) => n.data.highlighted).map((n) => ({ id: n.id }))
            : undefined,
      }}
      minZoom={0.3}
      maxZoom={1.6}
      nodesDraggable={false}
      nodesConnectable={false}
      edgesFocusable={false}
      zoomOnScroll={false}
      preventScrolling={false}
      panOnScroll={false}
      zoomOnDoubleClick={false}
      aria-label='Rotasyon haritası'
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={22}
        size={1.2}
        color='var(--border)'
      />
      <Controls showInteractive={false} position='bottom-right' />
    </ReactFlow>
  )
}
