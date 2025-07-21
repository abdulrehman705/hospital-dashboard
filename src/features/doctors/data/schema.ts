import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('invited'),
  z.literal('suspended'),
])

export type UserStatus = z.infer<typeof userStatusSchema>

const doctorDepartmentSchema = z.union([
  z.literal('PC'),
  z.literal('REVIEW'),
  z.literal('OPD'),
  z.literal('ED'),
])

const doctorSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  department: doctorDepartmentSchema,
  status: userStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  hospitalId: z.string(),
})
export type Doctor = z.infer<typeof doctorSchema>

export const doctorListSchema = z.array(doctorSchema)
