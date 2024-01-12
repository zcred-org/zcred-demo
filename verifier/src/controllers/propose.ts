import { ZkProgramVerifier } from "../services/verifiers/zk-program.js";
import { FastifyInstance } from "fastify";
import { Config, Proposal } from "../types.js";
import { MINT_TOKEN_ENDPOINT } from "./token.js";


export function proposeController(
  config: Config,
  fastify: FastifyInstance,
  zkProgramVerifier: ZkProgramVerifier
) {

  const verifierURL = `http://${config.host}:${config.port}${MINT_TOKEN_ENDPOINT}`;

  fastify.get("/api/propose", async (): Promise<Proposal> => {
    return {
      verifierURL: verifierURL,
      program: zkProgramVerifier.program
    };
  });

}