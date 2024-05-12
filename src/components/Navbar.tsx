'use client'
import { GoHomeFill } from 'react-icons/go'
import { FaWallet } from 'react-icons/fa'
import { IoStatsChart, IoPerson } from 'react-icons/io5'
import Link from 'next/link'
import useNavbarStore from '@/stores/navbarStore'
import { useEffect } from 'react'
import { useParticipantsStore } from '@/stores/participantsStore'
import { useBillingStore } from '@/stores/billingStore'


interface NavbarProps {
  initialButton: string
}
const Navbar = ({initialButton}: NavbarProps) => {
  const {activeButton, setActiveButton} = useNavbarStore()
  const {setParticipants, setSelectedParticipants } = useParticipantsStore()
  const {setHasReceipt} = useBillingStore()
  useEffect(()=> {
    setActiveButton(initialButton)
  },[])
  const handleMenuClick = (buttonName:string) => {
    setActiveButton(buttonName)
    setParticipants([])
    setSelectedParticipants([])
    setHasReceipt(false)
  }
  return (
    <div className='w-full flex justify-center mt-12 sticky bottom-0'>
    <div className='w-full sm:w-3/6 border-t-2 sm:border-none min-h-16 shadow-md flex gap-4 p-4 items-center fixed bottom-0 bg-white sm:rounded-t-2xl justify-between'>
      <div className='hidden gap-4 items-center sm:flex'>
      <div className='size-12'>
        <img src='/logo.png' alt='logo'/>
      </div>
      <h2 className='font-bold text-xl'>BillBuddyz</h2>
      </div>
        <Link href={'/dashboard'} className={activeButton === 'dashboard' ? undefined : 'text-[#D9D9D9]'} onClick={()=>handleMenuClick('dashboard')}>
          <GoHomeFill size={40} />
        </Link>
        <Link href={'/billing'} className={activeButton === 'billing' ? undefined : 'text-[#D9D9D9]'} onClick={()=>handleMenuClick('billing')}>
        <FaWallet size={40} />
        </Link>
        <Link href={'/statistic'} className={activeButton === 'statistic' ? undefined : 'text-[#D9D9D9]'} onClick={()=>handleMenuClick('statistic')}>
        <IoStatsChart size={40} />
        </Link>
      <Link href={'/profile'} className={activeButton === 'profile' ? undefined : 'text-[#D9D9D9]'} onClick={()=>handleMenuClick('profile')}>
        <IoPerson size={40} />
      </Link>
    </div>
    </div>
  )
}

export default Navbar
