
import { create } from 'zustand'

interface User {
  id: string
  name: string
  image: string | null
}

interface Participant {
  user: User
}

interface ParticipantsState {
  eventId: string
  setEventId: (eventId: string) => void
  participants: Participant[]
  setParticipants: (participants: Participant[]) => void
  selectedParticipants: Participant[]
  setSelectedParticipants: (selectedParticipants: Participant[]) => void
}

export const useParticipantsStore = create<ParticipantsState>((set) => ({
  eventId: '',
  setEventId: (eventId) => set({eventId}),
  participants: [],
  setParticipants: (participants) => set({ participants }),
  selectedParticipants: [],
  setSelectedParticipants: (selectedParticipants) => set({ selectedParticipants }),
}))


