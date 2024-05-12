'use client'
import React, { ReactNode } from 'react'
import {SessionProvider} from 'next-auth/react'

const Provider = ({ children, }: Readonly<{ children: React.ReactNode}>) => {
  return (
      <SessionProvider>
        {children}
      </SessionProvider>
  )
}
export default Provider
