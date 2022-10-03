import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
  findMetadataPda,
} from "@metaplex-foundation/js";

import {
  DataV2,
  createCreateMetadataAccountV2Instruction,
} from "@metaplex-foundation/mpl-token-metadata";

import * as fs from "fs";

import { initializeKeypair } from "./initializeKeypair";

async function createNewMint(
  connection: web3.Connection,
  payer: web3.Keypair,
  mintAuthority: web3.PublicKey,
  freezeAuthority: web3.PublicKey,
  decimals: number
) {
  const tokenMint = await token.createMint(
    connection,
    payer,
    mintAuthority,
    freezeAuthority,
    decimals
  );

  console.log(
    `Token mint: https://explorer.solana.com/address/${tokenMint}?cluster=devnet`
  );

  return tokenMint;
}

async function createTokenAccount(
  connection: web3.Connection,
  payer: web3.Keypair,
  mint: web3.PublicKey,
  owner: web3.PublicKey
) {
  const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    owner
  );

  console.log(
    `Token account: https://explorer.solana.com/address/${tokenAccount.address}?cluster=devnet`
  );

  return tokenAccount;
}

async function createMetadata(
  connection: web3.Connection,
  metaplex: Metaplex,
  mint: web3.PublicKey,
  user: web3.Keypair,
  name: string,
  symbol: string,
  description: string,
  filePath: string,
  fileName: string,
  mintAuth: web3.PublicKey
) {
  const buffer = fs.readFileSync(filePath);

  const file = toMetaplexFile(buffer, fileName);

  const imageUri = await metaplex.storage().upload(file);
  console.log("Image uploaded to:", imageUri);

  const { uri } = await metaplex
    .nfts()
    .uploadMetadata({
      name,
      description,
      image: imageUri,
    })
    .run();

  console.log("metadata uri:", uri);

  const metadataPDA = await findMetadataPda(mint);
  const tokenMetadata: DataV2 = {
    name,
    symbol,
    uri,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  };

  const instruction = createCreateMetadataAccountV2Instruction(
    {
      metadata: metadataPDA,
      mint,
      mintAuthority: user.publicKey,
      payer: user.publicKey,
      updateAuthority: user.publicKey,
    },
    {
      createMetadataAccountArgsV2: {
        data: tokenMetadata,
        isMutable: true,
      },
    }
  );

  const transaction = new web3.Transaction();
  transaction.add(instruction);

  const transactionSignature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [user]
  );

  console.log(
    `Create Metadata Account: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  );

  await token.setAuthority(
    connection,
    user,
    mint,
    user.publicKey,
    token.AuthorityType.MintTokens,
    mintAuth
  )

  fs.writeFileSync(
    "tokens/lbt/cache.json",
    JSON.stringify({
      mint: mint.toBase58(),
      imageUri,
      metadataUri: uri,
      tokenMetadata: metadataPDA.toBase58(),
      metadataTransaction: transactionSignature,
    })
  );
}

async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  const user = await initializeKeypair(connection);
  const programId = new web3.PublicKey("6kgHXUbdoV9KsWwN7esiaBGZiP52F7R2NC3D9FqjhQZB");

  console.log("PublicKey:", user.publicKey.toBase58());
  const [minAuth] = await web3.PublicKey.findProgramAddress([Buffer.from("mint")], programId)

  const mint = await createNewMint(
    connection,
    user,
    user.publicKey,
    user.publicKey,
    2
  );

  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      })
    );

  await createMetadata(
    connection,
    metaplex,
    mint,
    user,
    "Loot Box Token",
    "$LBT",
    "Loot box tokens, as like any pay to win game.",
    "tokens/lbt/assets/chest.png",
    "chest.png",
    minAuth
  );

  const tokenAccount = await createTokenAccount(
    connection,
    user,
    mint,
    user.publicKey
  );
}

main()
  .then(() => {
    console.log("Finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
