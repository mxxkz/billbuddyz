'use client'
import Navbar from '@/components/Navbar'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from '@/components/ui/card'
import {
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Bar,
} from 'recharts'
// import data from '@/data/data'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { redirect } from 'next/navigation'
import { getExpenseById } from '../../../actions/billing'

interface MonthlyTotals {
  [key: number]: number
}
interface DataPoint {
  name: string;
  total: number;
}

export default function Statistic() {
  const {data: session, status} = useSession()
  const loading = status === 'loading'
  const [expense, setExpense] = useState<DataPoint[]>([])

  useEffect(() => {
    if (!loading && !session?.user) {
      return redirect('/')
    }
    if (session?.user) {
      console.log(session.user)
      const fetchData = async () => {
        const response = await getExpenseById(session?.user.id)
        // Calculate the total amount for each month
        const monthlyTotals: MonthlyTotals = response.reduce((acc: MonthlyTotals, billingParticipant) => {
          const month = new Date(billingParticipant.billing.event.date).getMonth();// 0 = January, 11 = December
          if (!acc[month]) {
            acc[month] = 0
          }
          acc[month] += billingParticipant.totalAmount
          return acc
        }, {})

        // Format the data to match the chart structure
        const data = [
          { name: 'Jan', total: monthlyTotals[0] || 0 },
          { name: 'Feb', total: monthlyTotals[1] || 0 },
          { name: 'Mar', total: monthlyTotals[2] || 0 },
          { name: 'Apr', total: monthlyTotals[3] || 0 },
          { name: 'May', total: monthlyTotals[4] || 0 },
          { name: 'Jun', total: monthlyTotals[5] || 0 },
          { name: 'Jul', total: monthlyTotals[6] || 0 },
          { name: 'Aug', total: monthlyTotals[7] || 0 },
          { name: 'Sep', total: monthlyTotals[8] || 0 },
          { name: 'Oct', total: monthlyTotals[9] || 0 },
          { name: 'Nov', total: monthlyTotals[10] || 0 },
          { name: 'Dec', total: monthlyTotals[11] || 0 },
        ]
        setExpense(data)
      }
      fetchData()
    }
  }, [loading, session])
  return (
    <div className='min-h-screen min-w-full'>
      <div className='flex flex-col gap-10 items-center px-4 py-10'>
        <h1 className='text-2xl font-bold'>
          Statistic
        </h1>
      <Card className='w-full sm:w-1/2'>
        <CardHeader>
          <CardTitle>
            สรุปค่าใช้จ่าย
          </CardTitle>
          <CardDescription>
            ภาพรวมค่าใช้จ่ายรายเดือน
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4 items-center'>
          <h1 className='text-lg font-medium'>Year 2024</h1>
          <ResponsiveContainer width={'100%'} height={200}>
            <BarChart data={expense}>
              <XAxis
                dataKey={'name'}
                tickLine={false}
                axisLine={false}
                stroke='#23353E'
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                stroke='#23353E'
                fontSize={12}
                tickFormatter={(value) => `฿${value}`}
              />
              <Bar dataKey={'total'} radius={[4, 4, 0, 0]} fill='#23353E'/>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      </div>
      <Navbar initialButton='statistic' />
    </div>
  )
}
