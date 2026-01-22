import {
  Field,
  SmartContract,
  state,
  State,
  method,
  PublicKey,
  Signature,
  PrivateKey,
  Struct,
  MerkleMap,
  MerkleMapWitness,
  ZkProgram,
  SelfProof,
  Nullifier,
} from 'o1js';

import { Petition } from './Petition.js';

export class SignProofPublicInput extends Struct({
  universityPublicKey: PublicKey,
}) {}

export class SignProofPublicOutput extends Struct({
  nullifier: Nullifier,
}) {}

export const SignProofProgram = ZkProgram({
  name: 'sign-proof',
  publicInput: SignProofPublicInput,
  publicOutput: SignProofPublicOutput,

  methods: {
    verifier: {
      privateInputs: [PublicKey, Nullifier, Signature],

      async method(
        publicInput: SignProofPublicInput,
        studentPublicKey: PublicKey,
        nullifier: Nullifier,
        signature: Signature
      ) {
        const isValidSignature = signature.verify(
          publicInput.universityPublicKey,
          studentPublicKey.toFields()
        );
        isValidSignature.assertTrue('Invalid signature!');
        nullifier.verify(studentPublicKey.toFields());
        return { publicOutput: { nullifier } };
      },
    },
  },
});

export class SignProof extends ZkProgram.Proof(SignProofProgram) {}

namespace SignAggregation {
  export class PublicInputs extends Struct({
    petition: Petition,
    signProof: SignProof,
  }) {}

  export class PublicOutputs extends Struct({
    totalAggregatedCount: Field,
    nullifierRoot: Field,
  }) {}

  export const Program = ZkProgram({
    name: 'sign-aggregation',
    publicInput: PublicInputs,
    publicOutput: PublicOutputs,

    methods: {
      base_empty: {
        privateInputs: [],
        async method() {
          return {
            publicOutput: {
              totalAggregatedCount: Field(0),
              nullifierRoot: new MerkleMap().getRoot(),
            },
          };
        },
      },

      append_signature: {
        privateInputs: [SelfProof, MerkleMapWitness],

        async method(
          publicInput: PublicInputs,
          previousProof: SelfProof<PublicInputs, PublicOutputs>,
          nullifierWitness: MerkleMapWitness
        ) {
          previousProof.verify();
          publicInput.signProof.verify();
          publicInput.signProof.publicInput.universityPublicKey.assertEquals(
            SignPetitions.universityPublicKey
          );

          const [currentRoot, currentKey] = nullifierWitness.computeRootAndKey(Field(0));
          currentKey.assertEquals(publicInput.signProof.publicOutput.nullifier.key());
          currentRoot.assertEquals(previousProof.publicOutput.nullifierRoot);

          const [rootAfter] = nullifierWitness.computeRootAndKey(Field(1));
          const newCount = previousProof.publicOutput.totalAggregatedCount.add(Field(1));

          return {
            publicOutput: {
              totalAggregatedCount: newCount,
              nullifierRoot: rootAfter,
            },
          };
        },
      },
    },
  });

  export class Proof extends ZkProgram.Proof(Program) {}
}

export default SignAggregation;

export class SignPetitions extends SmartContract {
  static universityKey: PrivateKey = PrivateKey.random();

  static get universityPublicKey(): PublicKey {
    return SignPetitions.universityKey.toPublicKey();
  }

  @state(Field) petitionHash = State<Field>();
  @state(Field) nullifierRoot = State<Field>();

  @method async initState(petition: Petition) {
    this.petitionHash.set(petition.hash());
  }

  @method async submitProof(proof: SignAggregation.Proof) {
    proof.verify();

    this.petitionHash
      .getAndRequireEquals()
      .assertEquals(proof.publicInput.petition.hash(), 'Petition mismatch!');

    const newPetition = proof.publicInput.petition.setPetitionCount(
      proof.publicOutput.totalAggregatedCount
    );

    this.petitionHash.set(newPetition.hash());
  }
}
