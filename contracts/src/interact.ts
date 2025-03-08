import fs from 'fs/promises';
import {
  Mina,
  NetworkId,
  PrivateKey,
  PublicKey,
  Signature,
  Field,
  MerkleMapWitness,
  Bool,
  Poseidon,
} from 'o1js';
import { Petition } from './petition.js'; // Use the exported class "Petition"

// ========================================================
// Simulated University Signing Function for Demo Purposes
// ========================================================
function simulateUniversitySign(studentPublicKey: PublicKey, petitionId: Field): Signature {
  // For demo purposes, we simulate that every student is valid.
  // Replace the string below with your demo university's private key in Base58.
  const universityPrivateKey = PrivateKey.fromBase58('<<YOUR-UNIVERSITY-PRIVATE-KEY>>');
  // Create a message composed of the student's public key fields and the petition ID.
  const message = [...studentPublicKey.toFields(), petitionId];
  // Use the static Signature.create method to produce a signature.
  return Signature.create(universityPrivateKey, message);
}

// ========================================================
// 1. Parse Command-Line Argument
// ========================================================
const deployAlias = process.argv[2];
if (!deployAlias)
  throw Error(`Missing <deployAlias> argument.

Usage:
node build/src/interact.js <deployAlias>
`);
Error.stackTraceLimit = 1000;
const DEFAULT_NETWORK_ID = 'testnet';

// ========================================================
// 2. Parse Config and Keys from Files
// ========================================================
type Config = {
  deployAliases: Record<
    string,
    {
      networkId?: string;
      url: string;
      keyPath: string;
      fee: string;
      feepayerKeyPath: string;
      feepayerAlias: string;
    }
  >;
};

const configJson: Config = JSON.parse(await fs.readFile('config.json', 'utf8'));
const config = configJson.deployAliases[deployAlias];

const feepayerKeysBase58: { privateKey: string; publicKey: string } = JSON.parse(
  await fs.readFile(config.feepayerKeyPath, 'utf8')
);
const zkAppKeysBase58: { privateKey: string; publicKey: string } = JSON.parse(
  await fs.readFile(config.keyPath, 'utf8')
);

const feepayerKey = PrivateKey.fromBase58(feepayerKeysBase58.privateKey);
const zkAppKey = PrivateKey.fromBase58(zkAppKeysBase58.privateKey);

// ========================================================
// 3. Set Up Mina Instance and Instantiate the Contract
// ========================================================
const networkInstance = Mina.Network({
  networkId: (config.networkId ?? DEFAULT_NETWORK_ID) as NetworkId,
  mina: config.url,
});
const fee = Number(config.fee) * 1e9; // fee in nanomina
Mina.setActiveInstance(networkInstance);

const feepayerAddress = feepayerKey.toPublicKey();
const zkAppAddress = zkAppKey.toPublicKey();
const zkApp = new Petition(zkAppAddress);

// ========================================================
// 4. Compile the Contract
// ========================================================
console.log('Compiling the contract...');
await Petition.compile();

// ========================================================
// 5. Build and Send Transaction
// ========================================================
try {
  console.log('Building transaction and creating proof...');

  // --- Set up petition parameters ---
  const petitionId = Field(123);
  const studentPublicKey = PublicKey.fromBase58(
    'B62qstudentPublicKeyExample1111111111111111111111111111111111111'
  );

  // Simulate the university signing process off-chain.
  const signature = simulateUniversitySign(studentPublicKey, petitionId);

  // --- Prepare a placeholder MerkleMap witness ---
  // In a real app, you would compute the witness from a local MerkleMap of signers.
  const isLefts: boolean[] = []; // Populate with booleans for the witness path
  const siblings: Field[] = [];   // Populate with sibling nodes (Field elements)
  const bools: Bool[] = isLefts.map(b => new Bool(b));
  const witness = new MerkleMapWitness(bools, siblings);

  // Fetch the current on-chain MerkleMap root from the contract state.
  const currentRoot = zkApp.signersRoot.get();
  const oldValue = Field(0); // Expect 0 if the student hasn't signed yet.

  // --- Create and Prove the Transaction ---
  const tx = await Mina.transaction(
    { sender: feepayerAddress, fee },
    async () => {
      await zkApp.signPetition(
        studentPublicKey,
        signature,
        petitionId,
        currentRoot,
        oldValue,
        witness
      );
    }
  );
  await tx.prove();

  console.log('Sending transaction...');
  const sentTx = await tx.sign([feepayerKey]).send();
  if (sentTx?.hash && sentTx.status === 'pending') {
    console.log(
      '\nSuccess! Petition signed transaction sent.\n' +
      '\nYour smart contract state will be updated as soon as the transaction is included in a block:' +
      `\n${getTxnUrl(config.url, sentTx.hash)}`
    );
  } else {
    console.log('Transaction status:', sentTx?.status);
  }
} catch (err) {
  console.error('Error sending transaction:', err);
}

// ========================================================
// Helper Function: Generate Transaction URL
// ========================================================
function getTxnUrl(graphQlUrl: string, txnHash: string | undefined) {
  const hostName = new URL(graphQlUrl).hostname;
  const txnBroadcastServiceName = hostName
    .split('.')
    .filter((item) => item === 'minascan')?.[0];
  const networkName = graphQlUrl
    .split('/')
    .filter((item) => item === 'mainnet' || item === 'devnet')?.[0];
  if (txnBroadcastServiceName && networkName && txnHash) {
    return `https://minascan.io/${networkName}/tx/${txnHash}?type=zk-tx`;
  }
  return `Transaction hash: ${txnHash}`;
}
