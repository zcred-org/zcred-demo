import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { zkProgramController } from "./controllers/zkprogram.js";

type Config = {
  port: number;
  host: string;
}

export class App {
  readonly fastify: FastifyInstance;
  readonly config: Config;

  constructor() {
    this.fastify = Fastify({ logger: true });
    this.fastify.register(cors, { origin: "*" });
    this.config = {
      port: 8081,
      host: "127.0.0.1"
    };
    zkProgramController(this.config, this.fastify);
  }

  async run() {
    try {
      await this.fastify.listen(this.config);
    } catch (err) {
      this.fastify.log.error(err);
      process.exit(1);
    }
  }

  async close() {
    await this.fastify.close();
  }
}