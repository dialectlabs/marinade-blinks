import { ActionGetResponse, BLOCKCHAIN_IDS } from "@solana/actions";

// Set standardized headers for Blink Providers
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, x-blockchain-ids, x-action-version",
  "Content-Type": "application/json",
  "x-blockchain-ids": `${[BLOCKCHAIN_IDS.mainnet]}`,
  "x-action-version": "2.4",
};

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
