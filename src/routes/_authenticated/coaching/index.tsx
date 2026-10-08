import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { CoachingPage } from '@/features/enpower/pages/coaching-page'

export const Route = createFileRoute('/_authenticated/coaching/')({
  validateSearch: z.object({ mt: z.string().optional().catch(undefined) }),
  component: CoachingPage,
})
