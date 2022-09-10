import { FC } from 'react'
import {Container, Heading, VStack, HStack, Text, Image, Button} from '@chakra-ui/react'



const Connected: FC = () => {
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
                            <Text as="b">Treasures</Text>. Use your <Text as="b">Treasure</Text> to get <Text as="b">$Gold</Text>.
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
            <Button bgColor="accent" color="white" maxW="380px">
                <Text>Mint your Treasure Hunter</Text>
            </Button>
        </VStack>
    )
}

export default Connected