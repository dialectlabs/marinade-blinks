// imports related to the blink
import { BLOCKCHAIN_IDS } from "@solana/actions";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import BN from "bn.js";

// Set standardized headers for Blink Providers
export const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, x-blockchain-ids, x-action-version",
  "Content-Type": "application/json",
  "x-blockchain-ids": `${[BLOCKCHAIN_IDS.mainnet]}`,
  "x-action-version": "2.4",
};

export async function getLamports(
  connection: Connection,
  amount: number,
  percent: number,
  balance: number,
): Promise<BN> {
  // If neither are set, throw error. TODO: Return error type for blinks.
  if (percent <= 0 && amount <= 0)
    throw new Error(
      "Please specify an amount of SOL, or a percent of your SOL wallet balance, to stake.",
    );

  // If both are set, throw error. TODO: Return error type for blinks.
  if (percent > 0 && amount > 0)
    throw new Error(
      "Both an amount of SOL, and a percent of your wallet's SOL were provided. Please set only one.",
    );

  const lamports =
    percent > 0
      ? new BN((percent / 100) * balance)
      : new BN(amount * LAMPORTS_PER_SOL);
  if (lamports.gt(new BN(balance))) throw new Error("Insufficient funds.");
  return lamports;
}
