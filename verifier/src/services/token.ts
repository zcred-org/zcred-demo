import { TokenStorage } from "../storages/token.js";
import { PublicInput } from "../types.js";
import { o1jsTrGraph } from "o1js-jal";

export class TokenService {

  constructor(
    readonly tokenStorage: TokenStorage
  ) {}

  async mint(publicInput: PublicInput): Promise<string | null> {
    const subjectId = publicInput.subject_id_key.toBase58();
    const aci = o1jsTrGraph.transform(
      publicInput.proofs_aci.toBigInt(),
      ["uint256-bytes", "bytes-base58"]);
    return await this.tokenStorage.setToken({ subjectId, aci });
  }

  async isMinted(subjectId: string): Promise<boolean> {
    return !!(await this.tokenStorage.findToken(subjectId));
  }

  async findToken(subjectId: string) {
    return this.tokenStorage.findToken(subjectId);
  }
}