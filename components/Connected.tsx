import { FC, MouseEventHandler, useCallback, useEffect, useMemo, useState } from 'react'
import {Container, Heading, VStack, HStack, Text, Image, Button} from '@chakra-ui/react'

import { PublicKey } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import {
    Metaplex,
    walletAdapterIdentity,
    CandyMachine
} from '@metaplex-foundation/js'
import { useRouter } from 'next/router'

const Connected: FC = () => {
    const {connection} = useConnection()
    const walletAdapter = useWallet()
    const [candyMachine, setCandyMachine] = useState<CandyMachine | null>(null)
    const [isMinting, setIsMinting] = useState(false)

    const router = useRouter()

    const metaplex = useMemo(() => {
        return Metaplex.make(connection).use(walletAdapterIdentity(walletAdapter))
    }, [connection, walletAdapter])

    useEffect(() => {
        if (!metaplex) return
        
        metaplex
            .candyMachines()
            .findByAddress({
                address: new PublicKey(process.env.NEXT_PUBLIC_CANDY_MACHINE_ADDRESS?? '')
            })
            .run()
            .then(setCandyMachine)
            .catch(console.error)
    }, [metaplex])

    const handlerClick: MouseEventHandler<HTMLButtonElement> = useCallback(async event => {
        if (event.defaultPrevented) return

        if (!walletAdapter.connected || !candyMachine) return

        try {
            setIsMinting(true)
            const nft = await metaplex.candyMachines().mint({candyMachine}).run()

            console.log('candyMachine', nft)
            router.push(`/newMint?mint=${nft.nft.address.toBase58()}` )
        } catch (err) {
            console.error(err)
        } finally {
            setIsMinting(false)
        }
    }, [metaplex, walletAdapter, candyMachine, router])
    return (
        <VStack spacing={20}>
            <Container>
                <HStack spacing={8}>
                    <Heading
                        color="white"
                        as="h1"
                        size="2xl"
                        noOfLines={1}
                        textAlign="center"
                    >
                        <Text color="bodyText" fontSize="xl" textAlign="center" noOfLines={3}>
                            Each Treasure Hunter is randomly generated and can be used to seek
                            <Text as="b">Treasures</Text>. Use your <Text as="b">Treasure</Text> to get <Text as="b">$LBT</Text>.
                        </Text>
                    </Heading>
                </HStack>
            </Container>
            <HStack spacing={10}>
                <Image src="Avatar1.jpg" alt="hunter 1" />
                <Image src="Avatar2.jpg" alt="hunter 2" />
                <Image src="Avatar3.jpg" alt="hunter 3" />
                <Image src="Avatar4.jpg" alt="hunter 4" />
                <Image src="Avatar5.jpg" alt="hunter 5" />
                <Image src="Avatar6.jpg" alt="hunter 6" />
            </HStack>
            <Button bgColor="accent" color="white" maxW="380px" isLoading={isMinting} onClick={handlerClick}>
                <Text>Mint your Treasure Hunter</Text>
            </Button>
        </VStack>
    )
}

export default Connected