import { AccountUpdate, Field, Mina, PrivateKey, PublicKey, Signature, CircuitString, Bool } from 'o1js';
import { SignPetitions } from './SignPetition';
import { Petition } from './Petition';

let proofsEnabled = false;

describe('SignPetitions', () => {
  let deployerAccount: Mina.TestPublicKey,
    deployerKey: PrivateKey,
    senderAccount: Mina.TestPublicKey,
    senderKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: SignPetitions,
    studentKey: PrivateKey,
    studentPublicKey: PublicKey,
    testPetition: Petition;

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
    // Deploy with initial state in the same transaction
    const txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await zkApp.deploy();
      
      // Set the initial petition hash directly in the deploy transaction
      const petitionHash = testPetition.hash();
      zkApp.petitionHash.set(petitionHash);
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('generates and deploys the SignPetitions smart contract', async () => {
    await localDeploy();
    
    const storedHash = zkApp.petitionHash.get();
    const expectedHash = testPetition.hash();
    expect(storedHash).toEqual(expectedHash);
  });

  it('correctly processes a vote on the petition', async () => {
    await localDeploy();
    
    // Create a signature from the university for the student
    const signature = Signature.create(
      SignPetitions.universityKey,
      studentPublicKey.toFields()
    );
    
    // Vote transaction
    const voteTxn = await Mina.transaction(senderAccount, async () => {
      await zkApp.vote(signature, studentPublicKey, testPetition);
    });
    await voteTxn.prove();
    await voteTxn.sign([senderKey]).send();
    
    // After voting, the petition count should be incremented
    const incrementedPetition = testPetition.incrementCount();
    const expectedHash = incrementedPetition.hash();
    
    const updatedHash = zkApp.petitionHash.get();
    expect(updatedHash).toEqual(expectedHash);
  });

  it('fails when trying to vote with an invalid signature', async () => {
    await localDeploy();
    
    // Create an invalid signature using a random key instead of the university key
    const invalidKey = PrivateKey.random();
    const invalidSignature = Signature.create(
      invalidKey,
      studentPublicKey.toFields()
    );
    
    // Expect the transaction to fail with an assertion error
    let errorThrown = false;
    try {
      const txn = await Mina.transaction(senderAccount, async () => {
        await zkApp.vote(invalidSignature, studentPublicKey, testPetition);
      });
      await txn.prove();
    } catch (e) {
      errorThrown = true;
      const error = e as Error;
      expect(error.message).toContain('Invalid signature');
    }
    
    expect(errorThrown).toBe(true);
  });

  it('fails when petition hash does not match stored hash', async () => {
    await localDeploy();
    
    // Create a different petition
    const differentPetition = new Petition({
      petitionId: Field(2), // Different ID
      title: CircuitString.fromString('Different Petition'),
      description: CircuitString.fromString('This is a different petition'),
      petitionCount: Field(0),
      isActive: Bool(true)
    });
    
    // Create a valid signature
    const signature = Signature.create(
      SignPetitions.universityKey,
      studentPublicKey.toFields()
    );
    
    // Expect the transaction to fail due to hash mismatch
    let errorThrown = false;
    try {
      const txn = await Mina.transaction(senderAccount, async () => {
        await zkApp.vote(signature, studentPublicKey, differentPetition);
      });
      await txn.prove();
    } catch (e) {
      errorThrown = true;
      const error = e as Error;
      expect(error.message).toContain('Petition hash mismatch');
    }
    
    expect(errorThrown).toBe(true);
  });
});