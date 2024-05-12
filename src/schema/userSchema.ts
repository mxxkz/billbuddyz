import { z } from 'zod'
export const participantsSchema = z.object({
  participants: z.array(z.object({
    user: z.object({
      id: z.string(),
      name: z.string(),
      image: z.string().nullable()
    })
  })).refine((value) => value.some((item) => item), {
    message: "You have to select at least one item.",
  }),
})

export type participantsSchemaType = z.infer<typeof participantsSchema>
