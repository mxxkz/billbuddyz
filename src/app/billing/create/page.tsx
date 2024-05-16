'use client'
import { useRouter } from 'next/navigation'
import { IoChevronForwardOutline, IoChevronBackOutline } from 'react-icons/io5'
import * as React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import Navbar from '@/components/Navbar'
import Image from 'next/image'
import { useParticipantsStore } from '@/stores/participantsStore'



export default function CreatBilling() {
  const router = useRouter()
  const {setEventId} = useParticipantsStore()
  function onBack() {
    setEventId('')
    router.back()
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
        <Card className='w-full sm:w-1/3 shadow-lg'>
          <CardHeader>
            <div className='text-xl font-semibold'>
              ตัวเลือกการสร้างบิล
            </div>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <div className='w-full rounded-xl bg-[#F5F5F8] flex items-center justify-between p-2 sm:p-6'
                 onClick={()=>router.push(`/billing/create/step1?billingType=normal`)}>
              <div className='relative w-1/4 aspect-square sm:w-1/6'>
                <Image src={'/normal.svg'} alt='logo' fill />
              </div>
              <div className='flex flex-col'>
                <span className='font-semibold'>
                  สร้างบิลเรียกเก็บเงิน
                </span>
                <span className='text-muted-foreground'>
                  เพิ่มจำนวนเงินด้วยตนเอง
                </span>
              </div>
              <IoChevronForwardOutline size={30} />
            </div>
            <div className='w-full rounded-xl bg-[#F5F5F8] flex items-center justify-between p-2 sm:p-6'
                 onClick={()=>router.push(`/billing/create/step1?billingType=list`)}>
              <div className='relative w-1/4 aspect-square sm:w-1/6'>
                <Image src={'/receipt.svg'} alt='logo' fill />
              </div>
              <div className='flex flex-col'>
                <span className='font-semibold'>
                  สร้างบิลแยกตามรายการ
                </span>
                <span className='text-muted-foreground'>
                  อัพโหลดใบเสร็จเพื่อสร้างบิล
                </span>
              </div>
              <IoChevronForwardOutline size={30} />
            </div>

          </CardContent>
        </Card>
    </div>
      <Navbar initialButton='billing' />
    </div>
  )
}
