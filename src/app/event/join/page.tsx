'use client'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/Navbar'
import { redirect, useRouter } from 'next/navigation'
import { IoChevronBackOutline, IoPerson } from 'react-icons/io5'
import * as React from 'react'
import { Card, CardContent} from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { toast } from '@/components/ui/use-toast'
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp'
import { joinEventSchemaType, joinEventSchema } from '@/schema/eventSchema'
import { addParticipant, getEventByJoinId } from '../../../../actions/event'
import { useEffect, useState } from 'react'
import { FaLocationDot } from 'react-icons/fa6'
import cn from '@/lib/cn'
import { CgDetailsMore } from 'react-icons/cg'
import { BsPeopleFill } from 'react-icons/bs'
import { Avatar } from '@/components/ui/avatar'
import Image from 'next/image'
import { useSession } from 'next-auth/react'

export default function Join() {
  const router = useRouter()
  const [event, setEvent] = useState<any>(null)
  const [notFound, setNotFound] = useState<string>('')
  const form = useForm<joinEventSchemaType>({
    resolver: zodResolver(joinEventSchema),
    defaultValues: {
      joinId: '',
    },
  })
  const {data: session, status} = useSession()
  const loading = status === 'loading'

  useEffect(() => {
    if (!loading && !session?.user) {
      return redirect('/')
    }
    },[loading, session])

  const renderEventDetails = (event: any) => {
    const date = new Date(event.date)
    let day = date.getDate()
    let month = date.getMonth() + 1
    let year = date.getFullYear()
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    let formattedDate = `${day} ${monthNames[month - 1]} ${year}`
    let timeString = date.toLocaleTimeString()
    let [hours, minutes] = timeString.split(':')
    let formattedTime = `${hours}:${minutes}`
    const isUserInEvent = event.eventParticipants.some((user: any) => user.user.id === session?.user?.id)

    return (
      <div className='mx-auto w-full max-w-sm flex flex-col sm:p-4 sm:max-w-full gap-4 border rounded-2xl mt-6 p-4 bg-[#F5F5F8]'>
        <div className='flex gap-2 '>
          <div className={cn(event.joinId? 'bg-[#F29E6E]' : 'bg-[#68D0DF]', 'rounded-full h-5 w-5')} ></div>
          <div className='flex flex-col'>
            <span className='font-semibold text-xl'>
              {event.name}
            </span>
            <span>
              {formattedDate}
            </span>
            <span>
              {formattedTime}
            </span>
          </div>
        </div>
        {event.location !='' &&
          <div className='flex gap-2'>
            <FaLocationDot size={25} />
            @{event.location}
          </div>
        }
        {event.description !='' &&
          <div className='flex gap-2'>
            <CgDetailsMore size={25} />
            {event.description}
          </div>
        }
        <div className='flex gap-2'>
          <BsPeopleFill size={25} />
          <div className='flex flex-col gap-2'>
            <span>{event.eventParticipants.length} ผู้เข้าร่วม</span>
            {event.eventParticipants.map((user: any,index: number)=> {
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
                  <Image fill src={event.organizer.image} alt={"profile image"} referrerPolicy={"no-referrer"}/>
                </div>
              </Avatar>
              <div>
                {event.organizer.name}
              </div>
            </div>
          </div>
        </div>
        <Button className='mt-4 w-2/3 rounded-full self-center' disabled={isUserInEvent} onClick={()=>onSubmit(event.id)}>{isUserInEvent ? 'เข้าร่วมแล้ว' : 'เข้าร่วม'}</Button>
      </div>
    )
  }

  const onSubmit = async (eventId: string) => {
    try{
      await addParticipant(session!.user.id,eventId)
      toast({
        title: 'Success',
        description: 'เข้าร่วมกิจกรรมสำเร็จ',
      })
      setTimeout(() => {
        router.replace('/dashboard')
      }, 3000)
    }catch (e:any) {
      toast({
        title: 'Error',
        description: 'มีบางอย่างผิดพลาด โปรดลองอีกครั้ง',
        variant: 'destructive'
      })
    }
  }

  const onSearch = async (data: joinEventSchemaType) => {
      const response = await getEventByJoinId(data.joinId)
      if(response){
        setEvent(null)
        setEvent(response)
        console.log('res', response)
      }else{
        setEvent(null)
        setNotFound('ไม่พบกิจกรรม')
        console.log('res', response)
      }
      form.reset()
  }


  return (
    <div className='min-h-screen min-w-full'>
      <div className='flex flex-col gap-10 items-center px-4 pb-10 pt-20 w-full'>
        <div className='flex items-center justify-between w-full'>
          <IoChevronBackOutline size={30} onClick={() => router.back()} />
          <h1 className='text-2xl font-medium'>
            Join Event
          </h1>
          <div></div>
        </div>
        <Card className='w-full sm:w-1/2'>
          <CardContent className='p-4'>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSearch)} className="flex flex-col items-center gap-4 w-full">
                <FormField
                  control={form.control}
                  name='joinId'
                  render={({ field }) => (
                    <FormItem>
                      <h1 className='font-semibold self-center'>กรอกรหัส 6 หลักเพื่อค้นหากิจกรรม</h1>
                      <FormControl>
                        <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS} {...field}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button className='w-2/3 rounded-full' type="submit">ค้นหา</Button>
              </form>
            </Form>
            {event? renderEventDetails(event) : <div className='p-6 w-full text-center'>{notFound}</div>}
          </CardContent>
        </Card>
      </div>
      <Navbar initialButton='dashboard' />
    </div>
  )
}
