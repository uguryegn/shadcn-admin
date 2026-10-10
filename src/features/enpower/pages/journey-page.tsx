import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { PersonAvatar, ReadinessMeter, SectionCard } from '../components/atoms'
import { CompetencyRadar } from '../components/competency-radar'
import { JourneyTimeline } from '../components/journey-timeline'
import { PageShell } from '../components/page-shell'
import { TraineePicker } from '../components/trainee-picker'
import { getCoach } from '../data/people'
import { useCohortViews } from '../hooks/use-program'
import { useProgramStore } from '../store/program-store'

const route = getRouteApi('/_authenticated/journey/')

export function JourneyPage() {
  const { mt } = route.useSearch()
  const role = useProgramStore((s) => s.role)
  const mtId = useProgramStore((s) => s.mtId)
  const coachId = useProgramStore((s) => s.coachId)
  const navigate = useNavigate()
  const cohort = useCohortViews()

  const visible =
    role === 'coach' ? cohort.filter((t) => t.coachId === coachId) : cohort
  const selectedId = role === 'mt' ? mtId : (mt ?? visible[0]?.id)
  const trainee = cohort.find((t) => t.id === selectedId) ?? visible[0]
  if (!trainee) return null

  return (
    <PageShell
      eyebrow='18 aylık gelişim yolculuğu'
      title={role === 'mt' ? 'Yolculuğum' : `${trainee.name} · Yolculuk`}
      description='Bootcamp’ten kalıcı role: her faz bir söz verir, her kilometre taşı bir kanıt üretir.'
    >
      {role !== 'mt' && (
        <TraineePicker
          className='mb-4'
          trainees={visible}
          value={trainee.id}
          onChange={(id) =>
            navigate({ to: '/journey', search: { mt: id }, replace: true })
          }
        />
      )}
      <div className='grid gap-4 lg:grid-cols-[1fr_340px]'>
        <JourneyTimeline trainee={trainee} showPlacement={role !== 'mt'} />
        <aside className='space-y-4 lg:sticky lg:top-20 lg:self-start'>
          <SectionCard title='Profil'>
            <div className='flex items-center gap-3'>
              <PersonAvatar
                name={trainee.name}
                initials={trainee.initials}
                className='size-11 text-sm'
              />
              <div>
                <p className='font-semibold'>{trainee.name}</p>
                <p className='text-xs text-muted-foreground'>
                  {trainee.background} · {trainee.homeCity}
                </p>
              </div>
            </div>
            <dl className='mt-4 grid grid-cols-2 gap-3 text-xs'>
              <div>
                <dt className='text-muted-foreground'>Talent Coach</dt>
                <dd className='font-medium'>
                  {getCoach(trainee.coachId)?.name}
                </dd>
              </div>
              <div>
                <dt className='text-muted-foreground'>Buddy</dt>
                <dd className='font-medium'>{trainee.buddy}</dd>
              </div>
            </dl>
            <div className='mt-4'>
              <p className='mb-1 text-xs text-muted-foreground'>
                Hazırlık endeksi
              </p>
              <ReadinessMeter value={trainee.readiness} />
            </div>
          </SectionCard>
          <SectionCard title='Yetkinlik gelişimi'>
            <CompetencyRadar
              m6={trainee.competencies.m6}
              m12={trainee.competencies.m12}
            />
          </SectionCard>
        </aside>
      </div>
    </PageShell>
  )
}
