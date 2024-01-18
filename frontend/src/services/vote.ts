export class VoteService {

  static async vote(subjectId: string, vote: "blue" | "red"): Promise<{ message: string, isVoted: boolean }> {
    const response = await fetch(new URL("http://localhost:8082/api/vote"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        subjectId: subjectId,
        vote: vote
      })
    });
    if (response.ok) {
      const body = await response.json();
      return { ...body, isVoted: true };
    }
    if (response.status === 400) {
      const body = await response.json();
      return { ...body, isVoted: false };
    } else {
      const message = `Http request error: status code ${response.status}; body: ${await response.text()}`;
      console.log(message);
      throw new Error(message);
    }
  }
}