# zkPetition

A privacy-preserving petition platform built on Mina Protocol using zero-knowledge proofs.

## Problem

Traditional petition platforms expose signer identities, which can lead to retaliation, discrimination, or privacy violations. Users should be able to express support for causes without revealing their identity while still ensuring each person can only sign once.

## Solution

zkPetition uses zk-SNARKs on Mina Protocol to enable:

- **Anonymous signing**: Signers prove they're authorized without revealing identity
- **Single-vote enforcement**: Nullifiers prevent double-signing without tracking who signed
- **Verifiable counts**: Anyone can verify the signature count is accurate

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Wallet Hook │  │  Petition   │  │     Web Worker          │  │
│  │ (Auro)      │  │  Components │  │ (o1js proof generation) │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Smart Contracts (o1js)                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ SignPetitions                                            │    │
│  │  • petitionHash: Field (commitment to petition state)    │    │
│  │  • nullifierRoot: Field (Merkle root of used nullifiers) │    │
│  │                                                          │    │
│  │ Methods:                                                 │    │
│  │  • initState(petitionHash)                               │    │
│  │  • vote(signature, studentPublicKey, petition, witness)  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ SignPetitionRecursive (Scalable Version)                 │    │
│  │  • SignProofProgram: Verifies individual signatures      │    │
│  │  • SignAggregationProgram: Recursively aggregates proofs │    │
│  │  • submitProof: Batch-updates petition state             │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Mina Protocol                              │
│           (22KB blockchain, succinct state verification)         │
└─────────────────────────────────────────────────────────────────┘
```

### Key Components

**Petition Struct**
- `petitionId`: Unique identifier
- `title`, `description`: Petition content (hashed on-chain)
- `petitionCount`: Number of signatures
- `isActive`: Whether petition accepts signatures

**Nullifier System**
- Nullifier = `Poseidon.hash(studentPublicKey, petitionId)`
- Stored in Merkle Map (off-chain) with on-chain root
- Prevents double-signing without revealing who signed

**Two Contract Versions**
1. `SignPetitions`: Simple version, one transaction per signature
2. `SignPetitionRecursive`: Uses recursive proofs to batch signatures, reducing on-chain transactions

## Setup

### Prerequisites

- Node.js >= 18.14.0
- [Auro Wallet](https://www.aurowallet.com/) browser extension

### Installation

```bash
git clone https://github.com/Portgas37/BSA_Hackathon.git
cd BSA_Hackathon
npm install
```

### Development

```bash
# Run contract tests
npm test

# Build contracts
npm run build

# Start UI development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Testing

```bash
cd contracts
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run coverage      # Coverage report
```

## Project Structure

```
├── contracts/
│   └── src/
│       ├── Petition.ts              # Petition data structure
│       ├── SignPetition.ts          # Basic voting contract
│       ├── SignPetitionRecursive.ts # Recursive proof version
│       └── *.test.ts                # Contract tests
├── ui/
│   ├── app/
│   │   ├── page.tsx                 # Home page
│   │   ├── create-petition/         # Petition creation
│   │   └── zkappWorker.ts           # Web Worker for proofs
│   ├── components/
│   │   ├── hero.tsx                 # Landing section
│   │   ├── petition-list.tsx        # Active petitions
│   │   └── wallet-button.tsx        # Wallet connection
│   └── hooks/
│       ├── use-mina-wallet.ts       # Wallet state management
│       └── useZkappWorker.ts        # Worker client
└── package.json
```

## How It Works

1. **University Authorization**: A trusted authority (university) signs student public keys, creating credentials
2. **Signing a Petition**:
   - User connects Auro wallet
   - Frontend generates nullifier from (publicKey, petitionId)
   - Proof verifies: valid credential + nullifier not yet used
   - On-chain: Merkle root updated, petition count incremented
3. **Privacy Guarantee**: The blockchain only stores hashes and Merkle roots—no identifiable data

## Limitations

- University key is hardcoded (production would use proper key management)
- Local blockchain for development (testnet/mainnet deployment pending)
- Nullifier map stored off-chain (requires trusted sequencer or decentralized storage)

## Tech Stack

- **Blockchain**: [Mina Protocol](https://minaprotocol.com/)
- **Smart Contracts**: [o1js](https://docs.minaprotocol.com/zkapps/o1js)
- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Wallet**: Auro Wallet
