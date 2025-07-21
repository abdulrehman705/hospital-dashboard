import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('invited'),
  z.literal('suspended'),
]).optional()

export type UserStatus = z.infer<typeof userStatusSchema>

const doctorDepartmentSchema = z.union([
  z.literal('PC'),
  z.literal('REVIEW'),
  z.literal('OPD'),
  z.literal('ED'),
]).optional()

const doctorSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  sur_name: z.string(),
  email: z.string(),
  phone_number: z.string().nullable().optional(),
  department: doctorDepartmentSchema,
  status: userStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  hospital_id: z.string().nullable().optional(),
  registration_number: z.string().nullable().optional(),
})
export type Doctor = z.infer<typeof doctorSchema>

export const doctorListSchema = z.array(doctorSchema)
