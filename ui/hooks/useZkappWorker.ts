import * as Comlink from "comlink";

export default class ZkappWorkerClient {
  worker: Worker;
  remoteApi: Comlink.Remote<typeof import("../app/zkappWorker").api>;

  constructor() {
    this.worker = new Worker(new URL("../app/zkappWorker.ts", import.meta.url), { type: "module" });
    this.remoteApi = Comlink.wrap(this.worker);
  }

  async setActiveInstanceToDevnet() {
    // If needed, you can expose a method in your worker for devnet.
    // For now, our worker uses the local blockchain.
  }

  async loadContract() {
    // Not used in this worker since we already instantiate our contract in initialize()
  }

  async compileContract() {
    // Not used in this worker
  }

  async fetchAccount(publicKeyBase58: string) {
    // Not used in this worker
  }

  async initZkappInstance(publicKeyBase58: string) {
    // Not used in this worker
  }

  async getNum() {
    // Not used in this worker
  }

  async deployContract(petitionData: any) {
    return this.remoteApi.deployContract(petitionData);
  }

  async signPetition(petitionData: any, studentPublicKey: string) {
    return this.remoteApi.signPetition(petitionData, studentPublicKey);
  }
}
