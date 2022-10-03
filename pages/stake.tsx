import { useEffect, useState } from "react";
import type { NextPage } from "next";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import {
  Metaplex,
  walletAdapterIdentity,
  NftWithToken,
} from "@metaplex-foundation/js";
import {
  Box,
  Container,
  Flex,
  Heading,
  VStack,
  Text,
  Image,
  Button,
  HStack,
} from "@chakra-ui/react";

import MainLayout from "../components/MainLayout";
import TreasureHunter from "../components/TreasureHunter";
import StakeCard from "../components/StakeCard";
import Gear from "../components/Gear";
import LootBox from "../components/LootBox";

interface StakeProps {
  mint: PublicKey;
  imageSrc: string;
}

const Stake: NextPage<StakeProps> = ({ mint, imageSrc }) => {
  const [isStaking, setIsStaking] = useState(false);
  const [level, setLevel] = useState(1);
  const [nftData, setNftData] = useState<NftWithToken | null>(null);

  const { connection } = useConnection();
  const walletAdapter = useWallet();

  useEffect(() => {
    const metaplex = Metaplex.make(connection).use(
      walletAdapterIdentity(walletAdapter)
    );

    metaplex
      .nfts()
      .findByMint({ mintAddress: mint })
      .run()
      .then((nft) => setNftData(nft as NftWithToken));
  }, [walletAdapter, connection, mint]);
  return (
    <MainLayout>
      <VStack spacing={7} justify="flex-start" align="flex-start">
        <Heading color="white" as="h1" size="2xl">
          Level up your treasure hunter
        </Heading>
        <Text color="bodyText" fontSize="xl" textAlign="start" maxWidth="600px">
          Stake your treasure hunter to earn 10 $LBT per day to get access to a
          randomized loot box full of upgrades for your hunter.
        </Text>

        <HStack spacing={20} alignItems="flex-start">
          <TreasureHunter
            imgUrl={imageSrc}
            description="pirate"
            isStaking={isStaking}
            level={level}
          />
          <VStack alignItems="flex-start" spacing={10}>
            <HStack alignItems="flex-start">
              <StakeCard
                totalEarned={30}
                isStaked={false}
                daysStaked={4}
                claimable={15}
                nftData={nftData}
              />
            </HStack>
            <HStack>
              <VStack alignItems="flex-start" spacing={10}>
                <Text color="white" fontSize="2xl" as="b">
                  Gear
                </Text>
                <HStack alignItems="flex-start">
                  <Gear imgUrl="sword.png" description="10xp" />
                  <Gear imgUrl="pistol.jpg" description="15xp" />
                </HStack>
              </VStack>
              <VStack alignItems="flex-start" spacing={10}>
                <Text color="white" fontSize="2xl" as="b">
                  Loot Boxes
                </Text>
                <HStack>
                  <LootBox label="10 $LBT" state="available" />
                  <LootBox label="10 $LBT" state="claimed" />
                  <LootBox label="50 $LBT" state="available" />
                </HStack>
              </VStack>
            </HStack>
          </VStack>
        </HStack>
      </VStack>
    </MainLayout>
  );
};

Stake.getInitialProps = async ({ query: { mint, imageSrc } }: any) => {
  if (!mint) throw { error: "No mint" };
  if (!imageSrc) throw { error: "No image" };

  const mintPubKey = new PublicKey(mint);

  return { mint: mintPubKey, imageSrc };
};

export default Stake;
