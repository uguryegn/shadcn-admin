import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { PageShell } from '../components/page-shell'
import { getCoach } from '../data/people'
import { COHORT, DEMO_TODAY } from '../data/program'
import { useProgramStore } from '../store/program-store'
import { CoachHome } from '../views/coach-home'
import { HrHome } from '../views/hr-home'
import { MtHome } from '../views/mt-home'

const today = format(DEMO_TODAY, 'd MMMM yyyy, EEEE', { locale: tr })

export function HomePage() {
  const role = useProgramStore((s) => s.role)
  const coachId = useProgramStore((s) => s.coachId)

  if (role === 'coach')
    return (
      <PageShell
        eyebrow={today}
        title='Koçluk Masası'
        description={`${getCoach(coachId)?.name} için koçluk ilişkilerinin nabzı: kime, ne zaman, hangi soruyla dokunmalı.`}
      >
        <CoachHome />
      </PageShell>
    )

  if (role === 'hr')
    return (
      <PageShell
        eyebrow={`${today} · ${COHORT.name}`}
        title='Program Kokpiti'
        description='Önce ana mesaj, sonra gerekçe ve öneri. Tüm veriler kurgusaldır.'
      >
        <HrHome />
      </PageShell>
    )

  return (
    <PageShell eyebrow={today} title='Bugün'>
      <MtHome />
    </PageShell>
  )
}
