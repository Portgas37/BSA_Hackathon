import { 
  AccountUpdate, 
  Field, 
  Mina, 
  PrivateKey, 
  PublicKey, 
  Signature, 
  CircuitString, 
  Bool, 
  Poseidon,
  MerkleMap
} from 'o1js';
import { SignPetitions } from './SignPetition';
import { Petition } from './Petition';

let proofsEnabled = true;

describe('SignPetitions with Nullifiers', () => {
  let deployerAccount: Mina.TestPublicKey,
    deployerKey: PrivateKey,
    senderAccount: Mina.TestPublicKey,
    senderKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: SignPetitions,
    studentKey: PrivateKey,
    studentPublicKey: PublicKey,
    testPetition: Petition,
    nullifierMap: MerkleMap;

  beforeAll(async () => {
    if (proofsEnabled) await SignPetitions.compile();
  });

  beforeEach(async () => {
    const Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    [deployerAccount, senderAccount] = Local.testAccounts;
    deployerKey = deployerAccount.key;
    senderKey = senderAccount.key;
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new SignPetitions(zkAppAddress);
    
    // Create a student key for testing
    studentKey = PrivateKey.random();
    studentPublicKey = studentKey.toPublicKey();
    
    // Initialize a new nullifier map
    nullifierMap = new MerkleMap();
    
    // Create a standard test petition
    testPetition = new Petition({
      petitionId: Field(1),
      title: CircuitString.fromString('Test Petition'),
      description: CircuitString.fromString('This is a test petition'),
      petitionCount: Field(0),
      isActive: Bool(true)
    });
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await zkApp.deploy();
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
    
    // Initialize the contract state in a separate transaction
    const initTxn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.initState(testPetition.hash());
    });
    await initTxn.prove();
    await initTxn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('generates and deploys the SignPetitions smart contract', async () => {
    await localDeploy();
    
    const storedHash = zkApp.petitionHash.get();
    const expectedHash = testPetition.hash();
    expect(storedHash).toEqual(expectedHash);
    
    // Verify the nullifier root matches an empty map
    const emptyMapRoot = new MerkleMap().getRoot();
    const storedRoot = zkApp.nullifierRoot.get();
    expect(storedRoot).toEqual(emptyMapRoot);
  });

  it('allows a student to vote once on a petition', async () => {
    await localDeploy();
    
    // Create a signature from the university for the student
    const signature = Signature.create(
      SignPetitions.universityKey,
      studentPublicKey.toFields()
    );
    
    // Create a nullifier for this student and petition
    const nullifier = Poseidon.hash([
      ...studentPublicKey.toFields(),
      testPetition.petitionId
    ]);
    
    // Get a witness for this nullifier (which hasn't been used yet)
    const witness = nullifierMap.getWitness(nullifier);
    
    // Vote transaction
    const voteTxn = await Mina.transaction(senderAccount, async () => {
      await zkApp.vote(signature, studentPublicKey, testPetition, witness);
    });
    await voteTxn.prove();
    await voteTxn.sign([senderKey]).send();
    
    // After voting, update the local petition to reflect the incremented count
    testPetition = testPetition.incrementCount();
    const expectedHash = testPetition.hash();
    
    const updatedHash = zkApp.petitionHash.get();
    expect(updatedHash).toEqual(expectedHash);
    
    // Update our local nullifier map to match the on-chain state
    nullifierMap.set(nullifier, Field(1));
  });

  it('prevents a student from voting twice on the same petition', async () => {
    await localDeploy();
    
    // Create a signature from the university for the student
    const signature = Signature.create(
      SignPetitions.universityKey,
      studentPublicKey.toFields()
    );
    
    // Create a nullifier for this student and petition
    const nullifier = Poseidon.hash([
      ...studentPublicKey.toFields(),
      testPetition.petitionId
    ]);
    
    // Get a witness for this nullifier (which hasn't been used yet)
    const witness = nullifierMap.getWitness(nullifier);
    
    // First vote should succeed
    const voteTxn = await Mina.transaction(senderAccount, async () => {
      await zkApp.vote(signature, studentPublicKey, testPetition, witness);
    });
    await voteTxn.prove();
    await voteTxn.sign([senderKey]).send();
    
    // Update our local petition to reflect the incremented count
    testPetition = testPetition.incrementCount();
    nullifierMap.set(nullifier, Field(1));
    
    // Second vote with the same student should fail.
    // Get an updated witness that reflects the state change.
    const updatedWitness = nullifierMap.getWitness(nullifier);
    
    let errorThrown = false;
    try {
      // Use the updated testPetition so the petition hash check passes
      const secondVoteTxn = await Mina.transaction(senderAccount, async () => {
        await zkApp.vote(signature, studentPublicKey, testPetition, updatedWitness);
      });
      await secondVoteTxn.prove();
    } catch (e) {
      errorThrown = true;
      const error = e as Error;
      // Changed expected substring to match the contract's error message
      expect(error.message).toContain("Nullifier witness is invalid");
    }
    
    expect(errorThrown).toBe(true);
  });

  it('allows different students to vote on the same petition', async () => {
    await localDeploy();
    
    // First student votes
    const signature1 = Signature.create(
      SignPetitions.universityKey,
      studentPublicKey.toFields()
    );
    
    const nullifier1 = Poseidon.hash([
      ...studentPublicKey.toFields(),
      testPetition.petitionId
    ]);
    
    const witness1 = nullifierMap.getWitness(nullifier1);
    
    const voteTxn1 = await Mina.transaction(senderAccount, async () => {
      await zkApp.vote(signature1, studentPublicKey, testPetition, witness1);
    });
    await voteTxn1.prove();
    await voteTxn1.sign([senderKey]).send();
    
    // Update our local petition to reflect the incremented count
    testPetition = testPetition.incrementCount();
    nullifierMap.set(nullifier1, Field(1));
    
    // Create a second student
    const student2Key = PrivateKey.random();
    const student2PublicKey = student2Key.toPublicKey();
    
    const signature2 = Signature.create(
      SignPetitions.universityKey,
      student2PublicKey.toFields()
    );
    
    const nullifier2 = Poseidon.hash([
      ...student2PublicKey.toFields(),
      testPetition.petitionId
    ]);
    
    const witness2 = nullifierMap.getWitness(nullifier2);
    
    // Second student successfully votes
    const voteTxn2 = await Mina.transaction(senderAccount, async () => {
      await zkApp.vote(signature2, student2PublicKey, testPetition, witness2);
    });
    await voteTxn2.prove();
    await voteTxn2.sign([senderKey]).send();
    
    // After two votes, update the local petition once more
    testPetition = testPetition.incrementCount();
    const expectedHash = testPetition.hash();
    
    const updatedHash = zkApp.petitionHash.get();
    expect(updatedHash).toEqual(expectedHash);
  });
});
