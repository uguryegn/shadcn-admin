import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Ban, Check, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type SlotNode } from './build-graph'

const MAX_AVATARS = 5

function SlotNodeComponent({ data }: NodeProps<SlotNode>) {
  const full =
    data.capacity !== undefined && data.members.length >= data.capacity
  const dimmed = data.dimmed && !data.assignable

  return (
    <div
      className={cn(
        'w-[230px] rounded-2xl border bg-card p-3 text-card-foreground shadow-sm transition-all',
        data.status === 'active' && 'border-spark/70',
        data.kind === 'placement' && 'border-dashed py-2',
        data.highlighted && 'border-primary shadow-lg ring-2 ring-primary/30',
        dimmed && 'opacity-35',
        data.assignable === 'ok' && 'cursor-pointer ring-2 ring-success/50',
        data.assignable === 'warn' && 'cursor-pointer ring-2 ring-warning/60',
        data.assignable === 'blocked' && 'cursor-not-allowed opacity-60'
      )}
    >
      {data.kind !== 'bootcamp' && (
        <Handle
          type='target'
          position={Position.Left}
          isConnectable={false}
          className='size-2! border-0! bg-border!'
        />
      )}
      <div className='flex items-center justify-between gap-2'>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
            data.status === 'done' && 'bg-primary/10 text-primary',
            data.status === 'active' &&
              'bg-spark/25 text-spark-foreground dark:text-spark',
            data.status === 'upcoming' && 'bg-muted text-muted-foreground'
          )}
        >
          {data.phaseLabel}
        </span>
        {data.capacity !== undefined && (
          <span
            className={cn(
              'text-[11px] font-semibold tabular-nums',
              full ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {data.members.length}/{data.capacity}
          </span>
        )}
        {data.assignable && <AssignIcon state={data.assignable} />}
      </div>
      <p className='mt-1.5 truncate text-sm leading-tight font-bold'>
        {data.title}
      </p>
      {data.subtitle && data.kind !== 'placement' && (
        <p className='truncate text-[11px] text-muted-foreground'>
          {data.subtitle}
        </p>
      )}
      <div
        className={cn(
          'flex -space-x-1.5',
          data.kind === 'placement' ? 'mt-1' : 'mt-2'
        )}
      >
        {data.members.slice(0, MAX_AVATARS).map((m) => (
          <span
            key={m.id}
            title={m.name}
            className='flex size-6 items-center justify-center rounded-full border-2 border-card bg-accent text-[9px] font-bold text-accent-foreground'
          >
            {m.initials}
          </span>
        ))}
        {data.members.length > MAX_AVATARS && (
          <span className='flex size-6 items-center justify-center rounded-full border-2 border-card bg-muted text-[9px] font-bold'>
            +{data.members.length - MAX_AVATARS}
          </span>
        )}
        {data.members.length === 0 && (
          <span className='text-[11px] text-muted-foreground italic'>
            Henüz atama yok
          </span>
        )}
      </div>
      {data.kind !== 'placement' && (
        <Handle
          type='source'
          position={Position.Right}
          isConnectable={false}
          className='size-2! border-0! bg-border!'
        />
      )}
    </div>
  )
}

function AssignIcon({ state }: { state: 'ok' | 'warn' | 'blocked' }) {
  if (state === 'ok')
    return <Check aria-label='Uygun' className='size-4 text-success' />
  if (state === 'warn')
    return (
      <TriangleAlert aria-label='Uyarılı' className='size-4 text-warning' />
    )
  return <Ban aria-label='Uygun değil' className='size-4 text-destructive' />
}

export const SlotNodeView = memo(SlotNodeComponent)
