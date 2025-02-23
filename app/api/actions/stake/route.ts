import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
} from "@solana/actions";
import { Connection, PublicKey } from "@solana/web3.js";

import BN from "bn.js";

import { getLamports, headers } from "../../utils";
import { Marinade } from "../../marinade";

const RPC_URL: string =
  process.env.RPC_URL || "https://api.mainnet-beta.solana.com";

const connection = new Connection(RPC_URL);
const marinade = new Marinade(connection);

// OPTIONS endpoint is required for CORS preflight requests
// Your Blink won't render if you don't add this
export const OPTIONS = async () => {
  return new Response(null, { headers });
};

// GET endpoint returns the Blink metadata (JSON) and UI configuration
export const GET = async (req: Request) => {
  // This JSON is used to render the Blink UI
  const response: ActionGetResponse = {
    type: "action",
    icon: "https://cdn.prod.website-files.com/664c7876d83b34499b5688a0/67853bedb536a760cc18cdc8_illustration-psr-short.svg",
    label: "Stake 100%",
    title: "Stake SOL",
    description:
      "Stake SOL with Marinade to earn yield. Choose a percent of your SOL, or enter a custom amount.",
    // Links is used if you have multiple actions or if you need more than one params
    links: {
      actions: [
        {
          // Defines this as a blockchain transaction
          type: "transaction",
          label: "25%",
          // This is the endpoint for the POST request
          href: `/api/actions/stake?percent=25`,
        },
        {
          type: "transaction",
          label: "50%",
          href: `/api/actions/stake?percent=50`,
        },
        {
          type: "transaction",
          label: "100%",
          href: `/api/actions/stake?percent=100`,
        },
        {
          // Example for a custom input field
          type: "transaction",
          href: `/api/actions/stake?amount={amount}`,
          label: "Stake",
          parameters: [
            {
              name: "amount",
              label: "Enter a SOL amount",
              type: "number",
            },
          ],
        },
      ],
    },
  };

  // Return the response with proper headers
  return new Response(JSON.stringify(response), {
    status: 200,
    headers,
  });
};

// POST endpoint handles the actual transaction creation
export const POST = async (req: Request) => {
  const request: ActionPostRequest = await req.json();

  let pubkey: PublicKey;
  try {
    pubkey = new PublicKey(request.account);
  } catch (e) {
    // If not a valid pubkey, throw error. TODO: Return error type for blinks.
    return new Response(
      JSON.stringify({
        error: `Invalid wallet address: ${request.account}. Please provide a valid wallet public key as the account in your POST request.`,
      }),
      {
        status: 500, // TODO: Determine correct error type.
        headers,
      },
    );
  }
  // Step 1: Extract parameters, prepare data
  const url = new URL(req.url);
  const percent = Number(url.searchParams.get("percent"));
  const amount = Number(url.searchParams.get("amount"));

  const balance = await connection.getBalance(pubkey);

  let lamports: BN;
  try {
    lamports = await getLamports(connection, amount, percent, balance);
  } catch (e: any) {
    return new Response(
      JSON.stringify({
        error: e.message,
      }),
      {
        status: 500, // TODO: Determine correct error type.
        headers,
      },
    );
  }

  const tx = await marinade.stake(pubkey, lamports);
  const response: ActionPostResponse = {
    type: "transaction",
    transaction: Buffer.from(tx.serialize()).toString("base64"),
  };

  return Response.json(response, { status: 200, headers });
};
