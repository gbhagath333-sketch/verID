const { calculateFileHash } = require('../services/hashService');
const {
  registerRecordOnChain,
  verifyRecordOnChain,
  getRecordFromChain,
  checkBlockchainConnection
} = require('../services/blockchainService');

/**
 * GET /api/health
 * Returns health status of the backend.
 */
async function healthCheck(req, res, next) {
  try {
    const chainStatus = await checkBlockchainConnection();
    res.status(200).json({
      success: true,
      message: 'Backend is running',
      blockchain: chainStatus
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      message: 'Backend is running',
      blockchain: { connected: false, error: error.message }
    });
  }
}

/**
 * POST /api/register
 * Accepts recordId and file via multipart/form-data.
 * Hashes file, registers record on blockchain.
 */
async function registerRecord(req, res, next) {
  try {
    const { recordId } = req.body;
    const file = req.file;

    if (!recordId || typeof recordId !== 'string' || recordId.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'recordId field is required'
      });
    }

    if (!file || !file.buffer) {
      return res.status(400).json({
        success: false,
        error: 'file field is required'
      });
    }

    const trimmedRecordId = recordId.trim();

    // 1. Calculate SHA-256 hash of raw file bytes
    const documentHash = calculateFileHash(file.buffer);

    // 2. Register on blockchain
    const { transactionHash } = await registerRecordOnChain(trimmedRecordId, documentHash);

    // 3. Clean success response as required
    res.status(201).json({
      success: true,
      recordId: trimmedRecordId,
      documentHash: documentHash,
      transactionHash: transactionHash
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/verify
 * Accepts recordId and file via multipart/form-data.
 * Hashes file, verifies against blockchain.
 */
async function verifyRecord(req, res, next) {
  try {
    const { recordId } = req.body;
    const file = req.file;

    if (!recordId || typeof recordId !== 'string' || recordId.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'recordId field is required'
      });
    }

    if (!file || !file.buffer) {
      return res.status(400).json({
        success: false,
        error: 'file field is required'
      });
    }

    const trimmedRecordId = recordId.trim();

    // 1. Calculate SHA-256 hash of uploaded file
    const documentHash = calculateFileHash(file.buffer);

    // 2. Call verifyRecord on smart contract
    const authentic = await verifyRecordOnChain(trimmedRecordId, documentHash);

    res.status(200).json({
      success: true,
      authentic: authentic,
      recordId: trimmedRecordId,
      documentHash: documentHash
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/record/:recordId
 * Fetches record details from blockchain by record ID.
 */
async function getRecord(req, res, next) {
  try {
    const { recordId } = req.params;

    if (!recordId || recordId.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'recordId path parameter is required'
      });
    }

    const trimmedRecordId = recordId.trim();
    const recordData = await getRecordFromChain(trimmedRecordId);

    res.status(200).json({
      success: true,
      recordId: recordData.recordId,
      documentHash: recordData.documentHash,
      issuer: recordData.issuer,
      timestamp: recordData.timestamp
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  healthCheck,
  registerRecord,
  verifyRecord,
  getRecord
};
