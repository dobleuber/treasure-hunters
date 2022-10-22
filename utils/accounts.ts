import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "./constants";

import { Program } from "@project-serum/anchor";
import { AnchorTreasureHunters } from "./anchor_treasure_hunters";

export async function getStakeAccount(
  program: Program<AnchorTreasureHunters>,
  user: PublicKey,
  tokenAccount: PublicKey
): Promise<any> {
  const [accountPubkey] = PublicKey.findProgramAddressSync(
    [user.toBuffer(), tokenAccount.toBuffer()],
    PROGRAM_ID
  );
  const [pda] = PublicKey.findProgramAddressSync(
    [user.toBuffer()!, tokenAccount?.toBuffer()!],
    program?.programId!
  );

  return await program?.account.userStakeInfo.fetch(pda);
}
