import { COACHES, HR_PERSONA, getTrainee } from '../data/people'
import { useProgramStore, type Role } from '../store/program-store'

export const ROLE_LABEL: Record<Role, string> = {
  mt: 'Management Trainee',
  coach: 'Talent Coach',
  hr: 'İK · Program Ekibi',
}

export const ROLE_SHORT: Record<Role, string> = {
  mt: 'MT',
  coach: 'Koç',
  hr: 'İK',
}

/** Aktif rolün kişisini (kurgusal) döner. */
export function usePersona() {
  const role = useProgramStore((s) => s.role)
  const mtId = useProgramStore((s) => s.mtId)
  const coachId = useProgramStore((s) => s.coachId)

  if (role === 'mt') {
    const t = getTrainee(mtId)
    return {
      role,
      name: t?.name ?? '—',
      initials: t?.initials ?? '?',
      subtitle: ROLE_LABEL.mt,
    }
  }
  if (role === 'coach') {
    const c = COACHES.find((x) => x.id === coachId) ?? COACHES[0]
    return { role, name: c.name, initials: c.initials, subtitle: c.title }
  }
  return {
    role,
    name: HR_PERSONA.name,
    initials: HR_PERSONA.initials,
    subtitle: HR_PERSONA.title,
  }
}
