import { FC, MouseEventHandler, useCallback, } from 'react'
import {Button, Container, Heading, VStack, HStack, Text} from '@chakra-ui/react'
import {useWalletModal} from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'


const Disconnected: FC = () => {
    const modalState = useWalletModal()
    const {wallet, connect} = useWallet()

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
        (event) => {
            if (event.defaultPrevented) return

            if (!wallet) {
                modalState.setVisible(true)
            } else {
                connect().catch(() => {})
            }
        }, [wallet, modalState, connect]
    )
    return (
        <Container>
            <VStack spacing={20} alignContent="center">
                <Heading
                    color="green"
                    as="h1"
                    size="3xl"
                    noOfLines={3}
                    textAlign="center"
                >
                    Mint your hunter. Seek Treasures. Earn Gold.
                </Heading>
                <Button
                    bgColor="accent"
                    color="white"
                    maxW="380px"
                    onClick={handleClick}
                >
                    <HStack>
                        <Text>Become a Treasure Hunter</Text>
                    </HStack>
                </Button>
            </VStack>
        </Container>
    )
}

export default Disconnected