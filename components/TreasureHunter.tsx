import { FC } from "react";

interface TreasureHunterProps {
  imgUrl: string;
  description: string;
  isStaking: boolean;
  level: number;
}

import { Container, VStack, Text, Image, Flex, Center } from "@chakra-ui/react";

const TreasureHunter: FC<TreasureHunterProps> = ({
  imgUrl,
  description,
  isStaking,
  level
}) => {
  return (
    <VStack align="flex-start" minWidth={200}>
      <Flex direction="column">
        <Image src={imgUrl} alt={description} />
        <Center
          bgColor="secondaryPurple"
          borderRadius="0 0 8px 8px"
          marginTop="-8px"
          zIndex={2}
          height="32px"
        >
          <Text color="white" as="b" fontSize="md" w="100px" textAlign="center" textTransform="uppercase">
            {isStaking ? 'staking': 'unstaked'}
          </Text>
        </Center>
      </Flex>
      <Text fontSize="2xl" as="b" color="white">
        Level {level}
      </Text>
    </VStack>
  );
};

export default TreasureHunter;
