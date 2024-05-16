'use client'
import {
  Dialog, DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { MdNavigateNext } from 'react-icons/md'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { storage } from '../../firebaseConfig'
import { getQrCode, updateQrCode } from '../../actions/user'
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage'
import * as React from 'react'



export const QrCodeDialog = ({userId, qrCode, onSaveComplete}: {userId: string, qrCode:string | null, onSaveComplete: () => void}) => {
  const [image, setImage] = useState<string | null>(qrCode)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageClick = () => {
      fileInputRef.current?.click()
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImage(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    const file = fileInputRef.current?.files ? fileInputRef.current.files[0] : null
    if (file) {
      const imageRef = ref(storage,`/images/qrcode/${userId}`)
      uploadBytes(imageRef,file).then(()=>
        {
          getDownloadURL(imageRef).then(
            (imageUrl: string) => {
              setImage(imageUrl)
              console.log(imageUrl)
              updateQrCode(userId,imageUrl)
              onSaveComplete()
            }
          )
        }
      )
    }
  }


  return(
    <Dialog>
      <DialogTrigger asChild>
        <div className='flex justify-between w-full items-center'>
          <span className='font-medium'>จัดการ QR Code</span>
          <MdNavigateNext size={40}/>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => {
        e.preventDefault()
      }}>
        <DialogHeader>
          <DialogTitle>จัดการ QR Code</DialogTitle>
          <DialogDescription>
            เพิ่มรูปภาพ QR Code ของคุณ
          </DialogDescription>
        </DialogHeader>
        <Input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} style={{ display: 'none' }} />
        {image ? (
          <div className='relative w-full h-full aspect-square shadow-lg rounded-2xl border' onClick={handleImageClick}>
            <Image fill src={image} alt={"profile image"} referrerPolicy={"no-referrer"} priority/>
          </div>
        ) : (
          // <Button onClick={handleImageClick}>Add Image</Button>
          <div className='rounded-2xl w-full h-full aspect-square flex justify-center items-center border' onClick={handleImageClick}>
            <span className='text-muted-foreground'>เพิ่มรูปภาพ QR Code</span>
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <div className='flex justify-end gap-2'>
              <Button className='rounded-full' type="submit" onClick={handleSave} >บันทึก</Button>
              <Button className='rounded-full' type="button" variant="secondary" onClick={()=> setImage(qrCode)}>
                ยกเลิก
              </Button>
            </div>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
