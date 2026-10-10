import { createFileRoute } from '@tanstack/react-router'
import { RotationMapPage } from '@/features/enpower/pages/rotation-map-page'

export const Route = createFileRoute('/_authenticated/rotation-map/')({
  component: RotationMapPage,
})
