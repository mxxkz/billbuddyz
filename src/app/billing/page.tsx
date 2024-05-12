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
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { getBillingOwner, getBillingPayer } from '../../../actions/billing'
import { getAllEvent } from '../../../actions/event'
export default function Billing() {
  const {data: session, status} = useSession()
  const loading = status === 'loading'
  const [dataPayer, setDataPayer] = useState<any>(null)
  const [dataOwner, setDataOwner] = useState<any>(null)
  const [totalPayer, setTotalPayer] = useState<number>(0)
  const [totalOwner, setTotalOwner] = useState<number>(0)

  useEffect(() => {
    if (!loading && !session?.user) {
      return redirect('/')
    }
    if (session?.user) {
      console.log(session.user)
      const fetchData = async () => {
        const response = await getBillingPayer(session?.user.id)
        const responseOwner = await getBillingOwner(session?.user.id)
        // const response = await getAllEvent()
        if (response !== null) {
          console.log(response)
          await setDataPayer(response)
        }
        if (responseOwner !== null) {
          console.log(responseOwner)
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
        <h1 className='text-2xl font-bold'>
          Billing
        </h1>
        <Tabs defaultValue='shared' className="w-full">
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
                <ExpenseCard key={billing.id} billing={billing} type='Payer'/>
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
                <ExpenseCard key={billing.id} billing={billing} type='Owner'/>
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
