import React, { FC, useCallback, useEffect, useState } from "react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { NftWithToken } from "@metaplex-foundation/js";
import { PROGRAM_ID as METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";

import { VStack, Text, Button } from "@chakra-ui/react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { getStakeAccount } from "../utils/accounts";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { STAKE_MINT } from "../utils/constants";
import { useWorkspace } from "./WorkspaceProvider";

interface StakeCardProps {
  daysStaked: number;
  isStaked: boolean;
  totalEarned: number;
  claimable: number;
  nftData: NftWithToken | null;
}

const StakeCard: FC<StakeCardProps> = ({
  daysStaked,
  isStaked,
  totalEarned,
  claimable,
  nftData,
}) => {
  const [isStaking, setIsStaking] = useState(isStaked);
  const [nftTokenAccount, setNftTokenAccount] = useState<PublicKey>();
  const walletAdapter = useWallet();
  const { connection } = useConnection();
  const workspace = useWorkspace();

  const checkStakingStatus = useCallback(async () => {
    if (!walletAdapter.publicKey || !nftTokenAccount || !workspace.program)
      return;
    const account = await getStakeAccount(
      workspace.program,
      walletAdapter.publicKey,
      nftTokenAccount
    );

    setIsStaking(account.state === 0);
  }, [walletAdapter, nftTokenAccount, workspace]);

  useEffect(() => {
    checkStakingStatus();

    if (nftData) {
      connection
        .getTokenLargestAccounts(nftData.mint.address)
        .then((accounts) => setNftTokenAccount(accounts.value[0].address))
        .catch(console.error);
    }
  }, [
    checkStakingStatus,
    nftData,
    nftData?.mint.address,
    walletAdapter,
    connection,
  ]);

  const sendAndConfirmTransaction = useCallback(
    async (transaction: Transaction) => {
      try {
        const signature = await walletAdapter.sendTransaction(
          transaction,
          connection
        );
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();

        await connection.confirmTransaction(
          {
            blockhash,
            lastValidBlockHeight,
            signature,
          },
          "finalized"
        );
      } catch (err) {
        console.error(err);
        throw err;
      }

      await checkStakingStatus();
    },
    [connection, checkStakingStatus, walletAdapter]
  );

  const handleStake = useCallback(async () => {
    if (
      !walletAdapter.connected ||
      !walletAdapter.publicKey ||
      !nftData ||
      !nftTokenAccount ||
      !workspace.program
    ) {
      alert("Please Connect your wallet");
      return;
    }

    const transaction = new Transaction().add(
      await workspace.program.methods
        .stake()
        .accounts({
          nftTokenAccount,
          nftMint: nftData.mint.address,
          nftEdition: nftData.edition.address,
          metadataProgram: METADATA_PROGRAM_ID,
        })
        .instruction()
    );

    await sendAndConfirmTransaction(transaction);
  }, [
    walletAdapter,
    nftData,
    sendAndConfirmTransaction,
    nftTokenAccount,
    workspace,
  ]);

  const handleClaim = useCallback(async () => {
    if (
      !walletAdapter.connected ||
      !walletAdapter.publicKey ||
      !nftData ||
      !nftTokenAccount ||
      !workspace.program
    ) {
      alert("Please Connect your wallet");
      return;
    }

    const userStakeATA = await getAssociatedTokenAddress(
      STAKE_MINT,
      walletAdapter.publicKey
    );

    const transaction = new Transaction().add(
      await workspace.program.methods
        .redeem()
        .accounts({
          nftTokenAccount,
          stakeMint: STAKE_MINT,
          userStakeAta: userStakeATA,
        })
        .instruction()
    );

    await sendAndConfirmTransaction(transaction);
  }, [
    walletAdapter,
    nftData,
    sendAndConfirmTransaction,
    nftTokenAccount,
    workspace.program,
  ]);

  const handleUnstake = useCallback(async () => {
    if (
      !walletAdapter.connected ||
      !walletAdapter.publicKey ||
      !nftData ||
      !nftTokenAccount ||
      !workspace.program
    ) {
      alert("Please Connect your wallet");
      return;
    }

    const userStakeATA = await getAssociatedTokenAddress(
      STAKE_MINT,
      walletAdapter.publicKey
    );

    const transaction = new Transaction().add(
      await workspace.program.methods
        .unstake()
        .accounts({
          nftTokenAccount,
          nftMint: nftData.mint.address,
          nftEdition: nftData.edition.address,
          metadataProgram: METADATA_PROGRAM_ID,
          stakeMint: STAKE_MINT,
          userStakeAta: userStakeATA,
        })
        .instruction()
    );

    await sendAndConfirmTransaction(transaction);
  }, [
    walletAdapter,
    nftData,
    sendAndConfirmTransaction,
    nftTokenAccount,
    workspace.program,
  ]);

  return (
    <VStack
      bgColor="containerBg"
      borderRadius="20px"
      padding="20px 40px"
      spacing={5}
    >
      <Text
        bgColor="containerBgSecondary"
        padding="4px 8px"
        borderRadius="20px"
        color="bodyText"
        as="b"
        fontSize="sm"
        textTransform="uppercase"
      >
        {isStaking
          ? `Staking ${daysStaked} day${daysStaked === 1 ? "" : "s"}`
          : "Ready to Stake"}
      </Text>
      <VStack spacing={-1}>
        <Text color="white" as="b" fontSize="4xl">
          {isStaking ? `${totalEarned} $LBT` : "0 $LBT"}
        </Text>
        <Text color="bodyText" textTransform="capitalize">
          {isStaking ? `${claimable} $LBT earned` : "earn $LBT by staking"}
        </Text>
      </VStack>
      <Button
        bgColor="buttonGreen"
        width="200px"
        onClick={isStaking ? handleClaim : handleStake}
      >
        <Text as="b" textTransform="capitalize">
          {isStaking ? "claim $LBT" : "stake hunter"}
        </Text>
      </Button>
      {isStaking && (
        <Button width="200px" onClick={handleUnstake}>
          Unstake
        </Button>
      )}
    </VStack>
  );
};

export default StakeCard;
