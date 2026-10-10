import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from '@/features/enpower/pages/home'

export const Route = createFileRoute('/_authenticated/')({
  component: HomePage,
})
