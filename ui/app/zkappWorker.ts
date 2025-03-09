import {
    Mina,
    PrivateKey,
    PublicKey,
    Signature,
    AccountUpdate,
    Field,
    Bool,
    CircuitString,
    MerkleMap,
    Poseidon,
  } from "o1js";
  import { SignPetitions, Petition } from "../../contracts";
  import * as Comlink from "comlink";
  
  // Global state object to hold keys and instances
  const state = {
    deployerKey: null as null | PrivateKey,
    deployerPublicKey: null as null | PublicKey,
    zkApp: null as null | SignPetitions,
    zkAppPrivateKey: null as null | PrivateKey,
    nullifierMap: null as null | MerkleMap,
  };
  
  async function initialize() {
    // For development; change to Mina.Devnet if needed.
    const Local = await Mina.LocalBlockchain({ proofsEnabled: false });
    Mina.setActiveInstance(Local);
    
    state.deployerKey = Local.testAccounts[0].key;
    state.deployerPublicKey = state.deployerKey.toPublicKey();
    state.zkAppPrivateKey = PrivateKey.random();
    const zkAppPublicKey = state.zkAppPrivateKey.toPublicKey();
    state.zkApp = new SignPetitions(zkAppPublicKey);
    state.nullifierMap = new MerkleMap();
    
    console.log("[Worker] Initialization complete.");
    return "Initialized";
  }
  
  async function deployContract(petitionData: any) {
    // Expect petitionData to be a plain object with primitive types.
    const txn = await Mina.transaction(state.deployerPublicKey!, async () => {
      AccountUpdate.fundNewAccount(state.deployerPublicKey!);
      await state.zkApp!.deploy();
    });
    await txn.prove();
    await txn.sign([state.deployerKey!, state.zkAppPrivateKey!]).send();
  
    const initTxn = await Mina.transaction(state.deployerPublicKey!, async () => {
      const myPetition = new Petition({
        petitionId: Field(Number(petitionData.petitionId)),
        title: CircuitString.fromString(String(petitionData.title)),
        description: CircuitString.fromString(String(petitionData.description)),
        petitionCount: Field(Number(petitionData.petitionCount)),
        isActive: Bool(petitionData.isActive === true || petitionData.isActive === "true"),
      });
      await state.zkApp!.initState(myPetition.hash());
    });
    await initTxn.prove();
    await initTxn.sign([state.deployerKey!, state.zkAppPrivateKey!]).send();
    return "Contract Deployed";
  }
  
  async function signPetition(petitionData: any, pubKey58: string) {
    console.log("[Worker] signPetition called with data:", petitionData);
    console.log("[Worker] studentPublicKey (raw):", pubKey58);
  
    try {
      // If petitionData is a string, parse it; otherwise assume it's already an object.
      if (typeof petitionData === "string") {
        petitionData = JSON.parse(petitionData);
      }
      
      // Debug logs for petition fields
      console.log("[Worker] petitionData.petitionId (type,value):", typeof petitionData.petitionId, petitionData.petitionId);
      console.log("[Worker] petitionData.title (type,value):", typeof petitionData.title, petitionData.title);
      console.log("[Worker] petitionData.description (type,value):", typeof petitionData.description, petitionData.description);
      console.log("[Worker] petitionData.petitionCount (type,value):", typeof petitionData.petitionCount, petitionData.petitionCount);
      console.log("[Worker] petitionData.isActive (type,value):", typeof petitionData.isActive, petitionData.isActive);
  
      // Convert petitionData fields to proper types
      const petitionIdNum = Number(petitionData.petitionId);
      const petitionCountNum = Number(petitionData.petitionCount);
      if (isNaN(petitionIdNum) || isNaN(petitionCountNum)) {
        throw new Error("[Worker] petitionId or petitionCount is NaN!");
      }
      
      const myPetition = new Petition({
        petitionId: Field(petitionIdNum),
        title: CircuitString.fromString(String(petitionData.title)),
        description: CircuitString.fromString(String(petitionData.description)),
        petitionCount: Field(petitionCountNum),
        isActive: Bool(petitionData.isActive === true || petitionData.isActive === "true"),
      });
      console.log("[Worker] Constructed Petition:", myPetition);
  
      // Convert student public key from base58
      let studentPubKey: PublicKey;
      try {
        studentPubKey = PublicKey.fromBase58(pubKey58);
      } catch (error) {
        throw new Error(`[Worker] Invalid student public key: ${pubKey58}`);
      }
      console.log("[Worker] Student Public Key:", studentPubKey.toBase58());
  
      // Map the student public key fields to ensure they're proper Field objects.
      const pkFields = studentPubKey.toFields().map((f) => Field(f.toBigInt()));
      console.log("[Worker] Student Public Key Fields:", pkFields.map(f => f.toString()));
  
      // Create the signature using the university's key.
      console.log("[Worker] Creating signature...");
      console.log("[Worker] University Key (base58):", SignPetitions.universityKey.toBase58());
      const signature = Signature.create(SignPetitions.universityKey, pkFields);
      console.log("[Worker] Signature created:", signature.toBase58());
  
      // Compute the nullifier.
      const nullifier = Poseidon.hash([...pkFields, myPetition.petitionId]);
      console.log("[Worker] Nullifier:", nullifier.toString());
  
      const witness = state.nullifierMap!.getWitness(nullifier);
      console.log("[Worker] Witness obtained");
  
      const voteTxn = await Mina.transaction(state.deployerPublicKey!, async () => {
        state.zkApp!.vote(signature, studentPubKey, myPetition, witness);
      });
      await voteTxn.prove();
      await voteTxn.sign([state.deployerKey!]).send();
      console.log("[Worker] Vote transaction sent.");
  
      state.nullifierMap!.set(nullifier, Field(1));
      console.log("[Worker] Nullifier set. signPetition finished.");
  
      // Return success with the signature serialized as base58.
      postMessage({ status: "Petition Signed", signature: signature.toBase58() });
    } catch (error) {
      console.error("[Worker] Error in signPetition:", error);
      if (error instanceof Error) {
        postMessage({ status: "Error", error: error.message });
      } else {
        postMessage({ status: "Error", error: String(error) });
      }
      throw error;
    }
  }
  
  
  
  // Expose our API via Comlink so the UI can call these methods.
  export const api = {
    initialize,
    deployContract,
    signPetition,
  };
  
  await initialize();
  Comlink.expose(api);
  