import { FastifyInstance } from "fastify";
import { o1jsJal, Program } from "o1js-jal";
import fs from "fs";
import { ROOT_DIR } from "../util/index.js";
import { hash as sha256 } from "@stablelib/sha256";
import sortKeys from "sort-keys";
import * as u8a from "uint8arrays";

const PROGRAMS_DIR = new URL("./programs", ROOT_DIR);

function hashProgram(program: Program): string {
  const strProgram = JSON.stringify(sortKeys(program, { deep: true }));
  const hash = sha256(u8a.fromString(strProgram, "utf8"));
  return u8a.toString(hash, "base64url");
}

export function zkProgramController(
  config: {
    port: number,
    host: string
  },
  fastify: FastifyInstance
) {

  const domain = `http://${config.host}:${config.port.toString()}`;

  fastify.post<{ Body: Program }>("/api/zkprogram", async ({ body: program }) => {
    const programId = hashProgram(program);
    const jalProgram = o1jsJal.initProgram(program);
    if (!fs.existsSync(PROGRAMS_DIR)) {
      fs.mkdirSync(PROGRAMS_DIR);
    }
    const programPath = new URL(`./programs/${programId}.js`, ROOT_DIR);
    fs.writeFileSync(programPath, jalProgram.translate(), { flag: "w" });
    return {
      programURL: new URL(`./api/zkprogram/${programId}/program.js`, domain).href
    };
  });

  fastify.get<{ Params: { programId: string } }>(
    "/api/zkprogram/:programId/program.js",
    async ({ params: { programId } }, resp) => {
      const programPath = new URL(`./programs/${programId}.js`, ROOT_DIR);
      resp.header("Content-Type", "text/javascript");
      resp.statusCode = 200;
      resp.send(fs.readFileSync(programPath, "utf8"));
    }
  );
}