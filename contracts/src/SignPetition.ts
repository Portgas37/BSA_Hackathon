import { Field, SmartContract, state, State, method, PublicKey, Signature, PrivateKey } from 'o1js';

import { Petition } from './Petition';

export class SignPetitions extends SmartContract {
    
    static universityKey: PrivateKey = PrivateKey.random();
    static get universityPublicKey(): PublicKey {
    return SignPetitions.universityKey.toPublicKey();
  }
  
    
    
    @state(Field) petitionHash = State<Field>();

    @method async initState(petitionHash: Field) {
        // Initialize the petition hash to a default value.
        this.petitionHash.set(petitionHash);
        this.petitionHash.requireEquals(petitionHash);
    }

    @method async vote(
        signature: Signature,
        studentPublicKey: PublicKey,
        petition: Petition
    ): Promise<void> {
        this.petitionHash.requireEquals(this.petitionHash.get());
        this.petitionHash.get().assertEquals(petition.hash(), "Petition hash mismatch!");
        

        const isValidSignature = signature.verify(SignPetitions.universityPublicKey, studentPublicKey.toFields());
        isValidSignature.assertTrue("Invalid signature!");

        const newPetition = petition.incrementCount();
        this.petitionHash.set(newPetition.hash())
  }
}
