import {FC} from 'react'

interface GearProps {
    imgUrl: string
    description: string
}

import { Box, VStack, Text, Image} from '@chakra-ui/react'

const Gear: FC<GearProps> = ({imgUrl, description}) => {
    return (
        <Box borderRadius="10px" bg="gray.500" padding="10px">
            <VStack spacing={2}>
                <Image src={imgUrl} alt={description} h="100px" w="100px"/>
                <Text color="black" fontSize="l" textAlign="center">
                    {description}
                </Text>
            </VStack>
        </Box>
    )
}

export default Gear