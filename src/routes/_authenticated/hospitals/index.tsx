import { createFileRoute } from '@tanstack/react-router'
import Hospitals from '@/features/hospitals'

export const Route = createFileRoute('/_authenticated/hospitals/')({
  component: Hospitals,
})
