import type { Proposal, VerifyReq } from "@/types/index";

export class VerifierService {

  static readonly PROPOSE_URL = `http://127.0.0.1:8082/api/propose`;

  private constructor() {}

  static async getProposal(proposeURL: string): Promise<Proposal> {
    const endpoint = new URL(proposeURL);
    const resp = await fetch(endpoint);
    if (resp.ok) return resp.json();
    const message = `Get proposal response error. URL: ${endpoint.href}, body: ${await resp.text()}`;
    console.log(message);
    throw new Error(message);
  }

  static async verify<TOut = unknown>({ proofInfo, verifierURL }: VerifyReq): Promise<TOut> {
    const endpoint = new URL(verifierURL);
    const resp = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(proofInfo)
    });
    if (resp.ok) return resp.json();
    const message = `Verify zk-proof response error. URL: ${endpoint.href}, body: ${await resp.text()}`;
    console.log(message);
    throw new Error(message);
  }
}