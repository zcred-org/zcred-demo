import type {
  CreateProofReq,
  CreateProofResp,
  CreateProofResult,
  ErrorResp,
  WorkerInitReq,
  WorkerInitResp,
  WorkerResp
} from "./worker";
import { Program } from "o1js-jal";
import { PassportCred } from "@zcredjs/core";
import { contained } from "@/util/index";


function isCreateProofResp(data: unknown): data is CreateProofResp {
  console.log(data);
  const result = (
    typeof data === "object" &&
    data !== null &&
    contained("id", data) &&
    typeof data.id === "number" &&
    contained("verificationKey", data) &&
    typeof data.verificationKey === "string" &&
    contained("proof", data) &&
    typeof data.proof === "object" &&
    data.proof !== null &&
    contained("publicInput", data) &&
    typeof data.publicInput === "object" &&
    data.publicInput !== null);
  console.log(result);
  return result;
}

function isInitResp(data: unknown): data is WorkerInitResp {
  return (
    typeof data === "object" &&
    data !== null &&
    contained("id", data) &&
    typeof data.id === "number" &&
    contained("initialized", data) &&
    typeof data.initialized === "boolean");
}

function isErrorResp(data: unknown): data is ErrorResp {
  return (
    typeof data === "object" &&
    data !== null &&
    contained("error", data) &&
    typeof data.error === "string"
  );
}

export class ZkProgramProver {

  private readonly worker: Worker;
  private idCount: number;
  private readonly promises: {
    [id: number]: { resolve: (res: any) => void; reject: (err: any) => void };
  };
  private readonly initPromise: Promise<WorkerInitResp>;

  private constructor() {
    this.idCount = 1;
    this.promises = {};
    this.initPromise = new Promise((resolve, reject) => {
      this.promises[0] = { resolve, reject };
    });
    this.worker = new Worker(new URL(`./worker.ts`, import.meta.url));
    this.worker.onmessage = ({ data }: MessageEvent<WorkerResp>) => {
      if (isInitResp(data) || isCreateProofResp(data)) {
        this.promises[data.id].resolve(data);
        delete this.promises[data.id];

      } else if (isErrorResp(data)) {
        console.log(data.error);
      }
    };
  }

  static async createProof(program: Program, cred: PassportCred): Promise<CreateProofResult> {
    const prover = new ZkProgramProver();
    const { initialized } = await prover["initPromise"];
    if (!initialized) throw new Error(`ZK program prover not initialized`);
    const proofResp = await prover.createProof(program, cred);
    console.log("Proof resp", JSON.stringify(proofResp, null, 2));
    if (proofResp.error) {
      throw new Error(proofResp.error);
    }
    return proofResp;
  }

  async initialized(): Promise<boolean> {
    try {
      return new Promise<WorkerInitResp>((resolve, reject) => {
        this.promises[this.idCount] = { resolve, reject };
        const initReq: WorkerInitReq = {
          id: this.idCount,
        };
        this.worker.postMessage(initReq);
        this.idCount++;
      }).then((resp) => resp.initialized);
    } catch (e) {
      return false;
    }
  }

  async createProof(program: Program, cred: PassportCred): Promise<CreateProofResp> {
    try {
      return new Promise<CreateProofResp>((resolve, reject) => {
        this.promises[this.idCount] = { resolve, reject };
        const createProofReq: CreateProofReq = {
          id: this.idCount,
          program: program,
          cred: cred
        };
        this.idCount++;
        this.worker.postMessage(createProofReq);
      });
    } catch (e) {
      throw e;
    }
  }

  async terminate() {
    for (const promiseId of Object.keys(this.promises)) {
      delete this.promises[Number(promiseId)];
    }
    this.worker.terminate();
  }
}