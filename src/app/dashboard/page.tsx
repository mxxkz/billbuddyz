
import Navbar from '@/components/Navbar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {CalendarCore} from '@/components/CalendarCore'
import { getAuthSession } from '@/lib/nextauth'
import { redirect } from 'next/navigation'
import Image from 'next/image'


export default async function Dashboard() {
  const session = await getAuthSession()
  if(!session?.user){
    return redirect('/')
  }

  return (
    <div className='min-h-screen min-w-full'>
      <div className='flex flex-col px-4 py-10 gap-4 items-center'>
      <div className='flex gap-4 items-center self-start sm:self-center sm:w-1/2'>
        <Avatar className='h-12 w-12'>
          {session.user.image? (
            <div className="relative h-full w-full aspect-square">
              <Image fill src={session.user.image} alt={"profile image"} referrerPolicy={"no-referrer"}/>
            </div>
          ):(
            <AvatarFallback>
              <span className="sr-only ">{session.user?.name}</span>
            </AvatarFallback>
          )}
        </Avatar>
        <h1 className='text-xl font-bold'>{session.user.name}</h1>
      </div>
        <CalendarCore />
      </div>
      <Navbar initialButton='dashboard' />
    </div>
  )
}
