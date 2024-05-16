'use client'
import Navbar from '@/components/Navbar'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {Card} from '@/components/ui/card'
import ExpenseCard from '@/components/ExpenseCard'
import { Suspense, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'
import { getBillingOwner, getBillingPayer } from '../../../actions/billing'
import * as React from 'react'
function Billing() {
  const {data: session, status} = useSession()
  const loading = status === 'loading'
  const router = useRouter()
  const [dataPayer, setDataPayer] = useState<any>(null)
  const [dataOwner, setDataOwner] = useState<any>(null)
  const [totalPayer, setTotalPayer] = useState<number>(0)
  const [totalOwner, setTotalOwner] = useState<number>(0)

  useEffect(() => {
    if (!loading && !session?.user) {
      return redirect('/')
    }
    if (session?.user) {
      const fetchData = async () => {
        const response = await getBillingPayer(session?.user.id)
        const responseOwner = await getBillingOwner(session?.user.id)
        if (response !== null) {
          await setDataPayer(response)
        }
        if (responseOwner !== null) {
          await setDataOwner(responseOwner)
        }
      }
      fetchData()
    }
  }, [loading, session])

  useEffect(() => {
    if (dataPayer !== null) {
      const totalAmount = dataPayer.reduce((total:number, billing:any) => total + billing.billingParticipants[0].totalAmount, 0)
      setTotalPayer(totalAmount.toFixed(2));
    }
  }, [dataPayer] )


  useEffect(() => {
    if (dataOwner !== null) {
      const totalAmount = dataOwner.reduce((total:number, billing:any) => total + billing.totalAmount, 0)
      setTotalOwner(totalAmount.toFixed(2))
    }
  }, [dataOwner])


  return (
    <div className='min-h-screen min-w-full'>
      <div className='flex flex-col gap-10 items-center px-4 py-10'>
        <h1 className='text-2xl font-medium'>
          Billing
        </h1>
        <Tabs defaultValue='shared' className="w-full sm:w-1/2">
          <TabsList className="grid w-full grid-cols-2 shadow-lg font-abc">
            <TabsTrigger value='shared' >เงินที่ต้องจ่าย</TabsTrigger>
            <TabsTrigger value='owner'>เงินที่ต้องได้คืน</TabsTrigger>
          </TabsList>
          <TabsContent value='shared'>
            <Card className='min-h-[42rem] flex flex-col gap-6 items-center p-4'>
              <h1  className='text-xl font-medium'>
                จำนวนเงินทั้งหมด:
                <span className='text-2xl font-medium'>{totalPayer}</span>
                บาท
              </h1>
              {dataPayer && dataPayer.map((billing:any) => (
                  <div className='w-full' key={billing.id} onClick={()=>router.push(`/billing/${billing.id}?eventId=${billing.eventId}&type=payer`)}>
                    <ExpenseCard billing={billing} type='Payer'/>
                  </div>
              ))
              }
            </Card>
          </TabsContent>
          <TabsContent value='owner'>
            <Card className='min-h-[42rem] flex flex-col gap-6 items-center p-4'>
              <h1  className='text-xl font-medium'>
                จำนวนเงินทั้งหมด:
                <span className='text-2xl font-medium'>{totalOwner}</span>
                THB
              </h1>
              {dataOwner && dataOwner.map((billing:any) => (
                <div className='w-full' key={billing.id} onClick={()=>router.push(`/billing/${billing.id}?eventId=${billing.eventId}&type=owner`)}>
                <ExpenseCard billing={billing} type='Owner'/>
                </div>
              ))
              }
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Navbar initialButton='billing' />
    </div>
  )
}

export default function BillingWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Billing />
    </Suspense>
  )
}
