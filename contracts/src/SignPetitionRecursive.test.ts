import {
    Field,
    PublicKey,
    Signature,
    PrivateKey,
    ZkProgram,
    Bool,
    Mina,
    AccountUpdate,
    CircuitString,
    verify,
    MerkleMap,
    MerkleMapWitness,
    Nullifier,
    Struct,
    method,
} from "o1js";
import { Petition } from "./PetitionRecursive";
import SignAggregationNamespace, { PublicInputs1, SignPetitions, SignProofProgram } from "./SignPetitionRecursive";
import SignProofNamespace from "./SignPetitionRecursive";
import fs from "fs/promises";



describe("Sign Aggregation Tests", () => {
    test("should create and verify proofs correctly", async () => {
        console.log("Starting Sign Aggregation Tests...");

        // Initialize Local Blockchain
        const useProof = false;
        const Local = await Mina.LocalBlockchain({ proofsEnabled: useProof });
        Mina.setActiveInstance(Local);
        const deployerAccount = Local.testAccounts[0];
        const deployerKey = deployerAccount.key;
        const senderAccount = Local.testAccounts[1];
        const senderKey = senderAccount.key;

        // Generate test keys
        const studentPrivateKey = PrivateKey.random();
        const studentPublicKey = studentPrivateKey.toPublicKey();

        // Create a petition instance
        let petition = new Petition({
            petitionId: Field(1),
            title: CircuitString.fromString('Test Petition'),
            description: CircuitString.fromString('This is a test petition'),
            petitionCount: Field(0),
            isActive: Bool(true)
        });

        // Initialize nullifier Merkle Map
        const nullifierMap = new MerkleMap();
        const nullifier = Nullifier.fromJSON(
            Nullifier.createTestNullifier(studentPublicKey.toFields(), studentPrivateKey)
        );

        // Create a nullifier witness
        const nullifierWitness = nullifierMap.getWitness(nullifier.key());

        
        // Create the proofs public inputs
        const publicInput = new PublicInputs1({
            universityPublicKey: SignPetitions.universityPublicKey
        });

        await SignProofProgram.compile();
        let signProof = (await SignProofProgram.verifier(publicInput, studentPublicKey, nullifier,
            Signature.create(SignPetitions.universityKey, studentPublicKey.toFields()))).proof;

        // Create the proofs public inputs
        const publicInput1 = new SignAggregationNamespace.PublicInputs({
            petition: petition,
            signProof: signProof,
        });

        console.log("Compiling zkProgram...");
        await SignAggregationNamespace.SignAggregationProgram.compile();

        let baseEmptyProof;

        // Check if we have previous proofs stored
        try {
            const proofJson = await fs.readFile("signAggregationProof.json");
            baseEmptyProof = await SignAggregationNamespace.Proof.fromJSON(
                JSON.parse(proofJson.toString())
            );
            console.log("Loaded existing proof from file");
        } catch (error) {
            console.log("No existing proof found. Creating base_empty proof...");
            baseEmptyProof = (await SignAggregationNamespace.SignAggregationProgram.base_empty(publicInput1)).proof;
            console.log("Base empty proof created:", baseEmptyProof.toJSON());
        }

        // Base Case: First Signature
        console.log("Creating append_signature proof...");
        const appendSignatureProof = await SignAggregationNamespace.SignAggregationProgram.append_signature(
            publicInput1,
            baseEmptyProof,
            nullifierWitness
        );
        console.log("Append signature proof created:", appendSignatureProof.proof.toJSON());


        // Deploy Smart Contract
        console.log("Deploying smart contract...");
        const zkAppPrivateKey = PrivateKey.random();
        const zkAppAddress = zkAppPrivateKey.toPublicKey();
        const zkAppInstance = new SignPetitions(zkAppAddress);

        const deployTxn = await Mina.transaction(deployerAccount, async () => {
            AccountUpdate.fundNewAccount(deployerAccount);
            await zkAppInstance.deploy();
            await zkAppInstance.initState(petition);
        });
        await deployTxn.prove();
        await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();
        console.log("Smart contract deployed successfully.");

        // Get initial petition count
        const initialCount = petition.petitionCount;
        console.log("Initial Petition Count:", initialCount.toString());

        // Submit proof to smart contract
        console.log("Submitting proof to smart contract...");
        const submitTxn = await Mina.transaction(senderAccount, async () => {
            await zkAppInstance.submitProof(appendSignatureProof.proof);
        });
        await submitTxn.prove();
        await submitTxn.sign([senderKey]).send();
        console.log("Proof successfully submitted to smart contract!");

        // Retrieve updated petition count
        const updatedPetition = zkAppInstance.petitionHash.get();
        console.log("Updated Petition Count:", updatedPetition.toString());
        expect(updatedPetition).not.toEqual(initialCount);

        // ❌ Attempt to sign again (should fail)
        console.log("Trying to sign again (should fail)...");
        let errorCaught = false;
        try {
            const doubleSignProof = await SignAggregationNamespace.SignAggregationProgram.append_signature(
                publicInput1,
                appendSignatureProof.proof,
                nullifierWitness
            );
            console.log("Second signature proof created:", doubleSignProof.proof.toJSON());
        } catch (error) {
            errorCaught = true;
            console.log("❌ Duplicate signature prevented!");
        }
        expect(errorCaught).toBe(true);
    });
});
