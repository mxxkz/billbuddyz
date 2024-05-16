'use client'
import { redirect, useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import * as React from 'react'
import { IoChevronBackOutline } from 'react-icons/io5'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { getParticipanFromEventId } from '../../../../../actions/user'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { participantsSchemaType, participantsSchema } from '@/schema/userSchema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from '@/components/ui/use-toast'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import { Avatar } from '@/components/ui/avatar'
import { useParticipantsStore } from '@/stores/participantsStore'
import { Input } from '@/components/ui/input'
import { useBillingStore } from '@/stores/billingStore'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { HiOutlineLightBulb } from 'react-icons/hi'


export default function Step1() {
  const searchParams = useSearchParams()
  const billingType = searchParams.get('billingType')
  const router = useRouter()
  const {participants, setParticipants, selectedParticipants, setSelectedParticipants, eventId, setEventId} = useParticipantsStore()
  const {setBilling, setHasReceipt} = useBillingStore()
  const {data: session, status} = useSession()
  const loading = status === 'loading'
  const form = useForm<participantsSchemaType>({
    resolver: zodResolver(participantsSchema),
    defaultValues: {
    }
  }
  )
  const [inputKey, setInputKey] = useState(Date.now())

  useEffect(() => {
    if (!loading && !session?.user) {
      return redirect('/')
    }
    if (session?.user) {
      const fetchParticipants = async () => {
        const response = await getParticipanFromEventId(eventId!)
        if (response) {
          await setParticipants(response)
        }
      }
      fetchParticipants()
    }
    form.reset({ participants: selectedParticipants })
  }, [loading, session, selectedParticipants])


  async function onSubmitList(data: participantsSchemaType) {
    await setSelectedParticipants(data.participants)
    await setIsLoading(true)

    if (image) {
      const formData = new FormData();
      formData.append('file', image)
      const response = await fetch('https://wangaim-api-bill-buddyz.hf.space/uploadfile/', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const responseBody = await response.json(); // or response.text() if the response is plain text
        await setBilling(responseBody)
        await setHasReceipt(true)
        router.push(`/billing/create/step2?billingType=list`)
      } else {
        setImage(null)
        setInputKey(Date.now())
        await setIsLoading(false)
        toast({
          title: 'error',
          description: 'รูปภาพใบเสร็จไม่ถูกต้อง กรุณาอัพโหลดรูปใหม่อีกครั้งหรือกรอกข้อมูลด้วยตนเอง',
          variant: 'destructive'
        })
      }
    }else{
      router.push(`/billing/create/step2?billingType=list`)
    }
  }
  async function onSubmitNormal(data: participantsSchemaType) {
    await setSelectedParticipants(data.participants)
    await setIsLoading(true)
    router.push(`/billing/create/step2?billingType=normal`)
  }

  function onBack() {
    setSelectedParticipants([])
    setParticipants([])
    setHasReceipt(false)
    router.back()
  }

  const [isLoading, setIsLoading] = useState(false)
  const [image, setImage] = useState(null)

  const handleImageChange = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }

  return (
    <div className='min-h-screen min-w-full'>
      <div className='flex flex-col gap-10 items-center px-4 pb-10 pt-20 w-full'>
        <div className='flex items-center justify-between w-full'>
          <IoChevronBackOutline size={30} onClick={onBack} />
          <h1 className='text-2xl font-medium'>
            Create Billing
          </h1>
          <div></div>
        </div>
        {billingType=='normal' &&
        <Card className='w-full sm:w-1/3 shadow-lg'>
          <CardHeader className='pb-2'>
            <div className='text-xl font-semibold'>
              ใครต้องจ่ายเงินบ้าง
            </div>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <Separator />
            <Form {...form}>
              <form className="space-y-8">
                <FormField
                  control={form.control}
                  name='participants'
                  render={({}) => (
                    <FormItem>
                      {participants.map((participant) => (
                        <FormField
                          key={participant.user.id}
                          control={form.control}
                          name='participants'
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={participant.user.id}
                                className="flex flex-row items-center space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.some(item => item.user.id === participant.user.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, participant])
                                        : field.onChange(
                                          field.value?.filter(
                                            (item) => item.user.id !== participant.user.id
                                          )
                                        )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal flex gap-2 items-center">
                                  <Avatar className='h-8 w-8'>
                                    <div className="relative h-full w-full aspect-square">
                                      <Image fill src={participant.user.image || 'defaultImageSrc'} alt={"profile image"} referrerPolicy={"no-referrer"}/>
                                    </div>
                                  </Avatar>
                                  {participant.user.name}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button className='rounded-full w-full' onClick={form.handleSubmit(onSubmitNormal)}>ถัดไป</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
          }
        {billingType==='list' && (
          <>
          <Card className='w-full sm:w-1/3 shadow-lg'>
            <CardHeader className='pb-2'>
              <div className='text-xl font-semibold'>
                ใครต้องจ่ายเงินบ้าง
              </div>
            </CardHeader>
            <CardContent className='flex flex-col gap-4'>
              <Separator />
              <Form {...form}>
                <form className="space-y-8">
                  <FormField
                    control={form.control}
                    name='participants'
                    render={({}) => (
                      <FormItem>
                        {participants.map((participant) => (
                          <FormField
                            key={participant.user.id}
                            control={form.control}
                            name='participants'
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={participant.user.id}
                                  className="flex flex-row items-center space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.some(item => item.user.id === participant.user.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, participant])
                                          : field.onChange(
                                            field.value?.filter(
                                              (item) => item.user.id !== participant.user.id
                                            )
                                          )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal flex gap-2 items-center">
                                    <Avatar className='h-8 w-8'>
                                      <div className="relative h-full w-full aspect-square">
                                        <Image fill src={participant.user.image || 'defaultImageSrc'} alt={"profile image"} referrerPolicy={"no-referrer"}/>
                                      </div>
                                    </Avatar>
                                    {participant.user.name}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </form>
              </Form>
            </CardContent>
          </Card>
            <Card className='w-full sm:w-1/3 shadow-lg'>
              <CardHeader className='pb-2'>
                <div className='text-xl font-semibold'>
                  อัปโหลดใบเสร็จ
                </div>
              </CardHeader>
            <CardContent className='flex flex-col gap-4'>
              <Alert>
                <HiOutlineLightBulb size={20}/>
                <AlertTitle>Tips!</AlertTitle>
                <AlertDescription>
                    ถ่ายใบเสร็จให้เห็นตัวอักษรชัดเจน เพื่อเพิ่มประสิทธิภาพที่ดีขึ้น กดถัดไปหากต้องการเพิ่มรายการด้วยตนเอง
                </AlertDescription>
              </Alert>
              <Input key={inputKey} type='file'  accept='image/*' onChange={handleImageChange} />
              <Button className='rounded-full w-full' onClick={form.handleSubmit(onSubmitList)}> {isLoading ? 'กำลังประมวลผล...' : 'ถัดไป'}</Button>
            </CardContent>
          </Card>
          </>
        )}
      </div>
      <Navbar initialButton='billing' />
    </div>
  )
}
