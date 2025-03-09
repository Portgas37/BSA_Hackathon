# Zero Knowledge Petition App

## Project Overview

This repository contains our project developed for the EPFL Blockchain Student Association (BSA) Hackathon. We built a Zero Knowledge Petition Application leveraging the Mina blockchain to ensure secure and private petition signing using zero-knowledge proofs.

## Description

Our Zero Knowledge Petition App addresses privacy concerns in digital petitions. By employing Mina's lightweight blockchain and zero-knowledge proofs (zk-SNARKs), we ensure user anonymity while verifying petition signatures. Initially, we created simple contracts for petition creation and signing. We then enhanced these with recursion and advanced concepts using o1js to increase scalability and efficiency.

## Key Features

- Secure and anonymous petition signing using zero-knowledge proofs.
- Recursive zk-SNARKs to handle scalability.
- Advanced contract optimization with o1js.

## Technologies Used

- **Blockchain**: Mina Protocol
- **Smart Contracts**: o1js 
- **Cryptography**: zk-SNARKs (Zero Knowledge Proofs)
- **Development Tools**: Mina CLI, Git

## Installation

To set up the project locally:

```bash
git clone https://github.com/Portgas37/BSA_Hackathon.git
cd BSA_Hackathon
# Install dependencies
npm install
```

## Usage

To run the project locally:

```bash
# Compile and deploy contracts
npm run build
npm run deploy

# Run the site locally
npm run dev
```

## Team

- Ouazzani Adam 
- Ouazzani Jad
- Lataoui Ismail
- Hamirifou Mehdi
- Bengelloun Amine

## Acknowledgements

- [EPFL Blockchain Student Association](https://www.bsaepfl.ch)
- Mina Protocol 
- Hackathon Sponsors

---
