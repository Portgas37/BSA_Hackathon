import { Field, SmartContract, state, State, method, PublicKey, Signature } from 'o1js';

import { Petition } from './Petition';

export class SignPetitions extends SmartContract {
    
    static universityPublicKey = PublicKey.fromBase58("B62qkC7xvYVg8xwJjksomeExamplePublicKeyString");
    
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
        this.petitionHash.get().assertEquals(petition.hash(), "Petition hash mismatch!");

        const isValidSignature = signature.verify(SignPetitions.universityPublicKey, studentPublicKey.toFields());
        isValidSignature.assertTrue("Invalid signature!");

        const newPetition = petition.incrementCount();
        this.petitionHash.set(newPetition.hash())
  }
}
