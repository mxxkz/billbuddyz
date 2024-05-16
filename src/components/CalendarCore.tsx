'use client'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { useState } from 'react'
import { GrFormNext, GrFormPrevious } from 'react-icons/gr'
import { generateDate, months } from '@/lib/calendar'
import cn from '@/lib/cn'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { FaCirclePlus } from 'react-icons/fa6'
import Link from 'next/link'
import { useEffect } from 'react'
import { deleteEvent, getAllEvent } from '../../actions/event'
import { Separator } from '@/components/ui/separator'
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { FaTrash } from 'react-icons/fa'
import { FaPen } from 'react-icons/fa6'
import { FaLocationDot } from 'react-icons/fa6'
import { CgDetailsMore } from 'react-icons/cg'
import { BiSolidDoorOpen } from 'react-icons/bi'
import { BsPeopleFill } from 'react-icons/bs'
import { IoPerson } from 'react-icons/io5'
import * as React from 'react'
import Image from 'next/image'
import { Avatar } from '@/components/ui/avatar'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import {
  Dialog, DialogClose,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useParticipantsStore } from '@/stores/participantsStore'

dayjs.extend(utc)
dayjs.extend(timezone)
export const CalendarCore = () => {
  const days: string[] = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const currentDate = dayjs().tz('Asia/Bangkok')
  const [today, setToday] = useState(currentDate)
  const [selectDate, setSelectDate] = useState(currentDate)
  const [selectedEvents, setSelectedEvents] = useState<any[]>([])
  const [data, setData] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const router = useRouter()
  const {eventId, setEventId} = useParticipantsStore()

  useEffect(() => {
    const fetchData = async () => {
      const response = await getAllEvent()
      if(response !== null) {
        setData(response)
        setEvents(response.eventParticipants)
      }
    }
    fetchData()
  }, [])

  const onDelete = async (eventId: string) => {
    try{
      await deleteEvent(eventId)
      toast({
        title: 'Success',
        description: 'ลบกิจกรรมสำเร็จ',
      })
      setTimeout(() => {
        window.location.reload()
      }, 3000)
    }catch (e:any) {
      toast({
        title: 'Error',
        description: 'มีบางอย่างผิดพลาด โปรดลองอีกครั้ง',
        variant: 'destructive'
      })
    }
  }

  function onCreateBilling(eventId: string) {
    setEventId(eventId)
    router.push(`/billing/create`)

  }

  return (
    <div className='flex gap-10 justify-center sm:w-1/2 w-full items-center flex-col'>
    <Card className='bg-white p-4 w-full'>
      <div className='flex justify-between items-center'>
        <GrFormPrevious
          className='w-5 h-5 cursor-pointer hover:scale-105 transition-all'
          onClick={() => {
            setToday(today.month(today.month() - 1))
          }}
        />
        <h1 className='select-none font-semibold'>
          {months[today.month()]}, {today.year()}
        </h1>
        <GrFormNext
          className='w-5 h-5 cursor-pointer hover:scale-105 transition-all'
          onClick={() => {
            setToday(today.month(today.month() + 1))
          }}
        />
      </div>
      <div className='grid grid-cols-7 '>
        {days.map((day, index) => {
          return (
            <h1
              key={index}
              className='text-sm text-center h-14 w-14 grid place-content-center text-gray-500 select-none'
            >
              {day}
            </h1>
          )
        })}
      </div>

      <div className='grid grid-cols-7'>
        {generateDate(today.month(), today.year()).map(
          ({ date, currentMonth, today }, index) => {
            const hasEvent = events.some(event => dayjs(event.event.date).isSame(date, 'day'))
            return (
              <div
                key={index}
                className='p-2 text-center h-14 grid place-content-center text-sm border-t'
              >
                <h1
                  className={cn(
                    currentMonth ? '' : 'text-gray-400',
                    today ? 'bg-yellow-500 text-white' : '',
                    selectDate.toDate().toDateString() === date.toDate().toDateString() ? 'bg-[#23353E] text-white' : '',
                    'h-10 w-10 rounded-full grid place-content-center hover:bg-black hover:text-white transition-all cursor-pointer select-none'
                  )}
                  onClick={() => {
                    setSelectDate(date);
                    setSelectedEvents(events.filter(event => dayjs(event.event.date).isSame(date, 'day')))
                  }}
                >
                  {date.date()}
                  {hasEvent &&
                  <div className='w-2 h-2 rounded-full bg-red-600'></div>
                  }
                </h1>
              </div>
            )
          }
        )}
      </div>
    </Card>
  <Card className='bg-white p-4 w-full flex flex-col gap-4'>
    <div className='flex justify-between items-center'>
      <h1 className='font-semibold text-xl'>
        กิจกรรมวันนี้
      </h1>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='p-0 text-[#23353E]'>
            <FaCirclePlus size={40}/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-36'>
          <DropdownMenuLabel>สร้างกิจกรรม</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href={'/event/create?type=personal'}>
              กิจกรรมเดี่ยว
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href={'event/create?type=group'}>
              กิจกรรมกลุ่ม
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href={'event/join'}>
              เข้าร่วมกิจกรรม
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    {/*<p className='text-gray-400'>No meetings for today.</p>*/}
    {selectedEvents.length > 0 ? (
      selectedEvents.map((event, index) => {
        const date = event.event.date
        let day = date.getDate()
        let month = date.getMonth()+1
        let year = date.getFullYear()
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        let formattedDate = `${day} ${monthNames[month - 1]} ${year}`
        let timeString = new Date(event.event.date).toLocaleTimeString()
        let [hours, minutes] = timeString.split(':')
        let formattedTime = `${hours}:${minutes}`
        let eventType = event.event.joinId ? 'group' : 'personal'
        return (
          <div key={index}>
            <Drawer>
              <DrawerTrigger asChild>
                <div className='flex flex-col gap-2'>
                  <div className='flex gap-4' >
                    <p>{formattedTime}</p>
                    <Separator orientation='vertical' className={cn(event.event.joinId? 'bg-[#F29E6E]' : 'bg-[#68D0DF]', 'w-1 h-6')} />
                    <p>{event.event.name}</p>
                  </div>
                  <Separator />
                </div>
              </DrawerTrigger>
              <DrawerContent>
                <div className='mx-auto w-full max-w-sm flex flex-col sm:p-4 sm:max-w-full gap-4 pb-10'>
                  {event.event.organizer.id === data.id && !event.event.billing && (
                  <div className='self-end flex gap-4'>
                    <Dialog>
                      <DialogTrigger>
                        <FaTrash size={25} color={'#94A3B8'} />
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Are you sure?</DialogTitle>
                          <DialogDescription>
                            เมื่อกดยืนยันจะไม่สามารถแก้ไขได้ ระบบจะลบกิจกรรมนี้ออกจากตารางของคุณ
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <div className='flex justify-end gap-2'>
                              <Button className='rounded-full' type="button" variant="secondary">
                                ยกเลิก
                              </Button>
                              <Button className='rounded-full' type="submit" onClick={()=>onDelete(event.event.id)}>ยืนยัน</Button>
                            </div>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <FaPen size={25} color={'#94A3B8'} onClick={()=> router.push(`/event/edit/?type=${eventType}&id=${event.event.id}`)} />
                  </div>
                  )}
                  <div className='flex gap-2 '>
                    <div className={cn(event.event.joinId? 'bg-[#F29E6E]' : 'bg-[#68D0DF]', 'rounded-full h-5 w-5')} ></div>
                    <div className='flex flex-col'>
                      <span className='font-semibold text-xl'>
                        {event.event.name}
                      </span>
                      <span>
                        {formattedDate}
                      </span>
                      <span>
                        {formattedTime}
                      </span>
                    </div>
                  </div>
                  {event.event.location !='' &&
                  <div className='flex gap-2'>
                    <FaLocationDot size={25} />
                    @{event.event.location}
                  </div>
                  }
                  {event.event.description !='' &&
                  <div className='flex gap-2'>
                    <CgDetailsMore size={25} />
                    {event.event.description}
                  </div>
                  }
                  {event.event.joinId &&
                  <div className='flex gap-2'>
                    <BiSolidDoorOpen size={25} />
                    {event.event.joinId}
                  </div>
                  }
                  <div className='flex gap-2'>
                    <BsPeopleFill size={25} />
                    <div className='flex flex-col gap-2'>
                      <span>{event.event.eventParticipants.length} ผู้เข้าร่วม</span>
                      {event.event.eventParticipants.map((user: any,index: number)=> {
                        return (
                          <div key={index} className='flex gap-2 items-center'>
                            <Avatar className='h-8 w-8'>
                              <div className="relative h-full w-full aspect-square">
                                <Image fill src={user.user.image} alt={"profile image"} referrerPolicy={"no-referrer"}/>
                              </div>
                            </Avatar>
                            <div>
                              {user.user.name}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <IoPerson size={25} />
                    <div className='flex flex-col gap-2'>
                      <span>จัดการกิจกรรมโดย</span>
                      <div className='flex gap-2 items-center'>
                        <Avatar className='h-8 w-8'>
                          <div className="relative h-full w-full aspect-square">
                            <Image fill src={event.event.organizer.image} alt={"profile image"} referrerPolicy={"no-referrer"}/>
                          </div>
                        </Avatar>
                        <div>
                          {event.event.organizer.name}
                        </div>
                      </div>
                    </div>
                  </div>
                  {event.event.organizer.id === data.id && !event.event.billing && event.event.joinId && (
                    <Button className='w-full rounded-full' onClick={()=>onCreateBilling(event.event.id)}>สร้างบิล</Button>)}
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        )
      })
    ) : (
      <p className='text-gray-400'>วันนี้ไม่มีกิจกรรม :)</p>
    )}
  </Card>
    </div>
  )
}
