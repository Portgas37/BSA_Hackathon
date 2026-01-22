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
  MerkleMap,
} from 'o1js';
import { SignPetitions } from './SignPetition.js';
import { Petition } from './Petition.js';

const proofsEnabled = true;

describe('SignPetitions', () => {
  let deployerAccount: Mina.TestPublicKey;
  let deployerKey: PrivateKey;
  let senderAccount: Mina.TestPublicKey;
  let senderKey: PrivateKey;
  let zkAppAddress: PublicKey;
  let zkAppPrivateKey: PrivateKey;
  let zkApp: SignPetitions;
  let studentKey: PrivateKey;
  let studentPublicKey: PublicKey;
  let testPetition: Petition;
  let nullifierMap: MerkleMap;

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

    studentKey = PrivateKey.random();
    studentPublicKey = studentKey.toPublicKey();
    nullifierMap = new MerkleMap();

    testPetition = new Petition({
      petitionId: Field(1),
      title: CircuitString.fromString('Test Petition'),
      description: CircuitString.fromString('This is a test petition'),
      petitionCount: Field(0),
      isActive: Bool(true),
    });
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await zkApp.deploy();
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();

    const initTxn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.initState(testPetition.hash());
    });
    await initTxn.prove();
    await initTxn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('deploys and initializes correctly', async () => {
    await localDeploy();

    const storedHash = zkApp.petitionHash.get();
    expect(storedHash).toEqual(testPetition.hash());

    const emptyMapRoot = new MerkleMap().getRoot();
    const storedRoot = zkApp.nullifierRoot.get();
    expect(storedRoot).toEqual(emptyMapRoot);
  });

  it('allows a student to vote once', async () => {
    await localDeploy();

    const signature = Signature.create(
      SignPetitions.universityKey,
      studentPublicKey.toFields()
    );

    const nullifier = Poseidon.hash([
      ...studentPublicKey.toFields(),
      testPetition.petitionId,
    ]);

    const witness = nullifierMap.getWitness(nullifier);

    const voteTxn = await Mina.transaction(senderAccount, async () => {
      await zkApp.vote(signature, studentPublicKey, testPetition, witness);
    });
    await voteTxn.prove();
    await voteTxn.sign([senderKey]).send();

    testPetition = testPetition.incrementCount();
    const expectedHash = testPetition.hash();
    const updatedHash = zkApp.petitionHash.get();
    expect(updatedHash).toEqual(expectedHash);

    nullifierMap.set(nullifier, Field(1));
  });

  it('prevents double voting', async () => {
    await localDeploy();

    const signature = Signature.create(
      SignPetitions.universityKey,
      studentPublicKey.toFields()
    );

    const nullifier = Poseidon.hash([
      ...studentPublicKey.toFields(),
      testPetition.petitionId,
    ]);

    const witness = nullifierMap.getWitness(nullifier);

    const voteTxn = await Mina.transaction(senderAccount, async () => {
      await zkApp.vote(signature, studentPublicKey, testPetition, witness);
    });
    await voteTxn.prove();
    await voteTxn.sign([senderKey]).send();

    testPetition = testPetition.incrementCount();
    nullifierMap.set(nullifier, Field(1));

    const updatedWitness = nullifierMap.getWitness(nullifier);

    await expect(async () => {
      const secondVoteTxn = await Mina.transaction(senderAccount, async () => {
        await zkApp.vote(signature, studentPublicKey, testPetition, updatedWitness);
      });
      await secondVoteTxn.prove();
    }).rejects.toThrow('Nullifier witness is invalid');
  });

  it('allows different students to vote', async () => {
    await localDeploy();

    const signature1 = Signature.create(
      SignPetitions.universityKey,
      studentPublicKey.toFields()
    );

    const nullifier1 = Poseidon.hash([
      ...studentPublicKey.toFields(),
      testPetition.petitionId,
    ]);

    const witness1 = nullifierMap.getWitness(nullifier1);

    const voteTxn1 = await Mina.transaction(senderAccount, async () => {
      await zkApp.vote(signature1, studentPublicKey, testPetition, witness1);
    });
    await voteTxn1.prove();
    await voteTxn1.sign([senderKey]).send();

    testPetition = testPetition.incrementCount();
    nullifierMap.set(nullifier1, Field(1));

    const student2Key = PrivateKey.random();
    const student2PublicKey = student2Key.toPublicKey();

    const signature2 = Signature.create(
      SignPetitions.universityKey,
      student2PublicKey.toFields()
    );

    const nullifier2 = Poseidon.hash([
      ...student2PublicKey.toFields(),
      testPetition.petitionId,
    ]);

    const witness2 = nullifierMap.getWitness(nullifier2);

    const voteTxn2 = await Mina.transaction(senderAccount, async () => {
      await zkApp.vote(signature2, student2PublicKey, testPetition, witness2);
    });
    await voteTxn2.prove();
    await voteTxn2.sign([senderKey]).send();

    testPetition = testPetition.incrementCount();
    const expectedHash = testPetition.hash();
    const updatedHash = zkApp.petitionHash.get();
    expect(updatedHash).toEqual(expectedHash);
  });
});
