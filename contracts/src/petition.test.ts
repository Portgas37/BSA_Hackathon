import {
    Field,
    Mina,
    PrivateKey,
    PublicKey,
    Signature,
    Bool,
    MerkleMapWitness,
  } from 'o1js';
  import { Petition } from './petition';
  
  describe('Petition Contract', () => {
    let deployerKey: PrivateKey;
    let zkAppKey: PrivateKey;
    let petition: Petition;
    let zkAppAddress: PublicKey;
  
    beforeAll(async () => {
      // Set up a local blockchain for testing.
      const local = await Mina.LocalBlockchain();
      Mina.setActiveInstance(local);
      // Generate our own keys.
      deployerKey = PrivateKey.random();
      zkAppKey = PrivateKey.random();
      zkAppAddress = zkAppKey.toPublicKey();
      petition = new Petition(zkAppAddress);
  
      // Compile the contract first so that the verification key is cached.
      await Petition.compile();
  
      // Deploy the contract so that its account is created on-chain.
      await petition.deploy({ verificationKey: undefined });
      await Mina.getAccount(zkAppAddress);
    });
  
    it('should initialize with an empty signers root and 0 petition count', async () => {
      await Mina.getAccount(zkAppAddress);
      expect(petition.signersRoot.get().equals(Field(0))).toBeTruthy();
      expect(petition.petitionCount.get().equals(Field(0))).toBeTruthy();
    });
  
    it('should allow a valid student to sign a petition', async () => {
      // Set the university public key.
      const universityKey = PrivateKey.random();
      await petition.setUniversityKey(universityKey.toPublicKey());
  
      // Create a dummy student.
      const studentKey = PrivateKey.random();
      const studentPublicKey = studentKey.toPublicKey();
      const petitionId = Field(1);
  
      // Build the message (student's public key fields concatenated with petitionId)
      // and simulate the university signing.
      const message = [...studentPublicKey.toFields(), petitionId];
      const signature = Signature.create(universityKey, message);
  
      // Create a dummy witness.
      // In a real implementation, compute the witness from your local MerkleMap.
      const isLefts: boolean[] = []; // Dummy data – replace with actual witness booleans.
      const siblings: Field[] = [];   // Dummy data – replace with actual sibling nodes.
      const witness = new MerkleMapWitness(isLefts.map(b => new Bool(b)), siblings);
  
      await Mina.getAccount(zkAppAddress);
      const currentRoot = petition.signersRoot.get();
      const oldValue = Field(0);
  
      // Sign the petition.
      await petition.signPetition(
        studentPublicKey,
        signature,
        petitionId,
        currentRoot,
        oldValue,
        witness
      );
      await Mina.getAccount(zkAppAddress);
      expect(petition.petitionCount.get().equals(Field(1))).toBeTruthy();
    });
  
    it('should reject duplicate signing from the same student for the same petition', async () => {
      const petitionId = Field(2);
      const universityKey = PrivateKey.random();
      await petition.setUniversityKey(universityKey.toPublicKey());
  
      // Create a dummy student.
      const studentKey = PrivateKey.random();
      const studentPublicKey = studentKey.toPublicKey();
      const message = [...studentPublicKey.toFields(), petitionId];
      const signature = Signature.create(universityKey, message);
  
      // Create a dummy witness.
      const isLefts: boolean[] = [];
      const siblings: Field[] = [];
      const witness = new MerkleMapWitness(isLefts.map(b => new Bool(b)), siblings);
  
      await Mina.getAccount(zkAppAddress);
      const currentRoot = petition.signersRoot.get();
      const oldValue = Field(0);
      await petition.signPetition(
        studentPublicKey,
        signature,
        petitionId,
        currentRoot,
        oldValue,
        witness
      );
      await Mina.getAccount(zkAppAddress);
  
      // Attempt a second signing with the same student and petition.
      let duplicateSignFailed = false;
      try {
        await petition.signPetition(
          studentPublicKey,
          signature,
          petitionId,
          petition.signersRoot.get(), // using updated root
          Field(0),                   // expected 0, but should fail because already signed
          witness
        );
      } catch (err) {
        duplicateSignFailed = true;
      }
      expect(duplicateSignFailed).toBeTruthy();
    });
  });
  