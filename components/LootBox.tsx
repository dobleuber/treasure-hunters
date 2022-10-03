import {FC} from 'react'

interface LootBoxProps {
    label: string
    state: 'claimed' | 'available'
}

import { Container, VStack, Text, Image} from '@chakra-ui/react'

const LootBox: FC<LootBoxProps> = ({label, state}) => {
    return (
        <Container bg={state === 'claimed' ? 'gray.600' : 'green.400'} w={100} h={100} borderRadius="10px" >
            <VStack align="center" justify="center">
                <Text color="bodyText" fontSize="xl" textAlign="center">
                    {label}
                </Text>
                {
                    state === 'claimed' && <Text color="bodyText" >Claimed</Text>
                }
            </VStack>
        </Container>
    )
}

export default LootBox