import * as React from 'react'

import { useParticipantsStore } from '@/stores/participantsStore'
import {
  DropdownMenu, DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { RiUserAddFill } from 'react-icons/ri'
import { useEffect,useState } from 'react'
import Image from 'next/image'
import { Avatar } from '@/components/ui/avatar'

interface selectParticipant {
  field: number
  onSelectParticipant: (field: number,participantList: string[]) => void
}

const ParticipantCheckboxes = ({field,onSelectParticipant}:selectParticipant) => {
  const { selectedParticipants } = useParticipantsStore()
  const [checkedParticipants, setCheckedParticipants] = useState<string[]>([])
  useEffect(() => {
    onSelectParticipant(field, checkedParticipants)
  }, [checkedParticipants])

  const handleCheckedChange = (participantId: string, checked: boolean) => {
    setCheckedParticipants(prevState => {
      if (checked) {
        return [...prevState, participantId];
      } else {
        return prevState.filter(id => id !== participantId);
      }
    })
  }

  return(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div>
            <RiUserAddFill size={20} />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <div>
          {selectedParticipants.map((participant) => (
            <div key={participant.user.id}>
              <DropdownMenuCheckboxItem
                checked={checkedParticipants.includes(participant.user.id)}
                onCheckedChange={e => handleCheckedChange(participant.user.id, e)}
              >
                <div className='flex gap-2 items-center'>
                <Avatar className='h-8 w-8'>
                  <div className="relative h-full w-full aspect-square">
                    <Image fill src={participant.user.image || 'defaultImageSrc'} alt={"profile image"} referrerPolicy={"no-referrer"}/>
                  </div>
                </Avatar>
                {participant.user.name}
                </div>
              </DropdownMenuCheckboxItem>
            </div>
          ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
  )
}

export default ParticipantCheckboxes
