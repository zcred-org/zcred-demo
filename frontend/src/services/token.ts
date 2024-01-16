import { ProofInfo, TokenResp } from "@/types/index";
import { VerifierService } from "@/services/verifier";

export class TokenService {

  static readonly MINT_ENDPOINT = new URL(`http://127.0.0.1:8082/api/token/mint`);

  static async mintToken(proofInfo: ProofInfo): Promise<TokenResp> {
    return VerifierService.verify<TokenResp>({
      verifierURL: TokenService.MINT_ENDPOINT.href,
      proofInfo: proofInfo
    });
  }

  static async getToken(subjectId: string): Promise<TokenResp | null> {
    const endpoint = new URL(`http://127.0.0.1:8082/api/token/${subjectId}`);
    const getTokenResp = await fetch(endpoint);
    if (getTokenResp.status === 400) {
      const body = await getTokenResp.json();
      console.log(body.message);
      return null;
    }
    if (getTokenResp.ok) {
      return getTokenResp.json();
    }
    const text = await getTokenResp.text();
    throw new Error(
      `Get token response error. URL: ${endpoint.href}, body: ${text}`
    );
  }
}