import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { JourneyPage } from '@/features/enpower/pages/journey-page'

export const Route = createFileRoute('/_authenticated/journey/')({
  validateSearch: z.object({ mt: z.string().optional().catch(undefined) }),
  component: JourneyPage,
})
