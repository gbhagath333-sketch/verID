export const CONTRACT_ADDRESS =
  "0x3E1FFce6eE152454A0c50BC21f78d5F607D8421B";

export const SEPOLIA_CHAIN_ID = 11155111;

export const CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "recordId",
        type: "string",
      },
      {
        internalType: "string",
        name: "documentHash",
        type: "string",
      },
    ],
    name: "registerRecord",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "recordId",
        type: "string",
      },
      {
        internalType: "string",
        name: "documentHash",
        type: "string",
      },
    ],
    name: "verifyRecord",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
