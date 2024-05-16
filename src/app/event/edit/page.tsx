'use client'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { deleteParticipants, getEventById, editEvent } from '../../../../actions/event'
import { useEffect, useState } from 'react'
import * as React from 'react'
import { IoChevronBackOutline } from 'react-icons/io5'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { HiOutlineLocationMarker, HiOutlinePencilAlt } from 'react-icons/hi'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { GoCalendar } from 'react-icons/go'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { TimePickerInput } from '@/components/TimePickerInput'
import { Clock } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { editEventSchema, editEventSchemaType } from '@/schema/eventSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from '@/components/ui/use-toast'
import { Avatar } from '@/components/ui/avatar'
import Image from 'next/image'
import { FiMinusCircle } from 'react-icons/fi'
import { FiPlusCircle } from 'react-icons/fi'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

type User = {
  id: string
  name: string
  image: string | null
};

type Participant = {
  user: User
};

export default function Edit() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id') || ''
  const [participant, setParticipant] = useState<Participant[]>([])
  const minuteRef = React.useRef<HTMLInputElement>(null)
  const hourRef = React.useRef<HTMLInputElement>(null)
  const form = useForm<editEventSchemaType>({
    resolver: zodResolver(editEventSchema),
    defaultValues: {
      id: '',
      eventName: '',
      description: '',
      location: '',
      organizerId: ''
    }
  })
  const formData = form.watch()
  const [markedForDeletion, setMarkedForDeletion] = useState<Participant[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const response = await getEventById(id)
      if(response !== null) {
        form.setValue('id', response.id)
        form.setValue('eventName', response.name)
        form.setValue('date', response.date)
        form.setValue('description', response.description || '')
        form.setValue('location', response.location || '')
        form.setValue('organizerId', response.organizer.id)
        setParticipant(response.eventParticipants)
      }
    }
    fetchData()
  }, [])

  const handleMarkForDeletion = (index:any) => {
    setMarkedForDeletion([...markedForDeletion, participant[index]])
    setParticipant([...participant.slice(0, index), ...participant.slice(index + 1)])
  }

  const handleUndoDeletion = (index:any) => {
    setParticipant([...participant, markedForDeletion[index]])
    setMarkedForDeletion([...markedForDeletion.slice(0, index), ...markedForDeletion.slice(index + 1)])
  }


  const onSubmit = async (data: editEventSchemaType) => {
    try {
      const participants = markedForDeletion.map(participant => participant.user.id)
      await deleteParticipants(id, participants)
      setMarkedForDeletion([])
      await editEvent(data)
      toast({
        title: 'Success',
        description: 'แก้ไขกิจกรรมสำเร็จ',
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
            Edit Event
          </h1>
          <div></div>
        </div>
        <Card className='w-full sm:w-1/2'>
          <CardContent className='p-4'>
            <Form {...form}>
              <form
                className='flex flex-col items-center gap-4 w-full'
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
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <GoCalendar size={30} />
                              {field.value ? (
                                <span className='font-normal'>{format(field.value, "PP HH:mm")}</span>
                              ) : (
                                <span className='font-normal'>วันที่เริ่มกิจกรรม</span>
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
                <FormField
                  control={form.control}
                  name='organizerId'
                  render={({field}) => (
                    <FormItem className='flex flex-col w-full'>
                      <FormLabel className='font-semibold'>จัดการกิจกรรมโดย</FormLabel>
                      <FormControl>
                        <div className='bg-[#F5F5F8] border border-[#CBD5E1] flex gap-1 items-center px-2 rounded-md focus-within:ring-2'>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className='border-none bg-[#F5F5F8]'>
                              {participant.find(user => user.user.id === field.value) ? (
                                <div className='flex gap-2 items-center'>
                                  <Avatar className='h-8 w-8'>
                                    <div className="relative h-full w-full aspect-square">
                                      <Image fill src={participant.find(user => user.user.id === field.value)!.user.image || 'defaultImageSrc'} alt={"profile image"} referrerPolicy={"no-referrer"}/>
                                    </div>
                                  </Avatar>
                                  <div>
                                    {participant.find(user => user.user.id === field.value)!.user.name}
                                  </div>
                                </div>
                              ) : (
                                <SelectValue placeholder='Select an organizer'/>
                              )}
                            </SelectTrigger>

                            <SelectContent>
                              {participant.map(user => (
                                <SelectItem key={user.user.id} value={user.user.id}>
                                  <div className='flex gap-2 items-center'>
                                    <Avatar className='h-8 w-8'>
                                      <div className="relative h-full w-full aspect-square">
                                        <Image fill src={user.user.image || 'defaultImageSrc'} alt={"profile image"} referrerPolicy={"no-referrer"}/>
                                      </div>
                                    </Avatar>
                                    <div>
                                      {user.user.name}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className='w-full'>
                  <span className='font-semibold text-sm'>ผู้เข้าร่วม</span>
                  <div className='py-2 px-4'>
                  {participant.map((user, index) => (
                    <div key={user.user.id} className="flex items-center w-full justify-between pb-2">
                      <div className='flex gap-2 items-center'>
                        <Avatar className='h-8 w-8'>
                          <div className="relative h-full w-full aspect-square">
                            <Image fill src={user.user.image || 'defaultImageSrc'} alt={"profile image"} referrerPolicy={"no-referrer"}/>
                          </div>
                        </Avatar>
                        <div>
                          {user.user.name}
                        </div>
                      </div>
                      {user.user.id !== form.getValues().organizerId && (
                        <button
                          onClick={() => handleMarkForDeletion(index)}
                          aria-label="Delete participant"
                        >
                          <FiMinusCircle size={25} />
                        </button>
                      )}
                    </div>
                  ))}
                  {markedForDeletion.map((user, index) => (
                    <div key={user.user.id} className="flex items-center w-full justify-between">
                      <div className='flex gap-2 items-center'>
                        <Avatar className='h-8 w-8'>
                          <div className="relative h-full w-full aspect-square">
                            <Image fill src={user.user.image || 'defaultImageSrc'} alt={"profile image"} referrerPolicy={"no-referrer"}/>
                          </div>
                        </Avatar>
                        <div>
                          {user.user.name}
                        </div>
                      </div>
                      <button
                        onClick={() => handleUndoDeletion(index)}
                        aria-label="Undo deletion"
                      >
                        <FiPlusCircle size={25} />
                      </button>
                    </div>
                  ))}
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className='w-full rounded-full'>บันทึก</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        หากทำการเปลี่ยนผู้จัดการกิจกรรม การดำเนินการนี้จะให้สิทธิ์การจัดการกับผู้เข้าร่วมคนอื่น คุณจะไม่สามารถจัดการกิจกรรมนี้ได้อีก
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className='rounded-full'>Cancel</AlertDialogCancel>
                        <AlertDialogAction className='rounded-full' onClick={()=>onSubmit(formData)}>
                          Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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

