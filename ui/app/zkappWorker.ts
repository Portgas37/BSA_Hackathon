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

interface WorkerState {
  deployerKey: PrivateKey | null;
  deployerPublicKey: PublicKey | null;
  zkApp: SignPetitions | null;
  zkAppPrivateKey: PrivateKey | null;
  nullifierMap: MerkleMap | null;
}

const state: WorkerState = {
  deployerKey: null,
  deployerPublicKey: null,
  zkApp: null,
  zkAppPrivateKey: null,
  nullifierMap: null,
};

async function initialize() {
  const Local = await Mina.LocalBlockchain({ proofsEnabled: false });
  Mina.setActiveInstance(Local);

  state.deployerKey = Local.testAccounts[0].key;
  state.deployerPublicKey = state.deployerKey.toPublicKey();
  state.zkAppPrivateKey = PrivateKey.random();
  const zkAppPublicKey = state.zkAppPrivateKey.toPublicKey();
  state.zkApp = new SignPetitions(zkAppPublicKey);
  state.nullifierMap = new MerkleMap();

  return "Initialized";
}

interface PetitionData {
  petitionId: string;
  title: string;
  description: string;
  petitionCount: string;
  isActive: string | boolean;
}

async function deployContract(petitionData: PetitionData) {
  const txn = await Mina.transaction(state.deployerPublicKey!, async () => {
    AccountUpdate.fundNewAccount(state.deployerPublicKey!);
    await state.zkApp!.deploy();
  });
  await txn.prove();
  await txn.sign([state.deployerKey!, state.zkAppPrivateKey!]).send();

  const initTxn = await Mina.transaction(state.deployerPublicKey!, async () => {
    const petition = new Petition({
      petitionId: Field(Number(petitionData.petitionId)),
      title: CircuitString.fromString(String(petitionData.title)),
      description: CircuitString.fromString(String(petitionData.description)),
      petitionCount: Field(Number(petitionData.petitionCount)),
      isActive: Bool(petitionData.isActive === true || petitionData.isActive === "true"),
    });
    await state.zkApp!.initState(petition.hash());
  });
  await initTxn.prove();
  await initTxn.sign([state.deployerKey!, state.zkAppPrivateKey!]).send();

  return "Contract Deployed";
}

async function signPetition(petitionDataRaw: string | PetitionData, pubKey58: string) {
  try {
    const petitionData: PetitionData =
      typeof petitionDataRaw === "string" ? JSON.parse(petitionDataRaw) : petitionDataRaw;

    const petition = new Petition({
      petitionId: Field(Number(petitionData.petitionId)),
      title: CircuitString.fromString(String(petitionData.title)),
      description: CircuitString.fromString(String(petitionData.description)),
      petitionCount: Field(Number(petitionData.petitionCount)),
      isActive: Bool(petitionData.isActive === true || petitionData.isActive === "true"),
    });

    const studentPubKey = PublicKey.fromBase58(pubKey58);
    const pkFields = studentPubKey.toFields().map((f) => Field(f.toBigInt()));

    const signature = Signature.create(SignPetitions.universityKey, pkFields);
    const nullifier = Poseidon.hash([...pkFields, petition.petitionId]);
    const witness = state.nullifierMap!.getWitness(nullifier);

    const voteTxn = await Mina.transaction(state.deployerPublicKey!, async () => {
      state.zkApp!.vote(signature, studentPubKey, petition, witness);
    });
    await voteTxn.prove();
    await voteTxn.sign([state.deployerKey!]).send();

    state.nullifierMap!.set(nullifier, Field(1));

    return { status: "Petition Signed", signature: signature.toBase58() };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { status: "Error", error: message };
  }
}

export const api = {
  initialize,
  deployContract,
  signPetition,
};

await initialize();
Comlink.expose(api);
