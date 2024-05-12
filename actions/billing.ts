'use server'
import { getAuthSession } from '@/lib/nextauth'
import { prisma } from '@/lib/prisma'


interface billingParticipantType {
  userId: string
  amount: number
}

export async function createBillingNormal(eventId:string , totalAmount: number, data:billingParticipantType[]) {
  return await prisma.billing.create({
    data: {
      eventId: eventId,
      totalAmount: totalAmount,
      billingParticipants: {
        createMany: {
          data: data.map(item => ({
            userId: item.userId,
            totalAmount: item.amount
            }))
        }
      }
    }
  })
}

export async function getBillingPayer(userId: string) {

  return await prisma.billing.findMany({
    where: {
      event: {
        NOT: {
          organizerId: userId,
        },
      },
      billingParticipants: {
        some: {
          userId: userId,
        },
      },
    },
    include: {
      billingParticipants: {
        where: {
          userId: userId,
        },
      },
      event: {
        select: {
          id: true,
          name: true,
          location: true,
          date: true,
        },
      },
    },
    }
  )
}

export async function getBillingOwner(userId: string) {

  return await prisma.billing.findMany({
      where: {
        event: {
            organizerId: userId,
        },
        billingParticipants: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        billingParticipants: true,
        event: {
          select: {
            id: true,
            name: true,
            location: true,
            date: true,
          },
        },
      }
    }
  )
}
