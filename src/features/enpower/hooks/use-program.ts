import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { ACTIVE_TRAINEES, getTrainee } from '../data/people'
import { DEMO_TODAY } from '../data/program'
import { deriveTrainee, type DerivedState } from '../lib/derive'
import { useProgramStore } from '../store/program-store'

function useDerivedState(): DerivedState {
  return useProgramStore(
    useShallow((s) => ({
      pulseCheckins: s.pulseCheckins,
      deliverables: s.deliverables,
      placements: s.placements,
      reflections: s.reflections,
      sessions: s.sessions,
    }))
  )
}

export function useTraineeView(id: string) {
  const state = useDerivedState()
  return useMemo(() => {
    const trainee = getTrainee(id)
    return trainee ? deriveTrainee(trainee, state, DEMO_TODAY) : undefined
  }, [id, state])
}

export function useCohortViews() {
  const state = useDerivedState()
  return useMemo(
    () => ACTIVE_TRAINEES.map((t) => deriveTrainee(t, state, DEMO_TODAY)),
    [state]
  )
}
