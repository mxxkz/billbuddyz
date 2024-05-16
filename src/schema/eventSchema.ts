import {z} from 'zod'

export const createEventSchema =  z.object({
  eventName: z.string().min(3,
    {message: 'ชื่อกิจกรรมต้องมีตัวอักษรอย่างน้อย 3 ตัว'}),
  description: z.string().optional(),
  date: z.any(),
  location: z.string().optional(),
  joinId: z.string().nullable(),
  organizerId: z.string()
})

export const editEventSchema = z.object({
  id: z.string(),
  eventName: z.string().min(3,
    {message: 'ชื่อกิจกรรมต้องมีตัวอักษรอย่างน้อย 3 ตัว'}),
  description: z.string().optional(),
  date: z.any(),
  location: z.string().optional(),
  organizerId: z.string()
})

export const joinEventSchema = z.object({
  joinId: z.string().min(6, {
    message: 'โปรดกรอกรหัสให้ครบ 6 หลัก',
  }),
})

export type createEventSchemaType = z.infer<typeof createEventSchema>
export type editEventSchemaType = z.infer<typeof editEventSchema>
export type joinEventSchemaType = z.infer<typeof joinEventSchema>
