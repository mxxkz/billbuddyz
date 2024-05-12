import {Card} from '@/components/ui/card'
import {Separator} from '@/components/ui/separator'
import {Badge} from '@/components/ui/badge'
import cn from '@/lib/cn'

const ExpenseCard = ({ billing, type }: {billing:any, type:string}) => {
  const { event, billingParticipants, totalAmount } = billing
  const date = event.date
  let day = date.getDate()
  let month = date.getMonth()+1
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  let formattedDate = `${day}`
  let formattedMonth = `${monthNames[month - 1]}`

  return (
    <Card className='bg-[#f5f5f8] flex gap-4 p-4 w-full rounded-2xl items-center'>
      <div className='flex flex-col gap-2 items-center'>
        <h1 className='text-xl font-medium'>
          {formattedDate}
        </h1><h1 className='text-xl font-medium'>
          {formattedMonth}
        </h1>
      </div>
      <Separator orientation="vertical" className='bg-pink-400 h-24 w-1' />
      <div className='flex flex-col gap-2 grow'>
        <div className='flex flex-col'>
        <p className='text-md font-bold'>{event.name}</p>
        <p className='text-sm text-neutral-500'>@{event.location}</p>
        </div>
        <div className={cn(type==='Payer'? 'justify-between': 'justify-end', 'flex pt-4')}>
          {type==='Payer' &&
          <Badge className='bg-[#FFDF8B] px-1 font-medium text-neutral-800 rounded-md hover:bg-[#FFDF8B]]'>{billingParticipants[0].paymentStatus}</Badge>
          }
          <p className='text-lg font-medium'><span className='text-lg font-medium'> {type==='Payer'? (billingParticipants[0].totalAmount.toFixed(2)): totalAmount.toFixed(2)} </span>บาท</p>
        </div>
      </div>
    </Card>
  )
}

export default ExpenseCard
