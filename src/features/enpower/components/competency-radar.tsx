import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'
import { type CompetencyScores } from '../data/people'
import { COMPETENCIES, COMPETENCY_TARGET } from '../data/program'

export function CompetencyRadar({
  m6,
  m12,
}: {
  m6: CompetencyScores
  m12: CompetencyScores
}) {
  const data = COMPETENCIES.map((c) => ({
    name: c.short,
    m6: m6[c.id],
    m12: m12[c.id],
    target: COMPETENCY_TARGET,
  }))
  return (
    <div>
      <div className='h-64 w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <RadarChart data={data} outerRadius='72%'>
            <PolarGrid stroke='var(--border)' />
            <PolarAngleAxis
              dataKey='name'
              tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            />
            <PolarRadiusAxis domain={[1, 5]} tick={false} axisLine={false} />
            <Radar
              name='Hedef (18. ay)'
              dataKey='target'
              stroke='var(--spark)'
              strokeDasharray='4 4'
              fill='none'
              isAnimationActive={false}
            />
            <Radar
              name='6. ay'
              dataKey='m6'
              stroke='var(--muted-foreground)'
              fill='var(--muted-foreground)'
              fillOpacity={0.08}
              isAnimationActive={false}
            />
            <Radar
              name='12. ay'
              dataKey='m12'
              stroke='var(--primary)'
              fill='var(--primary)'
              fillOpacity={0.22}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <ul className='mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground'>
        <li className='flex items-center gap-1.5'>
          <span className='h-0.5 w-4 rounded bg-primary' /> 12. ay
        </li>
        <li className='flex items-center gap-1.5'>
          <span className='h-0.5 w-4 rounded bg-muted-foreground' /> 6. ay
        </li>
        <li className='flex items-center gap-1.5'>
          <span className='h-0.5 w-4 rounded border-t-2 border-dashed border-spark' />{' '}
          Hedef {COMPETENCY_TARGET}
        </li>
      </ul>
    </div>
  )
}
