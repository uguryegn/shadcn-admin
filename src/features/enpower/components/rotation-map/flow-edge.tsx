import { memo } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react'
import { cn } from '@/lib/utils'
import { type FlowEdge } from './build-graph'

function FlowEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<FlowEdge>) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })
  const count = data?.count ?? 1
  const highlighted = data?.highlighted
  const dimmed = data?.dimmed
  const planned = data?.planned
  const upcoming = data?.status === 'upcoming'

  const stroke = highlighted
    ? 'var(--primary)'
    : planned
      ? 'var(--spark)'
      : 'var(--muted-foreground)'

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        className={cn(highlighted && 'enp-flow-animated')}
        style={{
          stroke,
          strokeWidth: 1.25 + count * (highlighted ? 1.2 : 0.9),
          strokeOpacity: dimmed ? 0.12 : highlighted ? 0.95 : 0.4,
          strokeDasharray: planned || upcoming ? '6 6' : undefined,
          strokeLinecap: 'round',
        }}
      />
      {!dimmed && count > 1 && (
        <EdgeLabelRenderer>
          <div
            className={cn(
              'nodrag nopan pointer-events-none absolute rounded-full border bg-background px-1.5 text-[10px] font-semibold tabular-nums shadow-xs',
              highlighted && 'border-primary text-primary'
            )}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            {count}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

export const FlowEdgeView = memo(FlowEdgeComponent)
