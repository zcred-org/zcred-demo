import { VoteStorage } from "../storages/vote.js";

export class VoteService {

  constructor(
    private readonly voteStorage: VoteStorage
  ) {}

  findVote(subjectId: string) {
    return this.voteStorage.findVote(subjectId);
  }

  setVote(subjectId: string, vote: string) {
    return this.voteStorage.setVote(subjectId, vote);
  }
}