'use client'
import { IoChevronBackOutline } from 'react-icons/io5'
import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm, useFieldArray } from 'react-hook-form'
import { createBillingNormalSchemaType, createBillingNormalSchema, createBillingListSchema, createBillingListSchemaType } from '@/schema/billingSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParticipantsStore } from '@/stores/participantsStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Avatar } from '@/components/ui/avatar'
import { createBillingList, createBillingNormal, updateSlipToPaid } from '../../../../../actions/billing'
import { toast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { IoAddCircleSharp } from 'react-icons/io5'
import { FaCircleMinus } from 'react-icons/fa6'
import ParticipantCheckboxes from '@/components/ParticipantCheckboxes'
import { useBillingStore } from '@/stores/billingStore'
import { Suspense, useEffect, useState } from 'react'


function Step2() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const billingType = searchParams.get('billingType')
  const {selectedParticipants, eventId} = useParticipantsStore()
  const {billing, hasReceipt, setHasReceipt, setBilling} = useBillingStore()
  const [open, setOpen] = useState(false)
  const formNormal = useForm<createBillingNormalSchemaType>({
    resolver: zodResolver(createBillingNormalSchema),
    defaultValues: {
      totalAmount: 0
    }
  })
  const formList = useForm<createBillingListSchemaType>({
    resolver: zodResolver(createBillingListSchema),
    defaultValues: {
      totalAmount: 0.00,
      serviceCharge: 0.00,
      vat: 0.00,
      discount: 0.00,
      itemList: []
    }
  })
  const {fields, append, remove} = useFieldArray<createBillingListSchemaType>({
    control: formList.control,
    name: 'itemList'
  })

  useEffect(() => {
    formList.reset({
      totalAmount: billing.total,
      vat: billing.vat,
      serviceCharge: billing.serviceCharge,
      discount: billing.discount,
      itemList: billing.item.map((itemm) => ({
        name: itemm.name,
        price: itemm.price,
      }))
    });
  }, [hasReceipt])

  const handleSelectParticipant =  async (field: number, participantList: string[]) => {
    const transformedParticipantList = participantList.map(participant => ({ id: participant }))
    await formList.setValue(`itemList.${field}.participantList`, transformedParticipantList)
  }


  async function onSubmitNormal(data:createBillingNormalSchemaType) {
    try {
      if (selectedParticipants.length === data.amount.length) {
        const result =  selectedParticipants.map((participant, index) => ({
          userId: participant.user.id,
          amount: data.amount[index].amount
        }))
        await createBillingNormal(eventId, data.totalAmount, result)
        toast({
          title: 'Success',
          description: 'สร้างบิลเก็บเงินสำเร็จ',
        })
        setTimeout(() => {
          router.replace('/dashboard')
        }, 3000)
      }
    }catch (e:any) {
      toast({
        title: 'Error',
        description: 'มีบางอย่างผิดพลาด โปรดลองอีกครั้ง',
        variant: 'destructive'
      })
    }
  }

  async function onSubmitList(data: createBillingListSchemaType) {
    try {
      setOpen(false)
      await createBillingList(eventId,data)
      setHasReceipt(false)
      setBilling({
          item: [],
          total: 0,
          vat: 0,
          serviceCharge: 0,
          discount: 0,
        }
      )
      formList.reset()
      toast({
        title: 'Success',
        description: 'สร้างบิลเก็บเงินสำเร็จ',
      })
      setTimeout(() => {
        router.replace('/dashboard')
      }, 3000)
    }catch (e:any) {
      setOpen(false)
      toast({
        title: 'error',
        description: 'ข้อมูลไม่ถูกต้อง ตรวจสอบข้อมูลอีกครั้ง',
        variant: 'destructive'
      })
    }
  }

  function onBack() {
    setHasReceipt(false)
    setBilling({
        item: [],
        total: 0,
        vat: 0,
        serviceCharge: 0,
        discount: 0,
    }
    )
    formList.reset()
    router.back()
  }

  return(
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
          <CardContent className='pt-4'>
            <Form {...formNormal}>
              <form className='space-y-4'>
                <div className='flex w-full justify-between items-center'>
                  <div className='text-xl font-semibold flex-1 basis-1/2'>จำนวนเงินทั้งหมด</div>
                  <FormField
                    control={formNormal.control}
                    name='totalAmount'
                    render={({field}) => (
                      <FormItem className='flex-1 basis-1/4'>
                        <FormControl>
                          <Input type='number' {...field}   onBlur={e => field.onChange(Number(e.target.value).toFixed(2))} onChange={e => field.onChange(Number(e.target.value))}/>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                {selectedParticipants.map((participant,index) => (
                  <div key={participant.user.id} className='flex w-full justify-between items-center'>
                    <div className='flex-1 basis-1/2 flex gap-2 items-center'>
                      <Avatar className='h-8 w-8'>
                        <div className='relative h-full w-full aspect-square'>
                          <Image fill src={participant.user.image || 'defaultImageSrc'} alt={'profile image'} referrerPolicy={'no-referrer'}/>
                        </div>
                      </Avatar>
                      <span>{participant.user.name}</span>
                    </div>
                    <FormField
                      control={formNormal.control}
                      name={`amount.${index}.amount`}
                      render={({field})=> (
                        <FormItem className='flex-1 basis-1/4'>
                          <FormControl>
                            <Input type='number' {...field}  onBlur={e => field.onChange(Number(e.target.value).toFixed(2))} onChange={e => field.onChange(Number(e.target.value))}/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className='rounded-full w-full'>สร้างบิล</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => {
                    e.preventDefault()
                  }}>
                    <DialogHeader className='text-left'>
                      <DialogTitle>Are you sure?</DialogTitle>
                      <DialogDescription>
                        เมื่อกดยืนยันจะไม่สามารถแก้ไขได้ ระบบจะสร้างการเรียกเก็บเงินไปยังผู้เข้าร่วม
                      </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                      <DialogClose asChild>
                        <div className='flex justify-end gap-2'>
                          <Button className='rounded-full' type="submit" onClick={formNormal.handleSubmit(onSubmitNormal)} >บันทึก</Button>
                          <Button className='rounded-full' type="button" variant='secondary'>
                            ยกเลิก
                          </Button>
                        </div>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </form>
            </Form>
          </CardContent>
        </Card>}
        {billingType=='list' &&
          <>
          <Form {...formList}>
            <form className='space-y-4'>
          <Card className='w-full shadow-lg'>
            <CardContent className='pt-4 flex flex-col gap-4'>
                  <div className='flex w-full justify-between items-center'>
                    <div className='text-xl font-semibold flex-1 basis-1/2'>จำนวนเงินทั้งหมด</div>
                    <FormField
                      control={formList.control}
                      name='totalAmount'
                      render={({field}) => (
                        <FormItem className='flex-1 basis-1/4'>
                          <FormControl>
                            <Input type='number' {...field}   onBlur={e => field.onChange(Number(e.target.value).toFixed(2))} onChange={e => field.onChange(Number(e.target.value))}/>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  {fields.map((item, index) => (
                  <div key={item.id} className='flex w-full flex-col border bg-[#F5F5F8] p-2 gap-4'>
                    <div className='flex w-full justify-between items-center gap-2'>
                      <FaCircleMinus size={20} onClick={() => remove(index)} />
                      <FormField
                        control={formList.control}
                        name={`itemList.${index}.name`}
                        render={({field})=> (
                          <FormItem className='basis-1/2'>
                            <FormControl>
                              <Input type='string' {...field}   onChange={e => field.onChange(e.target.value)}/>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={formList.control}
                        name={`itemList.${index}.price`}
                        render={({field})=> (
                          <FormItem className='basis-1/3'>
                            <FormControl>
                              <Input type='number' {...field}   onBlur={e => field.onChange(Number(e.target.value).toFixed(2))} onChange={e => field.onChange(Number(e.target.value))}/>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className='flex w-full justify-end items-center gap-2'>
                      <FormField
                        control={formList.control}
                        name={`itemList.${index}.participantList`}
                        render={({field})=> (
                          <div className='flex flex-col gap-2 items-end'>
                          <FormItem className='basis-1/3'>
                            <FormControl>
                              <ParticipantCheckboxes field={index} onSelectParticipant={handleSelectParticipant} />
                            </FormControl>
                          </FormItem>
                          <FormMessage />
                          </div>
                        )}
                      />
                    </div>
                  </div> ))}
                  <Button type='button' className='bg-[#F5F5F8] flex gap-2 justify-start' variant='outline' onClick={() => append({name: '', price: 0, participantList: [] })}>
                    <IoAddCircleSharp size={30} />
                    เพิ่มรายการ
                  </Button>
            </CardContent>
          </Card>
          <Card className='w-full shadow-lg'>
            <CardContent className='flex flex-col gap-4 pt-6'>
              <div className='flex w-full justify-between items-center'>
                <div className='text-lg font-semibold flex-1 basis-1/2'>Service Charge</div>
                <FormField
                  control={formList.control}
                  name='serviceCharge'
                  render={({field}) => (
                    <FormItem className='flex-1 basis-1/4'>
                      <FormControl>
                        <Input type='number' {...field}   onBlur={e => field.onChange(Number(e.target.value).toFixed(2))} onChange={e => field.onChange(Number(e.target.value))}/>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className='flex w-full justify-between items-center'>
                <div className='text-lg font-semibold flex-1 basis-1/2'>Vat</div>
                <FormField
                  control={formList.control}
                  name='vat'
                  render={({field}) => (
                    <FormItem className='flex-1 basis-1/4'>
                      <FormControl>
                        <Input type='number' {...field}   onBlur={e => field.onChange(Number(e.target.value).toFixed(2))} onChange={e => field.onChange(Number(e.target.value))}/>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className='flex w-full justify-between items-center'>
                <div className='text-lg font-semibold flex-1 basis-1/2'>Discount</div>
                <FormField
                  control={formList.control}
                  name='discount'
                  render={({field}) => (
                    <FormItem className='flex-1 basis-1/4'>
                      <FormControl>
                        <Input type='number' {...field}   onBlur={e => field.onChange(Number(e.target.value).toFixed(2))} onChange={e => field.onChange(Number(e.target.value))}/>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className='rounded-full w-full'>สร้างบิล</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader className='text-left'>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                      เมื่อกดยืนยันจะไม่สามารถแก้ไขบิลเรียกเก็บเงินนี้ได้
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <div className='flex justify-end gap-2'>
                        <Button className='rounded-full' onClick={formList.handleSubmit(onSubmitList)}>บันทึก</Button>
                        <Button className='rounded-full' variant='secondary'>
                          ยกเลิก
                        </Button>
                      </div>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
            </form>
          </Form>
        </>}
      </div>
    </div>
  )
}
export default function Step2Wrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Step2 />
    </Suspense>
  )
}
