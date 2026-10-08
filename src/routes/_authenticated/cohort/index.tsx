import { createFileRoute } from '@tanstack/react-router'
import { CohortPage } from '@/features/enpower/pages/cohort-page'

export const Route = createFileRoute('/_authenticated/cohort/')({
  component: CohortPage,
})
