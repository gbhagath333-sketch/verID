// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

/**
 * @title RecordVerification
 * @dev Tamper-proof document hash verification on the blockchain.
 * Stores only cryptographic SHA-256 hashes and metadata, never raw files.
 */
contract RecordVerification {
    // Structure holding record details
  

    // Mapping to store records by unique record ID
    mapping(string => Record) private records;

    // Event emitted when a new record is registered
    event RecordRegistered(
        string recordId,
        string documentHash,
        address indexed issuer,
        uint256 timestamp
    );

    /**
     * @notice Registers a new document hash on the blockchain.
     * @param recordId Unique identifier for the document record.
     * @param documentHash Cryptographic SHA-256 hash of the document.
     */
    function registerRecord(string memory recordId, string memory documentHash) external {
        require(bytes(recordId).length > 0, "Record ID cannot be empty");
        require(bytes(documentHash).length > 0, "Document hash cannot be empty");
        require(!records[recordId].exists, "Record already exists");

        records[recordId] = Record({
            recordId: recordId,
            documentHash: documentHash,
            issuer: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        emit RecordRegistered(recordId, documentHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Verifies if a given document hash matches the record on the blockchain.
     * @param recordId Unique identifier for the document record.
     * @param documentHash Cryptographic hash to verify.
     * @return True if record exists and hash matches; false otherwise.
     */
    function verifyRecord(string memory recordId, string memory documentHash) external view returns (bool) {
        if (!records[recordId].exists) {
            return false;
        }
        return keccak256(bytes(records[recordId].documentHash)) == keccak256(bytes(documentHash));
    }

    /**
     * @notice Retrieves stored record information for a given record ID.
     * @param recordId Unique identifier for the document record.
     * @return recordId Stored record ID.
     * @return documentHash Stored cryptographic hash.
     * @return issuer Wallet address that registered the record.
     * @return timestamp Block timestamp when the record was registered.
     * @return exists True if the record exists, false otherwise.
     */
    function getRecord(string memory recordId) external view returns (
        string memory,
        string memory,
        address,
        uint256,
        bool
    ) {
        Record memory record = records[recordId];
        return (
            record.recordId,
            record.documentHash,
            record.issuer,
            record.timestamp,
            record.exists
        );
    }
}
