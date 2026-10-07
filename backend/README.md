# RecordVerification Backend

Blockchain-Based Tamper-Proof Record Verification Backend built with Node.js, Express, ethers.js, and Multer.

## Tech Stack
- **Node.js & Express.js**: REST API server
- **ethers.js (v6)**: Interaction with Ethereum smart contract
- **Multer**: In-memory file processing
- **SHA-256 (`crypto`)**: Secure file byte hashing
- **dotenv**: Environment variable management
- **CORS**: Cross-origin resource sharing for React frontend

## Project Structure
```
backend/
├── src/
│   ├── server.js               # Express app entry point
│   ├── routes/
│   │   └── recordRoutes.js     # API route definitions
│   ├── controllers/
│   │   └── recordController.js # Request handlers (Register, Verify, Get, Health)
│   ├── services/
│   │   ├── hashService.js      # SHA-256 hashing service
│   │   └── blockchainService.js# ethers.js smart contract interface
│   ├── middleware/
│   │   ├── uploadMiddleware.js # Multer file upload filter and memory storage
│   │   └── errorHandler.js     # Express JSON error handler
│   └── blockchain/
│       └── RecordVerification.json # Smart contract ABI artifact
├── .env.example                # Example environment variables template
├── .env                        # Environment configuration (not committed)
├── .gitignore
├── package.json
└── README.md
```

## Installation & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your RPC node URL and Private Key:
```env
PORT=5000
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 3. Start Backend Server
```bash
# Production / Standard start
npm start

# Development mode (auto-reload on node 18+)
npm run dev
```

## API Endpoints

### 1. Health API
- **Endpoint**: `GET /api/health`
- **Response**:
```json
{
  "success": true,
  "message": "Backend is running",
  "blockchain": {
    "connected": true,
    "chainId": "31337",
    "blockNumber": 1
  }
}
```

### 2. Register Record API
- **Endpoint**: `POST /api/register`
- **Content-Type**: `multipart/form-data`
- **Body Fields**:
  - `recordId` (string)
  - `file` (binary document file)
- **Response**:
```json
{
  "success": true,
  "recordId": "REC-1001",
  "documentHash": "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "transactionHash": "0x..."
}
```

### 3. Verify Record API
- **Endpoint**: `POST /api/verify`
- **Content-Type**: `multipart/form-data`
- **Body Fields**:
  - `recordId` (string)
  - `file` (binary document file)
- **Response**:
```json
{
  "success": true,
  "authentic": true,
  "recordId": "REC-1001",
  "documentHash": "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

### 4. Get Record API
- **Endpoint**: `GET /api/record/:recordId`
- **Response**:
```json
{
  "success": true,
  "recordId": "REC-1001",
  "documentHash": "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "issuer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "timestamp": "1710000000"
}
```



