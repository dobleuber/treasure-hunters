import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import {Box, Center, Spacer, Stack} from '@chakra-ui/react'

import NavBar from '../components/NavBar'
import Disconnected from '../components/Disconnected'
import Connected from '../components/Connected'
import { useWallet } from '@solana/wallet-adapter-react'

const Home: NextPage = () => {
  const {connected} = useWallet()

  return (
    <div className={styles.container}>
      <Head>
        <title>Treasure Hunters</title>
        <meta name="The NFT Collection of Treasures" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box
        w="full"
        h="calc(100vh)"
        bgImage={"url(/home-background.png)"}
        backgroundPosition="center"
      >
        <Stack w="full" h="calc(100vh)" justify="center">
          <NavBar />
          <Spacer/>
          {/** If connected, the second view, otherwise the first */}
            <Center>
              {connected ? <Connected /> : <Disconnected />}
              
            </Center>
          <Spacer/>
          <Center>
            <Box marginBottom={4} color="white">
              <a
                href="https://twitter.com/dobleuber"
                target="_blank"
                rel="noopener noreferrer"
              >
                build for @dobleuber
              </a>
            </Box>
          </Center>
        </Stack>
      </Box>
    </div>
  )
}

export default Home
