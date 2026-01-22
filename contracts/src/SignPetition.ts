import {
  Field,
  SmartContract,
  state,
  State,
  method,
  PublicKey,
  Signature,
  PrivateKey,
  MerkleMap,
  MerkleMapWitness,
  Poseidon,
} from 'o1js';

import { Petition } from './Petition.js';

export class SignPetitions extends SmartContract {
  // Hardcoded university key for signature verification (demo purposes)
  static universityKey: PrivateKey = PrivateKey.fromBase58(
    'EKFVrBNzyKRepfmFhvQ9Qqy2jc2CQZzn1hSHxNpHwaACrKm4ZQAr'
  );

  static get universityPublicKey(): PublicKey {
    return SignPetitions.universityKey.toPublicKey();
  }

  @state(Field) petitionHash = State<Field>();
  @state(Field) nullifierRoot = State<Field>();

  @method async initState(petitionHash: Field) {
    this.petitionHash.set(petitionHash);
    const emptyMap = new MerkleMap();
    this.nullifierRoot.set(emptyMap.getRoot());
  }

  @method async vote(
    signature: Signature,
    studentPublicKey: PublicKey,
    petition: Petition,
    nullifierWitness: MerkleMapWitness
  ): Promise<void> {
    this.petitionHash.requireEquals(this.petitionHash.get());
    this.petitionHash.get().assertEquals(petition.hash(), 'Petition hash mismatch!');

    const isValidSignature = signature.verify(
      SignPetitions.universityPublicKey,
      studentPublicKey.toFields()
    );
    isValidSignature.assertTrue('Invalid signature!');

    const currentNullifierRoot = this.nullifierRoot.get();
    this.nullifierRoot.requireEquals(currentNullifierRoot);

    // Nullifier = hash(studentPublicKey, petitionId) ensures one vote per student per petition
    const nullifier = Poseidon.hash([...studentPublicKey.toFields(), petition.petitionId]);

    const [rootBefore, keyExists] = nullifierWitness.computeRootAndKey(Field(0));
    rootBefore.assertEquals(currentNullifierRoot, 'Nullifier witness is invalid');
    keyExists.assertEquals(nullifier, 'Nullifier key mismatch');

    const [rootAfter] = nullifierWitness.computeRootAndKey(Field(1));
    this.nullifierRoot.set(rootAfter);

    const newPetition = petition.incrementCount();
    this.petitionHash.set(newPetition.hash());
  }
}
