import { o1jsJal, Program } from "o1js-jal";
import { JsonProof, Proof, verify } from "o1js";
import { PassportCred } from "@zcredjs/core";
import { JsonPublicInput, PublicInput } from "@/types/index";
import { contained, PublicInputMapper } from "@/util/index";

export type CreateProofResult = {
  verificationKey: string;
  proof: JsonProof;
  publicInput: JsonPublicInput
  error?: string;
}

async function createProof(program: Program, cred: PassportCred): Promise<CreateProofResult> {
  try {
    // const { programURL, programId } = await ZkHub.createProgram(program);
    const jalProgram = o1jsJal.initProgram(program);
    const {
      zkProgram,
      PublicInput    // @ts-ignore
    } = await import(`http://127.0.0.1:8081/api/zkprogram/zEy5WcEhtOQ_h7as6L6xhfsRZV6NpUA-eh7eWjTLKek.js`);
    console.log(`zk-program imported`);
    const { verificationKey } = await zkProgram.compile();
    console.log(`zk-program compiled`);

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
    } = jalProgram.toInput<{ privateInput: any[], publicInput: PublicInput }>(inputSetup);
    console.log(`zk-program execute start`);
    const proof: Proof<any, void> = await zkProgram.execute(
      new PublicInput(publicInput),
      ...privateInput
    );
    console.log(`zk-program execute end`);
    const verified = await verify(proof.toJSON(), verificationKey.data);
    console.log(`proof verified`, verified);
    return {
      verificationKey: verificationKey.data,
      proof: proof.toJSON(),
      publicInput: PublicInputMapper.toJson(publicInput)
    };
  } catch (e) {
    console.log(e);
    return {
      verificationKey: "",
      proof: { publicInput: [], publicOutput: [], proof: "", maxProofsVerified: 1 },
      publicInput: {} as JsonPublicInput,
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
    contained("id", data) &&
    typeof data.id === "number" &&
    contained("program", data) &&
    typeof data.program === "object" &&
    data.program !== null &&
    contained("cred", data) &&
    typeof data.cred === "object" &&
    data.cred !== null
  );
}

function isWorkerReq(data: unknown): data is WorkerReq {
  return (
    typeof data === "object" &&
    data !== null &&
    contained("id", data) &&
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
