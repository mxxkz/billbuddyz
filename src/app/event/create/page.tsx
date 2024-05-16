'use client'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { useSearchParams } from 'next/navigation'
import { IoChevronBackOutline } from 'react-icons/io5'
import { Card, CardContent} from '@/components/ui/card'
import { format } from 'date-fns'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { toast } from '@/components/ui/use-toast'
import * as React from 'react'
import { Label } from '@/components/ui/label'
import { TimePickerInput } from '@/components/TimePickerInput'
import { Input } from '@/components/ui/input'
import { HiOutlinePencilAlt } from 'react-icons/hi'
import { GoCalendar } from 'react-icons/go'
import { Textarea } from '@/components/ui/textarea'
import { HiOutlineLocationMarker } from 'react-icons/hi'
import { createEventSchema, createEventSchemaType } from '@/schema/eventSchema'
import { getExistingJoinId, createEvent } from '../../../../actions/event'
import { useSession } from 'next-auth/react'
import { Suspense } from 'react'


function Create() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type')
  const minuteRef = React.useRef<HTMLInputElement>(null)
  const hourRef = React.useRef<HTMLInputElement>(null)
  const { data: session, status } = useSession()
  const form = useForm<createEventSchemaType>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      eventName: '',
      description: '',
      location: '',
      joinId: null,
      organizerId: ''
    }
  })

  const generateUniqueJoinId = async (): Promise<string> => {
    let joinId: string = ''
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'

    const generateJoinId = (): string => {
      for (let i = 0; i < 6; i++) {
        joinId += characters.charAt(Math.floor(Math.random() * characters.length))
      }
      return joinId
    }
    joinId = generateJoinId()

    const existingEvent = await getExistingJoinId(joinId)

    if (existingEvent) {
      return generateUniqueJoinId()
    } else {
      return joinId
    }
  }

  const onSubmit = async (data: createEventSchemaType) => {
    try {
      if(type == 'group') {
        const joinId = await generateUniqueJoinId()
        data.joinId = joinId
      }
      if(session) {
        data.organizerId = session?.user.id
      }
      await createEvent(data)
      toast({
        title: 'Success',
        description: 'สร้างกิจกรรมสำเร็จ',
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

  return (
    <div className='min-h-screen min-w-full'>
      <div className='flex flex-col gap-10 items-center px-4 pb-10 pt-20 w-full'>
        <div className='flex items-center justify-between w-full'>
          <IoChevronBackOutline size={30} onClick={() => router.back()} />
          <h1 className='text-2xl font-medium'>
            Create Event
          </h1>
          <div></div>
        </div>
        <Card className='w-full sm:w-1/2'>
          <CardContent className='p-4'>
            <Form {...form}>
              <form
                className='flex flex-col items-center gap-4 w-full'
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name='eventName'
                  render={({field}) => (
                    <FormItem className='flex flex-col w-full'>
                      <FormLabel className='font-semibold'>ชื่อกิจกรรม</FormLabel>
                      <FormControl>
                        <div className='bg-[#F5F5F8] border border-[#CBD5E1] flex gap-1 items-center px-2 rounded-md focus-within:ring-2'>
                          <HiOutlinePencilAlt size={30}/>
                          <Input className='border-none bg-[#F5F5F8]' placeholder='เพิ่มชื่อกิจกรรม' {...field} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='description'
                  render={({field}) => (
                    <FormItem className='flex flex-col w-full'>
                      <FormLabel className='font-semibold'>รายละเอียด</FormLabel>
                      <FormControl>
                        <div className='bg-[#F5F5F8] border border-[#CBD5E1] flex gap-1 items-center px-2 rounded-md focus-within:ring-2'>
                          <Textarea className='border-none bg-[#F5F5F8]' placeholder='เพิ่มรายละเอียดของกิจกรรม' {...field} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='date'
                  render={({ field }) => (
                    <FormItem className="flex flex-col w-full">
                      <FormLabel>กิจกรรมของคุณจะเริ่มเมื่อไหร่?</FormLabel>
                      <Popover>
                        <FormControl>
                          <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left bg-[#F5F5F8] border border-[#CBD5E1] flex gap-4 items-center px-2 rounded-md focus-within:ring-2",
                                )}
                              >
                                <GoCalendar size={30} />
                                {field.value ? (
                                  <span className='font-normal'>{format(field.value, "PP HH:mm")}</span>
                                ) : (
                                  <span className='font-normal text-muted-foreground'>วันที่เริ่มกิจกรรม</span>
                                )}
                              </Button>
                          </PopoverTrigger>
                        </FormControl>
                        <PopoverContent className="w-full p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                          <div className="p-3 border-t border-border">
                            <div className="flex items-end gap-2">
                              <div className="grid gap-1 text-center">
                                <Label htmlFor="hours" className="text-xs">
                                  Hours
                                </Label>
                                <TimePickerInput
                                  picker="hours"
                                  date={field.value}
                                  setDate={field.onChange}
                                  ref={hourRef}
                                  onRightFocus={() => minuteRef.current?.focus()}
                                />
                              </div>
                              <div className="grid gap-1 text-center">
                                <Label htmlFor="minutes" className="text-xs">
                                  Minutes
                                </Label>
                                <TimePickerInput
                                  picker="minutes"
                                  date={field.value}
                                  setDate={field.onChange}
                                  ref={minuteRef}
                                  onLeftFocus={() => hourRef.current?.focus()}
                                />
                              </div>
                              <div className="flex h-10 items-center">
                                <Clock className="ml-2 h-4 w-4" />
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='location'
                  render={({field}) => (
                    <FormItem className='flex flex-col w-full'>
                      <FormLabel className='font-semibold'>สถานที่</FormLabel>
                      <FormControl>
                        <div className='bg-[#F5F5F8] border border-[#CBD5E1] flex gap-1 items-center px-2 rounded-md focus-within:ring-2'>
                          <HiOutlineLocationMarker size={30}/>
                          <Input className='border-none bg-[#F5F5F8]' placeholder='เพิ่มสถานที่' {...field} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button className='rounded-full mt-10 w-full' type="submit">สร้างกิจกรรม</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <div>
      </div>
      </div>
      <Navbar initialButton='dashboard' />
    </div>
  )
}

export default function CreateWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Create />
    </Suspense>
  )
}
