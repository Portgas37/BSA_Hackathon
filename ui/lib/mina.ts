import { Mina, PrivateKey, AccountUpdate } from 'o1js';
import { SignPetitions, Petition } from '../../contracts';

// Initialize Mina Blockchain
const Local = await Mina.LocalBlockchain({ proofsEnabled: true });
Mina.setActiveInstance(Local);
const [deployerAccount] = Local.testAccounts;

const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

const zkApp = new SignPetitions(zkAppAddress);

export async function deployZkApp(petition: Petition) {
  const txn = await Mina.transaction(deployerAccount, async () => {
    AccountUpdate.fundNewAccount(deployerAccount);
    await zkApp.deploy();
  });
  await txn.prove();
  await txn.sign([deployerAccount.key, zkAppPrivateKey]).send();

  // Initialize zkApp State
  const initTxn = await Mina.transaction(deployerAccount, async () => {
    await zkApp.initState(petition.hash());
  });
  await initTxn.prove();
  await initTxn.sign([deployerAccount.key, zkAppPrivateKey]).send();
}

export { zkApp, zkAppAddress, zkAppPrivateKey };
