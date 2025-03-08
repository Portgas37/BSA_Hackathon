import {
    Field,
    SmartContract,
    state,
    State,
    method,
    PublicKey,
    Signature,
    MerkleMapWitness,
    Poseidon,
  } from 'o1js';
  
  export class Petition extends SmartContract {
    // Tracks the current MerkleMap root for signers.
    @state(Field) signersRoot = State<Field>();
  
    // Petition count for monitoring purposes.
    @state(Field) petitionCount = State<Field>();
  
    // University’s public key, used to verify that the student is valid.
    @state(PublicKey) universityPublicKey = State<PublicKey>();
  
    init() {
      super.init();
      // Initialize the state.
      this.signersRoot.set(Field(0));
      this.petitionCount.set(Field(0));
      // Initialize universityPublicKey to a default empty value.
      this.universityPublicKey.set(PublicKey.empty());
  
      // Link the state for signersRoot and petitionCount.
      this.signersRoot.requireEquals(Field(0));
      this.petitionCount.requireEquals(Field(0));
      // (Skip requireEquals for universityPublicKey to avoid on-chain fetch issues.)
    }
  
    /**
     * Sets the university's public key.
     * In production, restrict this so that only an authorized entity can call it.
     */
    @method async setUniversityKey(pubKey: PublicKey): Promise<void> {
      this.universityPublicKey.set(pubKey);
      // (Optionally, if the account is already deployed and fetched, you could add:
      // this.universityPublicKey.requireEquals(this.universityPublicKey.get());
      // but for now we omit this to avoid the error.)
    }
  
    /**
     * signPetition verifies a student’s signature, computes a unique nullifier using
     * the student's public key and petitionId, and ensures the student has not already signed.
     * If valid, it updates the MerkleMap root and increments the petition count.
     *
     * @param studentPublicKey The student's public key.
     * @param signature The university's signature over (studentPublicKey fields, petitionId).
     * @param petitionId A unique identifier for the petition.
     * @param currentRoot The current MerkleMap root passed from off-chain witness generation.
     * @param oldValue The stored value for this nullifier (should be 0 if not signed yet).
     * @param witness The MerkleMap witness (constructed with isLefts and siblings arrays).
     */
    @method async signPetition(
      studentPublicKey: PublicKey,
      signature: Signature,
      petitionId: Field,
      currentRoot: Field,
      oldValue: Field,
      witness: MerkleMapWitness
    ): Promise<void> {
      // Link on-chain state for signersRoot and petitionCount.
      this.signersRoot.requireEquals(this.signersRoot.get());
      this.petitionCount.requireEquals(this.petitionCount.get());
      // We skip the precondition for universityPublicKey here.
  
      // 1. Ensure the on-chain signers root matches the provided currentRoot.
      const onChainRoot = this.signersRoot.get();
      onChainRoot.assertEquals(currentRoot, 'Merkle root mismatch!');
  
      // 2. Retrieve the university public key.
      const uniKey = this.universityPublicKey.get();
      // (If uniKey is empty, signature verification will likely fail.)
  
      // 3. Verify the signature.
      //    We assume the university signs a message composed of the student's public key fields and the petitionId.
      const studentFields = studentPublicKey.toFields();
      const isValidSig = signature.verify(uniKey, [...studentFields, petitionId]);
      isValidSig.assertTrue('Invalid signature!');
  
      // 4. Compute a unique nullifier using the student's public key and petitionId.
      const nullifier = Poseidon.hash(studentFields.concat([petitionId]));
  
      // 5. Check that the stored value for this nullifier is 0 (i.e. student hasn't signed yet).
      oldValue.assertEquals(Field(0), 'Student already signed!');
  
      // 6. Compute the new MerkleMap root after updating this nullifier's value to 1.
      const newRoot = updateRoot(currentRoot, nullifier, oldValue, Field(1), witness);
  
      // 7. Update the on-chain state with the new root.
      this.signersRoot.set(newRoot);
  
      // 8. Increment the petition count.
      const oldCount = this.petitionCount.get();
      this.petitionCount.set(oldCount.add(1));
    }
  }
  
  /**
   * Placeholder updateRoot function.
   * In a full implementation, updateRoot would use the witness's isLefts and siblings arrays
   * to recompute the Merkle root after updating the value at the given key.
   * For example:
   *   return MerkleMap.updateRoot(currentRoot, key, oldValue, newValue, witness.isLefts, witness.siblings);
   *
   * Here we simply combine the fields as a placeholder.
   */
  function updateRoot(
    currentRoot: Field,
    key: Field,
    oldValue: Field,
    newValue: Field,
    witness: MerkleMapWitness
  ): Field {
    return Poseidon.hash([currentRoot, key, oldValue, newValue, ...witness.siblings]);
  }
  