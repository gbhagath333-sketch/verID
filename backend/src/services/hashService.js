const crypto = require('crypto');

/**
 * Calculates SHA-256 hash from complete raw file buffer.
 * Does not alter, convert, resize, or compress file bytes.
 * @param {Buffer} buffer - File buffer
 * @returns {string} - SHA-256 hash prefixed with '0x'
 */
function calculateFileHash(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Invalid file buffer provided for hashing');
  }
  const hexHash = crypto.createHash('sha256').update(buffer).digest('hex');
  return `0x${hexHash}`;
}

module.exports = {
  calculateFileHash
};
