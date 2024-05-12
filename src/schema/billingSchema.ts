import { z } from 'zod'

export const createBillingNormalSchema = z.object({
    totalAmount: z.coerce.number(),
    amount: z.array(z.object({
      amount: z.coerce.number()
    }))
})

export const createBillingListSchema = z.object({
  totalAmount: z.coerce.number(),
  vat: z.coerce.number(),
  serviceCharge: z.coerce.number(),
  discount: z.coerce.number(),
  itemList: z.array(z.object({
    name: z.string(),
    price: z.coerce.number(),
    participantList: z.array(z.object({
        id: z.string(),
    }))
  }))
})

export type createBillingNormalSchemaType = z.infer<typeof createBillingNormalSchema>
export type createBillingListSchemaType = z.infer<typeof createBillingListSchema>
