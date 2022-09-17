import type { NextPage } from 'next'

import MainLayout from '../components/MainLayout'
import Disconnected from '../components/Disconnected'
import Connected from '../components/Connected'
import { useWallet } from '@solana/wallet-adapter-react'

const Home: NextPage = () => {
  const {connected} = useWallet()

  return (
    <MainLayout>
      {connected ? <Connected /> : <Disconnected />}
    </MainLayout>   
  )
}

export default Home
