import type { Program } from "o1js-jal";
import { CreateProgramResp } from "@/types/index";

export class ZkHub {

  static async createProgram(program: Program): Promise<CreateProgramResp> {

    const createEndpoint = new URL("http://localhost:8081/api/zkprogram");
    const createResp = await fetch(createEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(program)
    });
    if (!createResp.ok) {
      const message = `Create zk-program response error. URL: "${createEndpoint.href}", body: ${await createResp.text()}`;
      console.log(message);
      throw new Error(message);
    }
    return (await createResp.json()) as { programURL: string };
  }
}