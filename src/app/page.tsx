// 'use client'
import Image from 'next/image'
import {Card} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { FcGoogle } from 'react-icons/fc'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'
import { signIn, useSession } from 'next-auth/react'
import { getAuthSession } from '@/lib/nextauth'
import { redirect } from 'next/navigation'
import SignInButton from '@/components/SignInButton'


export default async function Home() {
  const session = await getAuthSession()
  if(session?.user) {
    redirect('/dashboard')
  }

  return (
    <>
      <div className='min-h-screen min-w-full flex flex-col items-center justify-center gap-4'>
        <div className='w-[10rem] h-[10rem] relative'>
          <Image src='/logo.png' alt='logo' fill/>
        </div>
        <h1 className='text-5xl font-bold italic'>BillBuddyz</h1>
        <h1 className='text-xl font-medium'>จัดการการนัดหมายและการเรียกเก็บเงิน</h1>
        <div className='w-[20rem] h-[20rem] relative'>
          <Image src='/homePicture.svg' alt='home' fill/>
        </div>
        <SignInButton />
      </div>
    </>
)
}
