'use server'
import { getAuthSession } from '@/lib/nextauth'
import { prisma } from '@/lib/prisma'
import { createEventSchemaType, editEventSchemaType } from '@/schema/eventSchema'

export async function createEvent(form:createEventSchemaType) {
  const session = await getAuthSession()

  if(!session){
    throw new Error('user not found')
  }
  return await prisma.event.create({
    data: {
      name: form.eventName,
      location: form.location,
      date: form.date,
      description: form.description,
      joinId: form.joinId,
      organizerId: form.organizerId,
      eventParticipants: {
        create: {
          userId: form.organizerId
        }
      }
    }
  })
}

export async function getExistingJoinId(joinId: string) {
  return await prisma.event.findFirst({
    select: {
      joinId: true
    },
    where: {
      joinId: joinId,
    },
  })}

export async function getAllEvent() {
  const session = await getAuthSession()
  if(!session){
    throw new Error('user not found')
  }
  return await prisma.user.findUnique({
    where: {
      id: session?.user.id
    },
    select: {
      id: true,
      name: true,
      image: true,
      eventParticipants: {
        select: {
          event: {
            select: {
              id: true,
              name: true,
              date: true,
              location: true,
              description: true,
              joinId: true,
              organizer: {
                select: {
                  name:true,
                  id:true,
                  image: true,
                }
              },
              eventParticipants: {
                select: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      image: true,
                    }
                  }
                },
              },
              billing: true
            },
          },
        },
      },
    },
  })
}

export async function getEventById(id:string){
  const session = await getAuthSession()
  if(!session){
    throw new Error('user not found')
  }
  return await prisma.event.findFirst({
    where: {
      id: id
    },
    select: {
      id: true,
      name: true,
      description: true,
      location: true,
      date: true,
      organizer: {
        select: {
          id: true,
          name: true
        }
      },
      eventParticipants: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          }
        },
      },
    }
  })
}

export async function deleteParticipants(eventId:string, participantIds: string[]) {
  return prisma.eventParticipants.deleteMany({
    where: {
      eventId: eventId,
      userId: {
        in: participantIds,
      },
    },
  });
}

export async function editEvent(form: editEventSchemaType) {
  const session = await getAuthSession()
  if(!session){
    throw new Error('user not found')
  }
  return await prisma.event.update({
    where: { id: form.id },
    data: {
      name: form.eventName,
      description: form.description,
      date: form.date,
      location: form.location,
      organizerId: form.organizerId,
    }
  })
}

export async function getEventByJoinId(joinId: string) {
  return await prisma.event.findFirst({
    where: {
      joinId: joinId
    },
    select: {
      id: true,
      name: true,
      description: true,
      location: true,
      date: true,
      joinId: true,
      organizer: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      },
      eventParticipants: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          }
        },
      },
    }
  })
}

export async function addParticipant(userId: string, eventId: string) {
  return await prisma.eventParticipants.create({
    data: {
      userId: userId,
      eventId: eventId,
    }
  })
}

export async function deleteEvent(eventId: string) {
  return await prisma.event.delete({
    where: {
      id: eventId
    }
  })
}
