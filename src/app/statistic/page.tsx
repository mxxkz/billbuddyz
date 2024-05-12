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
import data from '@/data/data'

export default function Statistic() {
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
          <h1 className='text-lg font-medium'>Year 2023</h1>
          <ResponsiveContainer width={'100%'} height={200}>
            <BarChart data={data}>
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
                tickFormatter={(value) => `$${value}`}
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
