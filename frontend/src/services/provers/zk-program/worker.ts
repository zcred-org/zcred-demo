import { o1jsJal, Program } from "o1js-jal";
import { JsonProof, Proof } from "o1js";
import { PassportCred } from "@zcredjs/core";
import { ZkHub } from "@/services/zk-hub";
import { PublicInputMapper } from "@/util/index.js";

export type CreateProofResult = {
  verificationKey: string;
  proof: JsonProof;
  publicInput: Record<string, any>
  error?: string;
}

async function createProof(program: Program, cred: PassportCred): Promise<CreateProofResult> {
  try {
    const { programURL } = await ZkHub.createProgram(program);
    const { zkProgram, PublicInput } = await import(programURL);
    console.log(`zk-program imported`);
    const { verificationKey } = await zkProgram.compile();
    console.log(`zk-program compiled`);
    const jalProgram = o1jsJal.initProgram(program);

    const unixNow = new Date().getTime();
    const unix19Now = unixNow + 2208988800000;

    const inputSetup = {
      private: {
        credential: cred
      },
      public: {
        context: {
          nowU19: unix19Now
        }
      }
    };
    const {
      privateInput,
      publicInput
    } = jalProgram.toInput<{ privateInput: any[], publicInput: Record<string, any> }>(inputSetup);
    console.log(`zk-program execute start`);
    const proof: Proof<any, void> = await zkProgram.execute(
      new PublicInput(publicInput),
      ...privateInput
    );
    console.log(`zk-program execute end`);
    return {
      verificationKey: verificationKey,
      proof: proof.toJSON(),
      publicInput: PublicInputMapper.toJson(publicInput)
    };
  } catch (e) {
    return {
      verificationKey: "",
      proof: { publicInput: [], publicOutput: [], proof: "", maxProofsVerified: 1 },
      publicInput: {},
      error: String(e)
    };
  }
}

export type CreateProofReq = {
  id: number;
  program: Program;
  cred: PassportCred;
}

export interface CreateProofResp extends CreateProofResult {
  id: number;
}

export type WorkerInitReq = {
  id: number;
}

export type WorkerInitResp = {
  id: number;
  initialized: boolean;
}

export type ErrorResp = {
  error: string
}

export type WorkerReq = CreateProofReq | WorkerInitReq;

export type WorkerResp = CreateProofResp | WorkerInitResp | ErrorResp;

function isCreateProofReq(data: unknown): data is CreateProofReq {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    typeof data.id === "number" &&
    "program" in data &&
    typeof data.program === "object" &&
    data.program !== null &&
    "cred" in data &&
    typeof data.cred === "object" &&
    data.cred !== null
  );
}

function isWorkerReq(data: unknown): data is WorkerReq {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    typeof data.id === "number"
  );
}


if (typeof window !== "undefined") {
  addEventListener(
    "message",
    async ({ data }: MessageEvent<WorkerReq>) => {
      if (!isWorkerReq(data)) {
        postMessage({
          error: "Incorrect worker request"
        } as ErrorResp);

      } else if (isCreateProofReq(data)) {
        const result = await createProof(data.program, data.cred);
        const resp: CreateProofResp = {
          ...result,
          id: data.id
        };
        postMessage(resp);

      } else {
        const resp: WorkerInitResp = {
          id: data.id,
          initialized: true
        };
        postMessage(resp);
      }
    }
  );
}

if (typeof window !== "undefined") {
  const resp: WorkerInitResp = {
    id: 0,
    initialized: true
  };
  postMessage(resp);
}
