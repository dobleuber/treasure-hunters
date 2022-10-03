import type { NextPage } from 'next'

import MainLayout from '../components/MainLayout'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Container, Heading, VStack, Text, Image, Button, HStack } from '@chakra-ui/react'
import { MouseEventHandler, useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowForwardIcon } from '@chakra-ui/icons'
import { PublicKey } from '@solana/web3.js'
import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js'
import { useRouter } from 'next/router'

interface NewMintProps {
    mint: PublicKey
}

const NewMint: NextPage<NewMintProps> = ({mint}) => {
  const walletAdapter = useWallet()
  const {connection} = useConnection()
  const [metadata, setMetadata] = useState<any>()
  const {connected} = walletAdapter
  const router = useRouter()

  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback( async event => {
    router.push(`/stake?mint=${mint}&imageSrc=${metadata?.image}`)
  }, [router, mint, metadata])

  const metaplex = useMemo(() => Metaplex
    .make(connection)
    .use(walletAdapterIdentity(walletAdapter))
    ,
    [connection, walletAdapter]
  )

  useEffect(() => {
    if (!metaplex || !mint || !connected) return

    metaplex
        .nfts()
        .findByMint({mintAddress: mint})
        .run()
        .then(res => fetch(res.uri))
        .then(res => res.json())
        .then(setMetadata)
  }, [mint, metaplex, connected])

  return (
    <MainLayout>
      <VStack spacing={20}>
        <Container>
            <VStack spacing={8}>
                <Heading color="white" as="h1" size="2xl" textAlign="center">
                    A new treasure hunter has appeared 💰🏴‍☠️
                </Heading>
                <Text color="bodyText" fontSize="xl" textAlign="center">
                    Congratulations, you minted  lvl 1 Treasure Hunter! <br/>
                    Time to stake your hunter to earn treasures and level up!
                </Text>
            </VStack>
        </Container>

        <Image src={metadata?.image ?? ""} alt="" />

        <Button
            bgColor="accent"
            color="white"
            maxW="380px"
            onClick={handleClick}
        >
            <HStack>
                <Text>Stake your Treasure Hunter</Text>
                <ArrowForwardIcon/>
            </HStack>
        </Button>

      </VStack>
    </MainLayout>   
  )
}

NewMint.getInitialProps = async ({query: {mint}}) => {
    if (!mint) throw {error: 'No mint'}

    const mintPubKey = new PublicKey(mint)

    return {mint: mintPubKey}
}

export default NewMint
