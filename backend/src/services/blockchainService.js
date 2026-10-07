const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');

let provider;
let wallet;
let contract;

/**
 * Initializes and returns the ethers Contract instance.
 */
function getContract() {
  if (contract) return contract;

  const rpcUrl = process.env.RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!rpcUrl) {
    throw new Error('RPC_URL environment variable is missing');
  }
  if (!privateKey) {
    throw new Error('PRIVATE_KEY environment variable is missing');
  }
  if (!contractAddress) {
    throw new Error('CONTRACT_ADDRESS environment variable is missing');
  }

  // Load ABI from local JSON artifact
  const artifactPath = path.join(__dirname, '..', 'blockchain', 'RecordVerification.json');
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Contract artifact file not found at ${artifactPath}`);
  }

  const artifactContent = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const abi = artifactContent.abi;

  provider = new ethers.JsonRpcProvider(rpcUrl);
  wallet = new ethers.Wallet(privateKey, provider);
  contract = new ethers.Contract(contractAddress, abi, wallet);

  return contract;
}

/**
 * Tests connection to the blockchain node.
 */
async function checkBlockchainConnection() {
  try {
    const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) {
      return { connected: false, message: 'RPC_URL not configured' };
    }
    const tempProvider = new ethers.JsonRpcProvider(rpcUrl);
    const blockNumber = await tempProvider.getBlockNumber();
    const network = await tempProvider.getNetwork();
    return {
      connected: true,
      chainId: network.chainId.toString(),
      blockNumber: blockNumber
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
}

/**
 * Registers a document record on the blockchain.
 * @param {string} recordId
 * @param {string} documentHash
 */
async function registerRecordOnChain(recordId, documentHash) {
  const contractInstance = getContract();
  
  // 1. Pre-check if record already exists on blockchain
  try {
    const existing = await contractInstance.getRecord(recordId);
    if (existing && existing[4] === true) {
      const err = new Error('Record ID already exists on blockchain');
      err.statusCode = 400;
      throw err;
    }
  } catch (err) {
    if (err.statusCode === 400) throw err;
    // Ignore other view errors and proceed
  }

  // 2. Broadcast transaction
  try {
    const tx = await contractInstance.registerRecord(recordId, documentHash);
    const receipt = await tx.wait();
    return {
      transactionHash: receipt.hash || tx.hash
    };
  } catch (error) {
    if (error.statusCode) throw error;
    // Handle duplicate record or contract revert error
    if (error.reason && error.reason.includes('Record already exists')) {
      const err = new Error('Record ID already exists on blockchain');
      err.statusCode = 400;
      throw err;
    }
    if (error.message && error.message.includes('Record already exists')) {
      const err = new Error('Record ID already exists on blockchain');
      err.statusCode = 400;
      throw err;
    }
    throw error;
  }
}

/**
 * Verifies a document hash against stored blockchain record.
 * @param {string} recordId
 * @param {string} documentHash
 * @returns {Promise<boolean>}
 */
async function verifyRecordOnChain(recordId, documentHash) {
  const contractInstance = getContract();
  const isAuthentic = await contractInstance.verifyRecord(recordId, documentHash);
  return Boolean(isAuthentic);
}

/**
 * Retrieves record metadata from blockchain.
 * @param {string} recordId
 */
async function getRecordFromChain(recordId) {
  const contractInstance = getContract();
  const result = await contractInstance.getRecord(recordId);

  // Result array: [recordId, documentHash, issuer, timestamp, exists]
  const [storedRecordId, documentHash, issuer, timestamp, exists] = result;

  if (!exists) {
    const err = new Error('Record not found');
    err.statusCode = 404;
    throw err;
  }

  return {
    recordId: storedRecordId,
    documentHash: documentHash,
    issuer: issuer,
    timestamp: timestamp.toString()
  };
}

module.exports = {
  checkBlockchainConnection,
  registerRecordOnChain,
  verifyRecordOnChain,
  getRecordFromChain
};
