'use server'
import { prisma } from '@/lib/prisma'
import { createBillingListSchemaType } from '@/schema/billingSchema'

interface billingParticipantType {
  userId: string
  amount: number
}

export async function createBillingNormal(eventId:string , totalAmount: number, data:billingParticipantType[]) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { organizerId: true },
  })
  const organizerId = event?.organizerId

  return await prisma.billing.create({
    data: {
      eventId: eventId,
      totalAmount: totalAmount,
      billingParticipants: {
        createMany: {
          data: data.map(item => ({
            userId: item.userId,
            totalAmount: item.amount,
            paymentStatus: item.userId === organizerId ? 'paid' : 'unpaid'
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
          paymentStatus: {
            not: 'paid',
          },
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
        billingStatus: true,
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

export async function getBillingPayerById(billingId: string, userId:string) {

  const itemData = await prisma.itemParticipants.findMany({
    where: {
      userId: userId,
      item: {
        billingId: billingId
      }
    },
    select: {
      item: {
        select: {
          billingId: true,
          name: true,
          price: true
        }
      },
      price: true,
    },
  })
  const totalAmount = await prisma.billingParticipants.findFirst({
    where: {
      billingId: billingId,
      userId: userId
    },
    select: {
      totalAmount: true,
      serviceCharge: true,
      vat: true,
      discount: true,
      billingId: true,
      paymentStatus: true
    }
  });

  return { itemData, totalAmount }
}

export async function getEventDataByEventId(eventId: string) {
  return await prisma.event.findFirst({
    where: {
      id: eventId
    },
    select: {
      name: true,
      date: true,
      location: true,
      organizer: {
        select: {
          qrcode: true
        }
      }
    }
  });
}

export async function getBillingOwnerById(billingId: string){

  return await prisma.billing.findFirst({
    where: {
      id: billingId
    },
    include: {
      event: {
        select: {
          name: true,
          date: true,
          location: true,
          organizer: {
            select: {
              qrcode: true
            }
          }
        }
      },
      items: true,
      billingParticipants: {
        select: {
          billingId:true,
          paymentStatus:true,
          paymentSlip: true,
          totalAmount: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          }
        }
      }
    },
  })
}

export async function updateSlipToVerify(billingId: string | any, userId: string | any, paymentSlip: string | null) {

  return await prisma.billingParticipants.update({
    where: {
      billingId_userId: {
        billingId: billingId,
        userId: userId,
      },
    },
    data: {
      paymentStatus: 'verifying',
      paymentSlip: paymentSlip
    }
  })
}

export async function updateSlipToPaid(billingId: string | any, userId: string | any){
  return await prisma.billingParticipants.update({
    where: {
      billingId_userId: {
        billingId: billingId,
        userId: userId,
      },
    },
    data: {
      paymentStatus: 'paid',
    }
  })
}

export async function createBillingList(eventId: string,data: createBillingListSchemaType) {
  type Participant = {
    id: string
  }

  type Item = {
    name: string
    price: number
    participantList: Participant[]
  }

  type BillingData = {
    totalAmount: number
    vat: number
    serviceCharge: number
    discount: number
    itemList: Item[]
  }

  type ParticipantExpense = {
    participantId: string
    totalExpense: number
    vat: number
    serviceCharge: number
    discount: number
  }

  function calculateParticipantExpenses(billingData: BillingData): ParticipantExpense[] {
    const { totalAmount, vat, serviceCharge, discount, itemList } = billingData
    const discountPercentage =  (discount / (totalAmount+discount)) * 100

    const participantTotals: Record<string, number> = {}
    let totalBillAmount: number = 0
    itemList.forEach(item => {
      totalBillAmount += item.price
    })
    totalBillAmount += vat
    totalBillAmount += serviceCharge
    totalBillAmount -= discount
    const isIncludeVat = Math.abs(totalBillAmount - totalAmount) <= 1
    console.log(isIncludeVat)

    itemList.forEach(item => {
      const pricePerParticipant = item.price / item.participantList.length
      item.participantList.forEach(participant => {
        if (!participantTotals[participant.id]) {
          participantTotals[participant.id] = 0
        }
        participantTotals[participant.id] += pricePerParticipant
      });
    });
    console.log('totalPAR',participantTotals)

    // Subtract discount and add VAT and service charge if applicable
    const participantExpenses: ParticipantExpense[] = Object.keys(participantTotals).map(participantId => {
      let totalExpense = participantTotals[participantId]
      let participantVat = 0
      let participantServiceCharge = 0
      let participantDiscount = 0


      // Apply discount
      totalExpense -= totalExpense * (discountPercentage / 100)
      participantDiscount += totalExpense * (discountPercentage / 100)

      // Apply VAT and service charge if applicable
      if (!isIncludeVat) {
        totalExpense += totalExpense * 0.07
        participantVat += totalExpense * 0.07
      }
      if (serviceCharge !== 0) {
        totalExpense += totalExpense * 0.1
        participantServiceCharge += totalExpense * 0.1
      }


      return {
        participantId,
        totalExpense: parseFloat(totalExpense.toFixed(2)), // Round to 2 decimal places
        vat: parseFloat(participantVat.toFixed(2)),
        serviceCharge: parseFloat(participantServiceCharge.toFixed(2)),
        discount: parseFloat(participantDiscount.toFixed(2))
      }
    })

    return participantExpenses
  }

  const participantExpenses = await calculateParticipantExpenses(data)
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { organizerId: true, eventParticipants: true },
  })
  const organizerId = event?.organizerId
  const preparedItems = data.itemList.map(item => {
    const participants = item.participantList.map(participant => ({
      userId: participant.id,
      price: item.price/item.participantList.length,
    }))
    return {
      name: item.name,
      price: item.price,
      itemParticipants: {
        create: participants,
      },
    }
  })

// Then, use the prepared data in the Prisma query
  await prisma.billing.create({
    data: {
      eventId,
      totalAmount: data.totalAmount,
      vat: data.vat,
      serviceCharge: data.serviceCharge,
      discount: data.discount,
      billingParticipants: {
              create: participantExpenses.map(expense => ({
                userId: expense.participantId,
                totalAmount: expense.totalExpense,
                vat: expense.vat,
                serviceCharge: expense.serviceCharge,
                discount: expense.discount,
                paymentStatus: expense.participantId === organizerId ? 'paid' : 'unpaid'
              })),
      },
      items: {
        create: preparedItems,
      },
    },
  })
}

export async function getExpenseById(userId: string){
  return await prisma.billingParticipants.findMany({
    where: {
      userId: userId,
    },
    include: {
      billing: {
        include: {
          event: {
            select: {
              date: true,
            },
          },
        },
      },
    },
  })
}

export async function updateBillingStatus(eventId: string) {

  return await prisma.billing.update({
    where: {
      eventId: eventId
    },
    data: {
      billingStatus: false
    }
  })
}
