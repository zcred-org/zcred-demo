import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { MINA_VERIFIER_PROGRAM, ZkProgramVerifier } from "./services/verifiers/zk-program.js";
import { tokenController } from "./controllers/token.js";
import { TokenService } from "./services/token.js";
import { TokenStorage } from "./storages/token.js";
import { proposeController } from "./controllers/propose.js";
import { type Config } from "./types.js";


export class App {
  readonly fastify: FastifyInstance;
  readonly config: Config;
  private _zkProgramVerifier?: ZkProgramVerifier;
  private _tokenService?: TokenService;
  initialize: boolean;

  get zkProgramVerifier() {
    if (this._zkProgramVerifier) return this._zkProgramVerifier;
    throw new Error(`Initialize application first`);
  }

  get tokenService() {
    if (this._tokenService) return this._tokenService;
    throw new Error(`Initialize application first`);
  }

  constructor() {
    this.fastify = Fastify({ logger: true });
    this.fastify.register(cors, { origin: "*" });
    this.config = {
      port: 8082,
      host: "127.0.0.1"
    };
    this.initialize = false;
  }

  static async init(): Promise<App> {
    const app = new App();
    app._zkProgramVerifier = await ZkProgramVerifier.init(MINA_VERIFIER_PROGRAM);
    app._tokenService = new TokenService(new TokenStorage());
    tokenController(
      app.fastify,
      app.zkProgramVerifier,
      app.tokenService
    );
    proposeController(
      app.config,
      app.fastify,
      app.zkProgramVerifier
    );
    app.initialize = true;
    return app;
  }

  async run() {
    if (!this.initialize) {
      throw new Error(`Initialize application first`);
    }
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