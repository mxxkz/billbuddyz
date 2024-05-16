'use client'

import { redirect, useParams, useRouter, useSearchParams } from 'next/navigation'
import { IoChevronBackOutline } from 'react-icons/io5'
import * as React from 'react'
import {
  getBillingOwnerById,
  getBillingPayerById,
  getEventDataByEventId, updateBillingStatus,
  updateSlipToPaid,
  updateSlipToVerify
} from '../../../../actions/billing'
import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '../../../../firebaseConfig'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Avatar } from '@/components/ui/avatar'
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


export default function Page(){
  const {data: session, status} = useSession()
  const loading = status === 'loading'
  const searchParams = useSearchParams()
  const type = searchParams.get('type')
  const eventId = searchParams.get('eventId')
  const params = useParams<{id: string}>()
  const router = useRouter()
  const [items, setItems] = useState<any>([])
  const [event, setEvent] = useState<any>()
  const [itemsOwner, setItemsOwner] = useState<any>()
  const [formattedDate, setFormattedDate] = useState<string>(' ')
  const [formattedTime, setFormattedTime] = useState<string>(' ')
  const [loadingData, setLoadingData] = useState(true)
  const [image, setImage] = useState<File | null>(null)
  const [checkedCash, setCheckedCash] = useState<boolean>(false)
  const [disable, setDisable] = useState(false)

  useEffect(() => {
    if (!loading && !session?.user) {
      return redirect('/')
    }
    if (session?.user) {
      const fetchData = async () => {
        if(type=='payer'){
        const response = await getBillingPayerById(params.id, session?.user.id)
        const response2 = await getEventDataByEventId(eventId!)
        setItems(response)
        setEvent(response2)
          if (response2 && response2.date) {
          const date = response2.date
          let day = date.getDate()
          let month = date.getMonth()+1
          let year = date.getFullYear()
          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
          setFormattedDate(`${day} ${monthNames[month - 1]} ${year}`)
          let timeString = new Date(response2.date).toLocaleTimeString()
          let [hours, minutes] = timeString.split(':')
          setFormattedTime(`${hours}:${minutes}`)
          }
          setLoadingData(false)
        }
        else if(type=='owner') {
          const response = await getBillingOwnerById(params.id)
          setItemsOwner(response)
          if (response && response.event.date) {
          const date = response.event.date
          let day = date.getDate()
          let month = date.getMonth()+1
          let year = date.getFullYear()
          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
          setFormattedDate(`${day} ${monthNames[month - 1]} ${year}`)
          let timeString = new Date(response.event.date).toLocaleTimeString()
          let [hours, minutes] = timeString.split(':')
          setFormattedTime(`${hours}:${minutes}`)
            setLoadingData(false)
        }
      }}
      fetchData()
    }
  },[loading,session])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }
  const allPaid = useMemo(() => {
    return itemsOwner?.billingParticipants.every((participant: any) => participant.paymentStatus === 'paid')
  }, [itemsOwner])


  async function onsubmit() {
    if (image) {
      const imageRef = ref(storage,`/images/slip/${items.totalAmount.billingId}_${session?.user.id}`)
      uploadBytes(imageRef,image).then(()=>
        {
          getDownloadURL(imageRef).then(
            (imageUrl: string) => {
              updateSlipToVerify(items.totalAmount.billingId,session?.user.id, imageUrl )
            }
          )
        }
      )
    }
    if(checkedCash){
      updateSlipToVerify(items.totalAmount.billingId,session?.user.id, null )
    }
    toast({
      title: 'Success',
      description: 'ส่งหลักฐานการจ่ายเงินสำเร็จ'
    })
    setTimeout(() => {
      router.replace('/dashboard')
    }, 3000)
  }

  async function onConfirmVerify(billingId: string, userId: string) {
    try{
      await updateSlipToPaid(billingId,userId)
      toast({
        title: 'Success',
        description: 'ตรวจสอบการจ่ายเงินสำเร็จ',
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

  async function onCloseBill(){
    try{
      await updateBillingStatus(eventId!)
      toast({
        title: 'Congratulations!',
        description: 'ยินดีด้วย คุณเก็บเงินครบแล้ว'
      })
      setTimeout(() => {
        router.back()
      }, 3000)
    }catch (e:any){
      toast({
        title: 'Error!',
        description: 'มีบางอย่างผิดพลาด'
      })
    }
  }

  return(
    <div className='min-h-screen min-w-full'>
      <div className='flex flex-col gap-10 items-center px-4 pb-10 pt-20 w-full'>
        <div className='flex items-center justify-between w-full'>
          <IoChevronBackOutline size={30} onClick={()=> router.back()}/>
          <h1 className='text-2xl font-medium'>
            Billing
          </h1>
          <div></div>
        </div>
        {type=='payer' && (
          <>
        <Card className='w-full sm:w-1/2'>
          <CardContent className='pt-4 flex flex-col gap-2 items-center'>
            <div className='w-full flex flex-col gap-1 items-start'>
              {loadingData? (
                <>
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </>
              ):
                (
                  <>
              <div className='text-lg font-medium'>{event? event.name : ''}</div>
              <div>{formattedDate} | {formattedTime}</div>
              <div>@{event? event.location: ''}</div>
              </>)
            }
            </div>
            <div className='bg-[#F5F5F8] border flex flex-col gap-2 items-center w-full rounded-lg p-4 pb-8'>
              <div className='w-full font-semibold text-center'>
                <div>ค่าใช้จ่ายของคุณ</div>
              </div>
              {loadingData? (
                <>
                <Skeleton className="h-4 w-[250px] bg-white" />
                <Skeleton className="h-4 w-[200px] bg-white" />
                <Skeleton className="h-4 w-[200px] bg-white" />
                </>
              ):
                (
                  <>
                  {items && items.itemData && items.itemData.map((item: any, index: number) => (
                <div key={index} className='w-full flex justify-between'>
                  <div>{item.item.name}</div>
                  <div>{item.price.toFixed(2)}</div>
                </div>
              ))}
                    <div className='w-full flex justify-between font-semibold'>
                      <span>vat</span>
                      <span>{items && items.totalAmount && items.totalAmount.vat.toFixed(2)}</span>
                    </div>
                    <div className='w-full flex justify-between font-semibold'>
                      <span>service charge</span>
                      <span>{items && items.totalAmount && items.totalAmount.serviceCharge.toFixed(2)}</span>
                    </div>
                    <div className='w-full flex justify-between font-semibold'>
                      <span>discount</span>
                      <span>{items && items.totalAmount && items.totalAmount.discount.toFixed(2)}</span>
                    </div>
                    <div className='w-full flex justify-between font-semibold'>
                      <span>ทั้งหมด</span>
                      <span>{items && items.totalAmount && items.totalAmount.totalAmount.toFixed(2)}</span>
                    </div>
                  </>
                  )
              }
              {loadingData? (
                  <Skeleton className="h-[250px] w-full rounded-xl bg-white" />
                ):(
                  <>
              <div className='relative w-full h-full aspect-square shadow-lg rounded-2xl border flex items-center justify-center'>
                {event.organizer.qrcode?
                  (<Image src={event.organizer.qrcode} alt='logo' fill />):(
                    <div>ไม่มี QR Code</div>
                  )}
              </div>
              </>
              )
              }
            </div>
          </CardContent>
        </Card>
            {items && items.totalAmount && items.totalAmount.paymentStatus == 'unpaid' && (
        <Card className='w-full sm:w-1/2'>
          <CardHeader className='pb-2'>
            <div className='text-xl font-semibold'>
              อัปโหลดสลิปจ่ายเงิน
            </div>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <Separator />
            <div className="flex items-center space-x-2">
              <Switch checked={checkedCash} onCheckedChange={setCheckedCash} />
              <Label className='text-lg font-normal'>จ่ายด้วยเงินสด</Label>
            </div>
            <Input id="picture" type="file"  accept='image/*' onChange={handleChange} disabled={checkedCash}/>
            <Button className='rounded-full w-full' onClick={onsubmit}>ส่ง</Button>
          </CardContent>
        </Card>
            )}
        </>
          )
        }
        {type=='owner' && (
          <>
            <Card className='w-full sm:w-1/2'>
              <CardContent className='pt-4 flex flex-col gap-2 items-center'>
                <div className='w-full flex flex-col gap-1 items-start'>
                  {loadingData? (
                      <>
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </>
                    ):
                    (
                      <>
                  <div className='text-lg font-medium'>{itemsOwner?.event.name}</div>
                  <div>{formattedDate} | {formattedTime}</div>
                  <div>@{itemsOwner?.event.location}</div>
                      </>
                    )
                  }
                </div>
                <div className='bg-[#F5F5F8] border flex flex-col gap-2 items-center w-full rounded-lg p-4 pb-8'>
                  <div className='w-full font-medium text-center'>
                    <div>ค่าใช้จ่ายของคุณ</div>
                  </div>
                  {loadingData? (
                      <>
                        <Skeleton className="h-4 w-[250px] bg-white" />
                        <Skeleton className="h-4 w-[200px] bg-white" />
                        <Skeleton className="h-4 w-[200px] bg-white" />
                      </>
                    ):
                    (
                      <>
                  {itemsOwner?.items.map((item: any) => (
                    <div key={item.id} className='w-full flex justify-between'>
                      <div>{item.name}</div>
                      <div>{item.price.toFixed(2)}</div>
                    </div>
                  ))}
                  </>
                    )
                  }
                  {loadingData? (
                      <>
                        <Skeleton className="h-4 w-[250px] bg-white" />
                        <Skeleton className="h-4 w-[200px] bg-white" />
                        <Skeleton className="h-4 w-[200px] bg-white" />
                      </>
                    ):
                    (
                      <>
                  <div className='w-full flex justify-between font-semibold'>
                    <span>vat</span>
                    <span>{itemsOwner?.vat.toFixed(2)}</span>
                  </div>
                  <div className='w-full flex justify-between font-semibold'>
                    <span>service charge</span>
                    <span>{itemsOwner?.serviceCharge.toFixed(2)}</span>
                  </div>
                  <div className='w-full flex justify-between font-semibold'>
                    <span>discount</span>
                    <span>{itemsOwner?.discount.toFixed(2)}</span>
                  </div>
                  <div className='w-full flex justify-between font-semibold'>
                    <span>ทั้งหมด</span>
                    <span>{itemsOwner?.totalAmount.toFixed(2)}</span>
                  </div>
                      </>
                    )
                  }
                </div>
              </CardContent>
            </Card>
            <Card className='w-full sm:w-1/2'>
              <CardContent className='flex flex-col gap-4 items-center'>
                <Accordion type='single' collapsible className='w-full'>
                  {itemsOwner?.billingParticipants.map((participant: any) => (
                    <AccordionItem key={participant.user.id} value={participant.user.id}>
                      <AccordionTrigger>
                        <div className='w-full flex justify-between'>
                          <div className='flex gap-1 items-center'>
                            <Avatar className='h-8 w-8'>
                                  <div className="relative h-full w-full aspect-square">
                                    <Image fill src={participant.user.image} alt={"profile image"} referrerPolicy={"no-referrer"}/>
                                  </div>
                                </Avatar>
                            {participant.user.name}
                          </div>
                          <div className='flex gap-1 items-center'>
                            {participant.totalAmount.toFixed(2)}
                            <span>บาท</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <>
                        {participant.paymentStatus=='verifying'? (
                          <div className='flex flex-col gap-4'>
                            <div className='relative w-full h-full aspect-square shadow-lg rounded-2xl border flex justify-center items-center'>
                              {!participant.paymentSlip && participant.paymentStatus=='verifying'? (
                                <span>จ่ายด้วยเงินสด</span>
                              ):(
                                <Image src={participant.paymentSlip} alt='slip' fill />
                              )}
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button className='rounded-full'>verify</Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => {
                                e.preventDefault()
                              }}>
                                <DialogHeader className='text-left'>
                                  <DialogTitle>Are you sure?</DialogTitle>
                                  <DialogDescription>
                                    เมื่อกดยืนยันจะไม่สามารถแก้ไขได้ ระบบจะอัปเดตสถานะการจ่ายเงิน
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <div className='flex justify-end gap-2'>
                                      <Button className='rounded-full' type="submit" onClick={()=>onConfirmVerify(itemsOwner?.id,participant.user.id)}>บันทึก</Button>
                                      <Button className='rounded-full' type="button" variant="secondary">
                                        ยกเลิก
                                      </Button>
                                    </div>
                                  </DialogClose>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        ):(
                          <>
                          {participant.paymentStatus=='paid'? (
                            <div className='flex flex-col gap-4'>
                            <div className='relative w-full h-full aspect-square shadow-lg rounded-2xl border flex justify-center items-center'>
                              {participant.paymentSlip? (
                                  <Image src={participant.paymentSlip} alt='slip' fill />
                              ) : (
                                <span>ผู้จัดการค่าใช้จ่าย</span>
                              )
                              }
                            </div>
                            <Button className='rounded-full' disabled >จ่ายแล้ว</Button>
                            </div>
                            ):(
                          <div className='relative w-full h-full aspect-square shadow-lg rounded-2xl border flex justify-center items-center'>
                            ยังไม่จ่าย
                          </div>)}
                            </>
                        )}
                          </>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                <Button className='w-full rounded-full' disabled={!allPaid} onClick={onCloseBill}>ปิดบิลค่าใช้จ่ายนี้</Button>
              </CardContent>
            </Card>
          </>
        )
        }
      </div>
    </div>
  )
}
