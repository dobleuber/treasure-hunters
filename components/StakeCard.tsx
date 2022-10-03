import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import * as web3 from "@solana/web3.js";
import { NftWithToken } from "@metaplex-foundation/js";
import { PROGRAM_ID as METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";

import { VStack, Text, Button } from "@chakra-ui/react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  createStakingInstruction,
  createRedeemInstruction,
  createUnstakeInstruction,
  createInitializeStakeAccountInstruction,
} from "../utils/instructions";
import { getStakeAccount } from "../utils/accounts";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { PROGRAM_ID, STAKE_MINT } from "../utils/constants";

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
  const [nftTokenAccount, setNftTokenAccount] = useState<web3.PublicKey>();
  const walletAdapter = useWallet();
  const { connection } = useConnection();

  const checkStakingStatus = useCallback(async () => {
    if (!walletAdapter.publicKey || !nftTokenAccount) return;
    const account = await getStakeAccount(
      connection,
      walletAdapter.publicKey,
      nftTokenAccount
    );

    setIsStaking(account.state === 0);
  }, [connection, walletAdapter, nftTokenAccount]);

  useEffect(() => {
    checkStakingStatus();

    if (nftData) {
      connection
        .getTokenLargestAccounts(nftData.mint.address)
        .then((accounts) => setNftTokenAccount(accounts.value[0].address));
    }
  }, [checkStakingStatus, nftData, walletAdapter, connection]);

  const sendAndConfirmTransaction = useCallback(
    async (transaction: web3.Transaction) => {
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
      !nftTokenAccount
    ) {
      alert("Please Connect your wallet");
      return;
    }

    const [stakeAccount] = web3.PublicKey.findProgramAddressSync(
      [walletAdapter.publicKey.toBuffer(), nftTokenAccount.toBuffer()],
      PROGRAM_ID
    );

    const transaction = new web3.Transaction();

    const account = await connection.getAccountInfo(stakeAccount);

    if (!account) {
      transaction.add(
        createInitializeStakeAccountInstruction(
          walletAdapter.publicKey,
          nftTokenAccount,
          PROGRAM_ID
        )
      );
    }

    const stakeInstruction = createStakingInstruction(
      walletAdapter.publicKey,
      nftTokenAccount,
      nftData.mint.address,
      nftData.edition.address,
      TOKEN_PROGRAM_ID,
      METADATA_PROGRAM_ID,
      PROGRAM_ID
    );

    transaction.add(stakeInstruction);
    await sendAndConfirmTransaction(transaction);
  }, [
    walletAdapter,
    connection,
    nftData,
    sendAndConfirmTransaction,
    nftTokenAccount,
  ]);

  const handleClaim = useCallback(async () => {
    if (
      !walletAdapter.connected ||
      !walletAdapter.publicKey ||
      !nftData ||
      !nftTokenAccount
    ) {
      alert("Please Connect your wallet");
      return;
    }

    const userStakeATA = await getAssociatedTokenAddress(
      STAKE_MINT,
      walletAdapter.publicKey
    );

    const account = await connection.getAccountInfo(userStakeATA);

    const transaction = new web3.Transaction();

    if (!account) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          walletAdapter.publicKey,
          userStakeATA,
          walletAdapter.publicKey,
          STAKE_MINT
        )
      );
    }

    transaction.add(
      createRedeemInstruction(
        walletAdapter.publicKey,
        nftTokenAccount,
        nftData.mint.address,
        userStakeATA,
        TOKEN_PROGRAM_ID,
        PROGRAM_ID
      )
    );

    await sendAndConfirmTransaction(transaction);
  }, [
    walletAdapter,
    connection,
    nftData,
    sendAndConfirmTransaction,
    nftTokenAccount,
  ]);

  const handleUnstake = useCallback(async () => {
    if (
      !walletAdapter.connected ||
      !walletAdapter.publicKey ||
      !nftData ||
      !nftTokenAccount
    ) {
      alert("Please Connect your wallet");
      return;
    }

    const userStakeATA = await getAssociatedTokenAddress(
      STAKE_MINT,
      walletAdapter.publicKey
    );

    const account = await connection.getAccountInfo(userStakeATA);

    const transaction = new web3.Transaction();

    if (!account) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          walletAdapter.publicKey,
          userStakeATA,
          walletAdapter.publicKey,
          STAKE_MINT
        )
      );
    }

    transaction.add(
      createUnstakeInstruction(
        walletAdapter.publicKey,
        nftTokenAccount,
        nftData.mint.address,
        nftData.edition.address,
        STAKE_MINT,
        userStakeATA,
        TOKEN_PROGRAM_ID,
        METADATA_PROGRAM_ID,
        PROGRAM_ID
      )
    );

    await sendAndConfirmTransaction(transaction);
  }, [
    walletAdapter,
    connection,
    nftData,
    sendAndConfirmTransaction,
    nftTokenAccount,
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
