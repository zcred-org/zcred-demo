import fs from "node:fs";

const VOTES_PATH = new URL("./votes.map.json", import.meta.url);

export class VoteStorage {

  private readonly votes: Record<string, string>;

  constructor() {
    if (!fs.existsSync(VOTES_PATH)) {
      this.votes = {};
      fs.writeFileSync(
        VOTES_PATH,
        JSON.stringify(this.votes, null, 2),
        { flag: "w" });
    } else {
      const content = fs.readFileSync(VOTES_PATH, { encoding: "utf8" });
      this.votes = JSON.parse(content) as Record<string, string>;
    }
  }

  findVote(subjectId: string): string | undefined {
    return this.votes[subjectId];
  }

  setVote(subjectId: string, vote: string) {
    this.votes[subjectId] = vote;
    fs.writeFileSync(
      VOTES_PATH,
      JSON.stringify(this.votes, null, 2),
      { flag: "w" });
    return vote;
  }
}