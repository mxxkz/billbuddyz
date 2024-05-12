import { create } from 'zustand'

interface Item {
  name: string
  price: number
}

interface Billing {
  item: Item[]
  total: number
  vat: number
  serviceCharge: number
  discount: number
}

interface BillingState {
  billing: Billing
  setBilling: (billing: Billing) => void
  hasReceipt: boolean
  setHasReceipt: (hasReceipt: boolean) => void
}

export const useBillingStore = create<BillingState>((set)=> ({
  billing: {
    item: [],
    total: 0,
    vat: 0,
    serviceCharge: 0,
    discount: 0,
  },
  setBilling: (billing) => set({ billing }),
  hasReceipt: false,
  setHasReceipt: (hasReceipt) => set({hasReceipt})
}))


