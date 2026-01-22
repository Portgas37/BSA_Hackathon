import {
  Field,
  PublicKey,
  Signature,
  PrivateKey,
  Bool,
  Mina,
  AccountUpdate,
  CircuitString,
  MerkleMap,
  Nullifier,
} from 'o1js';
import { Petition } from './Petition.js';
import SignAggregation, {
  SignProofPublicInput,
  SignPetitions,
  SignProofProgram,
} from './SignPetitionRecursive.js';

describe('SignAggregation Recursive Proofs', () => {
  it('creates and verifies aggregated proofs', async () => {
    const useProof = false;
    const Local = await Mina.LocalBlockchain({ proofsEnabled: useProof });
    Mina.setActiveInstance(Local);

    const deployerAccount = Local.testAccounts[0];
    const deployerKey = deployerAccount.key;
    const senderAccount = Local.testAccounts[1];
    const senderKey = senderAccount.key;

    const studentPrivateKey = PrivateKey.random();
    const studentPublicKey = studentPrivateKey.toPublicKey();

    const petition = new Petition({
      petitionId: Field(1),
      title: CircuitString.fromString('Test Petition'),
      description: CircuitString.fromString('This is a test petition'),
      petitionCount: Field(0),
      isActive: Bool(true),
    });

    const nullifierMap = new MerkleMap();
    const nullifier = Nullifier.fromJSON(
      Nullifier.createTestNullifier(studentPublicKey.toFields(), studentPrivateKey)
    );

    const nullifierWitness = nullifierMap.getWitness(nullifier.key());

    const publicInput = new SignProofPublicInput({
      universityPublicKey: SignPetitions.universityPublicKey,
    });

    await SignProofProgram.compile();

    const signProof = (
      await SignProofProgram.verifier(
        publicInput,
        studentPublicKey,
        nullifier,
        Signature.create(SignPetitions.universityKey, studentPublicKey.toFields())
      )
    ).proof;

    const aggregationInput = new SignAggregation.PublicInputs({
      petition,
      signProof,
    });

    await SignAggregation.Program.compile();

    const baseEmptyProof = (
      await SignAggregation.Program.base_empty(aggregationInput)
    ).proof;

    const appendSignatureProof = await SignAggregation.Program.append_signature(
      aggregationInput,
      baseEmptyProof,
      nullifierWitness
    );

    const zkAppPrivateKey = PrivateKey.random();
    const zkAppAddress = zkAppPrivateKey.toPublicKey();
    const zkAppInstance = new SignPetitions(zkAppAddress);

    const deployTxn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await zkAppInstance.deploy();
      await zkAppInstance.initState(petition);
    });
    await deployTxn.prove();
    await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

    const initialHash = zkAppInstance.petitionHash.get();

    const submitTxn = await Mina.transaction(senderAccount, async () => {
      await zkAppInstance.submitProof(appendSignatureProof.proof);
    });
    await submitTxn.prove();
    await submitTxn.sign([senderKey]).send();

    const updatedHash = zkAppInstance.petitionHash.get();
    expect(updatedHash).not.toEqual(initialHash);

    // Attempting to sign again should fail
    await expect(async () => {
      await SignAggregation.Program.append_signature(
        aggregationInput,
        appendSignatureProof.proof,
        nullifierWitness
      );
    }).rejects.toThrow();
  });
});
