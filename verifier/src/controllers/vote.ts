import { FastifyInstance } from "fastify";
import { TokenService } from "../services/token.js";
import { VoteService } from "../services/vote.js";


export function voteController(
  fastify: FastifyInstance,
  tokenService: TokenService,
  voteService: VoteService
) {

  fastify.post<{ Body: { subjectId: string; vote: string } }>("/api/vote", async ({ body }, resp) => {
    const token = await tokenService.findToken(body.subjectId);
    if (!token) {
      resp.statusCode = 400;
      return { message: "You have no token" };
    }
    const vote = voteService.findVote(body.subjectId);
    if (vote) {
      resp.statusCode = 400;
      return { message: "You've already voted" };
    }
    voteService.setVote(body.subjectId, body.vote);
    return { message: "The vote has been accepted" };
  });
}