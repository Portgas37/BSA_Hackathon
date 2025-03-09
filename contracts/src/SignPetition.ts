import { Field, SmartContract, state, State, method, PublicKey, Signature, PrivateKey, MerkleMap, MerkleMapWitness, Poseidon} from 'o1js';

import { Petition } from './Petition';

export class SignPetitions extends SmartContract {
    
    static universityKey: PrivateKey = PrivateKey.fromBase58("EKFVrBNzyKRepfmFhvQ9Qqy2jc2CQZzn1hSHxNpHwaACrKm4ZQAr");
    static get universityPublicKey(): PublicKey {
    return SignPetitions.universityKey.toPublicKey();
  }
  
    
    
    @state(Field) petitionHash = State<Field>();

    // Store the root of a Merkle tree (map) that tracks nullifiers
    @state(Field) nullifierRoot = State<Field>();

    // initialize nullifier 

    @method async initState(petitionHash: Field) {
        // Initialize the petition hash to a default value.
        this.petitionHash.set(petitionHash);
        

        // initialize nullifier root

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
        this.petitionHash.get().assertEquals(petition.hash(), "Petition hash mismatch!");
        

        const isValidSignature = signature.verify(SignPetitions.universityPublicKey, studentPublicKey.toFields());
        isValidSignature.assertTrue("Invalid signature!");

        // NEW CODE NULLIFIER

        // Get current nullifier root
        const currentNullifierRoot = this.nullifierRoot.get();
        this.nullifierRoot.requireEquals(currentNullifierRoot);
        
        // Create a nullifier from the student's public key and the petition ID
        // This creates a unique identifier for each (student, petition) pair
        const nullifier = Poseidon.hash([
        ...studentPublicKey.toFields(),
        petition.petitionId
        ]);
        
        // Check that the student hasn't already voted
        // The witness should prove that the nullifier value is currently 0 (not used)
        const [rootBefore, keyExists] = nullifierWitness.computeRootAndKey(Field(0));
        rootBefore.assertEquals(currentNullifierRoot, "Nullifier witness is invalid");
        
        // Verify the key in the witness matches our computed nullifier
        keyExists.assertEquals(nullifier, "Nullifier key mismatch");
        
        // Update the nullifier map - set the value to 1 to mark this student as having voted
        const [rootAfter, _] = nullifierWitness.computeRootAndKey(Field(1));
        
        // Update the nullifier root
        this.nullifierRoot.set(rootAfter);

        const newPetition = petition.incrementCount();
        this.petitionHash.set(newPetition.hash())
  }
}
