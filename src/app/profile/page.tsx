'use client'
import Navbar from '@/components/Navbar'
import {
  Card,
} from '@/components/ui/card'
import {
  Avatar,
  AvatarFallback
} from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {Switch} from '@/components/ui/switch'
import { MdLogout } from 'react-icons/md'
import Image from 'next/image'
import { signOut, useSession } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'
import { QrCodeDialog } from '@/components/QrCodeDialog'
import { toast } from '@/components/ui/use-toast'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { getQrCode } from '../../../actions/user'

export default function Profile() {
  const {data: session, status} = useSession()
  const [image, setImage] = useState<string | null>(null)
  const loading = status === 'loading'

  useEffect(() => {
    if (!loading && !session?.user) {
      return redirect('/')
    }
    if (session?.user) {
      console.log(session)
      const fetchImageUrl = async () => {
        const response = await getQrCode(session.user.id)
        if (response) {
          await setImage(response.qrcode)
          console.log('image url', image)
        }
      };
      fetchImageUrl()
    }
  }, [loading, session])

  const handleSaveComplete =  () => {
    toast({
      title: 'Success',
      description: 'อัปเดตรูป QRCode สำเร็จ'
    })
    setTimeout(() => {
      window.location.reload()
    }, 3000)
  }

  return (
    <div className='min-h-screen min-w-full'>
      <div className='flex flex-col gap-10 items-center px-4 py-10'>
        <h1 className='text-2xl font-bold'>
          Profile
        </h1>
        <Card className='w-full sm:w-1/2 p-4 flex flex-col gap-6 items-center'>
            <div className='flex gap-4 items-center self-start'>
            <Avatar className='h-12 w-12'>
              {session && session.user.image? (
                <div className="relative h-full w-full aspect-square">
                  <Image fill src={session.user.image} alt={"profile image"} referrerPolicy={"no-referrer"}/>
                </div>
              ):(
                <AvatarFallback>
                  <span className="sr-only ">{session && session.user.name}</span>
                </AvatarFallback>
              )}
            </Avatar>
              <h1 className='text-xl font-bold'>{session && session.user.name}</h1>
            </div>
            <div className='flex flex-col gap-4 w-full items-center'>
              <QrCodeDialog userId={session! && session.user.id} qrCode={image} onSaveComplete={handleSaveComplete}/>
              { image?
                (<div className='relative w-full h-full aspect-square shadow-lg rounded-2xl border'>
                  <Image src={image} alt='logo' fill />
                </div>) :
                (
                  (<div className='relative w-full h-full aspect-square shadow-lg rounded-2xl border flex justify-center items-center text-muted-foreground'>
                    ไม่มี QRCode
                  </div>)
                )
              }
            <Separator className='w-full'/>
              <div className='flex flex-col gap-2'>
                <div className='flex justify-between'>
                  <span className='font-medium'>การแจ้งเตือน</span>
                  <Switch />
                </div>
                <span className='text-[#94A3B8]'>เปิดการแจ้งเตือนเพื่อให้ไม่พลาดการแจ้งเตือนนัดหมายและการเรียกเก็บเงิน</span>
              </div>
              <Separator className='w-full'/>
              <div className='flex justify-between w-full items-center' onClick={()=>{signOut().catch(console.error)}}>
                <span className='font-medium'>ออกจากระบบ</span>
                <MdLogout size={30} color='#94A3B8'/>
              </div>
            </div>
        </Card>
      </div>
      <Navbar initialButton='profile'/>
    </div>
  )
}
