import * as Comlink from "comlink";

type WorkerApi = typeof import("../app/zkappWorker").api;

export default class ZkappWorkerClient {
  worker: Worker;
  remoteApi: Comlink.Remote<WorkerApi>;

  constructor() {
    this.worker = new Worker(new URL("../app/zkappWorker.ts", import.meta.url), {
      type: "module",
    });
    this.remoteApi = Comlink.wrap(this.worker);
  }

  async deployContract(petitionData: unknown) {
    return this.remoteApi.deployContract(petitionData);
  }

  async signPetition(petitionData: unknown, studentPublicKey: string) {
    return this.remoteApi.signPetition(petitionData, studentPublicKey);
  }
}
