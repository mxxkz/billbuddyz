'use server'

import { prisma } from '@/lib/prisma'

export async function getQrCode(id:string) {

  return await prisma.user.findFirst({
    where: {
      id: id
    },
    select: {
      qrcode: true,
    }
  })
}

export async function updateQrCode(id: string, qrCode: string) {

  return await prisma.user.update({
    where: {
      id: id
    },
    data: {
      qrcode: qrCode
    }
  })
}

export async function getParticipanFromEventId(id: string) {
  return await prisma.eventParticipants.findMany({
    where: {
      eventId: id
    },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      }
    }
  })
}

