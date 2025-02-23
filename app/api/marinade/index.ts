import {
  NativeStakingConfig,
  NativeStakingSDK,
} from "@marinade.finance/native-staking-sdk";
import {
  Connection,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
  PublicKey,
} from "@solana/web3.js";
import BN from "bn.js";

export class Marinade {
  connection: Connection;
  sdk: NativeStakingSDK;

  constructor(connection: Connection) {
    const config = new NativeStakingConfig({ connection });
    const sdk = new NativeStakingSDK(config);

    this.connection = connection;
    this.sdk = sdk;
  }

  public async stake(
    pubkey: PublicKey,
    lamports: BN,
  ): Promise<VersionedTransaction> {
    // Get the wallet balance https://solana.com/developers/cookbook/accounts/get-account-balance
    const balance = await this.connection.getBalance(pubkey);
    const { createAuthorizedStake, stakeKeypair } =
      this.sdk.buildCreateAuthorizedStakeInstructions(pubkey, lamports);

    const { blockhash } = await this.connection.getLatestBlockhash();
    const tx = new VersionedTransaction(
      new TransactionMessage({
        payerKey: pubkey,
        recentBlockhash: blockhash,
        instructions: createAuthorizedStake,
      }).compileToV0Message(),
    );
    return tx;
  }
}
