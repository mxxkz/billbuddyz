'use client'
import {create} from 'zustand'

interface NavbarState {
  activeButton: string
  setActiveButton: (buttonName: string) => void
}

const useNavbarStore = create<NavbarState>((set) => {

  return {
    activeButton: 'dashboard',
    setActiveButton: (buttonName) => {
      set({ activeButton: buttonName })
    },
  }
})

export default useNavbarStore
