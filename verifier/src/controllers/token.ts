import { FastifyInstance } from "fastify";
import { ZkProgramVerifier } from "../services/verifiers/zk-program.js";
import { VerifyArgs } from "../types.js";
import { TokenService } from "../services/token.js";
import { PublicInputMapper } from "../util/index.js";


export const MINT_TOKEN_ENDPOINT = "/api/token/mint";

export function tokenController(
  fastify: FastifyInstance,
  zkProgramVerifier: ZkProgramVerifier,
  tokenService: TokenService
) {

  fastify.post<{ Body: VerifyArgs }>(MINT_TOKEN_ENDPOINT, async ({ body }, resp) => {
    const publicInput = PublicInputMapper.fromJson(body.publicInput);
    const verified = await zkProgramVerifier.verifyProof({
      ...body,
      publicInput: publicInput
    });
    if (!verified) {
      resp.statusCode = 400;
      return { message: `Can not verify zk-proof` };
    }

    const token = await tokenService.mint(publicInput);
    if (!token) {
      resp.statusCode = 400;
      return { message: `You already got token` };
    }
    return {
      token: token
    };
  });

  fastify.get<{ Params: { subjectId: string } }>(
    "/api/token/:subjectId",
    async ({ params: { subjectId } }, resp) => {
      const token = await tokenService.findToken(subjectId);
      if (!token) {
        resp.statusCode = 400;
        return { message: `Subject with id "${subjectId}" has not token` };
      }
      return {
        token: token
      };
    }
  );
}