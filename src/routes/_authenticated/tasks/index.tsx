import { createFileRoute } from '@tanstack/react-router'
import Tasks from '@/features/hospitals'

export const Route = createFileRoute('/_authenticated/tasks/')({
  component: Tasks,
})
