import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { TRAINEES, type Reflection } from '../data/people'
import { DEMO_TODAY, type DepartmentId } from '../data/program'

export type Role = 'mt' | 'coach' | 'hr'

export type SessionNote = {
  id: string
  date: string
  note: string
  commitment: string
}

type ProgramState = {
  role: Role
  mtId: string
  coachId: string
  /** Bu haftaki nabız check-in'i (MT başına). */
  pulseCheckins: Record<string, number>
  /** Mevcut rotasyonda tamamlanan çıktıların index'leri. */
  deliverables: Record<string, number[]>
  placements: Record<string, DepartmentId | undefined>
  reflections: Record<string, Reflection[]>
  sessions: Record<string, SessionNote[]>
}

type ProgramActions = {
  setRole: (role: Role) => void
  setMtId: (id: string) => void
  setCoachId: (id: string) => void
  checkIn: (traineeId: string, value: number) => void
  toggleDeliverable: (traineeId: string, index: number) => void
  setPlacement: (traineeId: string, dept: DepartmentId | undefined) => void
  addReflection: (traineeId: string, text: string) => void
  logSession: (traineeId: string, note: string, commitment: string) => void
  resetDemo: () => void
}

const todayIso = DEMO_TODAY.toISOString().slice(0, 10)

export function initialProgramState(): ProgramState {
  return {
    role: 'mt',
    mtId: 't01',
    coachId: 'c1',
    pulseCheckins: {},
    deliverables: Object.fromEntries(
      TRAINEES.map((t) => [
        t.id,
        Array.from({ length: t.deliverablesDone }, (_, i) => i),
      ])
    ),
    placements: Object.fromEntries(
      TRAINEES.filter((t) => t.plannedPlacement).map((t) => [
        t.id,
        t.plannedPlacement,
      ])
    ),
    reflections: {},
    sessions: {},
  }
}

let seq = 0
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${seq++}`

export const useProgramStore = create<ProgramState & ProgramActions>()(
  persist(
    (set) => ({
      ...initialProgramState(),
      setRole: (role) => set({ role }),
      setMtId: (mtId) => set({ mtId }),
      setCoachId: (coachId) => set({ coachId }),
      checkIn: (traineeId, value) =>
        set((s) => ({
          pulseCheckins: { ...s.pulseCheckins, [traineeId]: value },
        })),
      toggleDeliverable: (traineeId, index) =>
        set((s) => {
          const current = s.deliverables[traineeId] ?? []
          const next = current.includes(index)
            ? current.filter((i) => i !== index)
            : [...current, index]
          return { deliverables: { ...s.deliverables, [traineeId]: next } }
        }),
      setPlacement: (traineeId, dept) =>
        set((s) => ({ placements: { ...s.placements, [traineeId]: dept } })),
      addReflection: (traineeId, text) =>
        set((s) => ({
          reflections: {
            ...s.reflections,
            [traineeId]: [
              { id: uid('r'), date: todayIso, text },
              ...(s.reflections[traineeId] ?? []),
            ],
          },
        })),
      logSession: (traineeId, note, commitment) =>
        set((s) => ({
          sessions: {
            ...s.sessions,
            [traineeId]: [
              { id: uid('s'), date: todayIso, note, commitment },
              ...(s.sessions[traineeId] ?? []),
            ],
          },
        })),
      resetDemo: () => set((s) => ({ ...initialProgramState(), role: s.role })),
    }),
    {
      name: 'enpower-mt-demo',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
)
