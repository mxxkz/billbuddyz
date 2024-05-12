'use client'
import { signIn } from 'next-auth/react'
import { FcGoogle } from 'react-icons/fc'
import { Button } from '@/components/ui/button'

const SignInButton = () => {
  return(
    <Button variant='outline' className='rounded-3xl text-[#23353E] text-xl shadow-lg w-3/4 sm:w-1/5 flex gap-2'
    onClick={()=>{signIn('google').catch(console.error)}}>
      <FcGoogle/>
      เข้าสู่ระบบด้วย google
    </Button>
  )
}

export default SignInButton
