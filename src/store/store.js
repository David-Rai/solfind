import { create } from 'zustand'

//Wallet data
export const useWallet = create((set) => ({
  walletAddress:null,
  setWalletAddress:(a)=> set({walletAddress:a})
}))

//User data
export const useUser=create((set)=>({
    user:null,
    setUser:(u)=> set({user:u})
}))

