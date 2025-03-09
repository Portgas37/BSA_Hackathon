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
    VerificationKey,
    MerkleMap,
    MerkleMapWitness,
    ZkProgram,
    SelfProof,
    Nullifier,
  } from "o1js";
  
  import { Petition } from "./PetitionRecursive";

  //namespace SignProofNameSpace{
    export class PublicInputs1 extends Struct({
      universityPublicKey: PublicKey
    }) {}

    export class PublicOutputs1 extends Struct({
      nullifier: Nullifier
    }) {}

    export const SignProofProgram = ZkProgram({
      name: "sign-proof",
      publicInput: PublicInputs1,
      publicOutput: PublicOutputs1,

      methods:{
          verifier:{
              privateInputs: [PublicKey, Nullifier, Signature],

              async method(publicInput: PublicInputs1, 
                  studentPublicKey: PublicKey,
                  nullifier: Nullifier, 
                  signature: Signature){
                      const isValidSignature = signature.verify(
                      publicInput.universityPublicKey,
                      studentPublicKey.toFields()
                      );
                      isValidSignature.assertTrue("Invalid signature!");

                      nullifier.verify(studentPublicKey.toFields())

                      return {publicOutput: {nullifier: nullifier}};
              },
          },
      },
    });
      export class SignProof extends ZkProgram.Proof(SignProofProgram) {}
  //}
  namespace SignAggregationNamespace {
    export class PublicInputs extends Struct({
      petition: Petition,
      signProof: SignProof,

    }) {}

    export class PublicOutputs extends Struct({
      totalAggregatedCount: Field,
      nullifierRoot: Field,
    }) {}
    
    // ZkProgram to aggregate signatures into a Merkle Map
    export const SignAggregationProgram = ZkProgram({
      name: "sign-aggregation",
      publicInput: PublicInputs,
      publicOutput: PublicOutputs,
        
      methods: {
        // Base case:
        base_empty: {
          privateInputs: [],
    
          async method(){
            return {publicOutput : {totalAggregatedCount: Field(0), nullifierRoot: new MerkleMap().getRoot()}};
          },
        },
    
        // Recursive step: Aggregate signatures into the Merkle Map
        append_signature: {
          privateInputs: [SelfProof, MerkleMapWitness],
    
          async method(
            publicInput: PublicInputs,
            previousProof: SelfProof<PublicInputs, PublicOutputs>,
            nullifierWitness: MerkleMapWitness,
          ) {
            previousProof.verify();
            publicInput.signProof.verify()
            publicInput.signProof.publicInput.universityPublicKey.assertEquals(SignPetitions.universityPublicKey);

            const [currentRoot, currentKey] = nullifierWitness.computeRootAndKey(Field(0));

            currentKey.assertEquals(publicInput.signProof.publicOutput.nullifier.key());
            currentRoot.assertEquals(previousProof.publicOutput.nullifierRoot);

            // Update the nullifier map - set the value to 1 to mark this student as having signed
            const [rootAfter, _] = nullifierWitness.computeRootAndKey(Field(1));

            const newCount = previousProof.publicOutput.totalAggregatedCount.add(Field(1));
            
            return {publicOutput : {totalAggregatedCount: newCount, nullifierRoot: rootAfter}};
          },
        },
      },
    });

    export class Proof extends ZkProgram.Proof(SignAggregationProgram) {}

  }  
  
  export default SignAggregationNamespace;
  
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
  
    @method async submitProof(proof: SignAggregationNamespace.Proof) {
      proof.verify();
      
      this.petitionHash.getAndRequireEquals().assertEquals(proof.publicInput.petition.hash(), "Petition mismatch!");

      const newPetition = proof.publicInput.petition.setPetitionCount(proof.publicOutput.totalAggregatedCount); 
      
      this.petitionHash.set(newPetition.hash());
    }
  }
  
  