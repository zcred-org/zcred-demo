import { suite } from "uvu";
import { App } from "../../src/app.js";
import { FastifyInstance } from "fastify";
import * as a from "uvu/assert";
import { Config, Proposal, VerifyArgs } from "../../src/types.js";
import { o1jsJal } from "o1js-jal";
import fs from "node:fs";
import { Proof } from "o1js";
import { MINT_TOKEN_ENDPOINT } from "../../src/controllers/token.js";
import { TokenStorage } from "../../src/storages/token.js";
import { PublicInputMapper } from "../../src/util/index.js";

const CREDENTIAL = {
  "attributes": {
    "type": "passport",
    "issuanceDate": "2024-01-09T11:40:47.263Z",
    "validFrom": "2020-01-15",
    "validUntil": "2030-01-31T21:00:00.000Z",
    "subject": {
      "id": {
        "type": "mina:publickey",
        "key": "B62qp62CfUc8qQ3Eo28g6fAu4uiN5Ts2zmotMrZRdoSrzuw1SBX1bpo"
      },
      "firstName": "JOHN",
      "lastName": "SMITH",
      "birthDate": "2000-01-01",
      "gender": "male",
      "countryCode": "USA",
      "document": {
        "id": "M-6131821-07"
      }
    }
  },
  "proofs": {
    "mina:poseidon-pasta": {
      "mina:publickey:B62qmNen3kDN74CJ2NQteNABrEN4AurGTbsLrraPy6ipQgUV9Q73tv2": {
        "type": "mina:poseidon-pasta",
        "issuer": {
          "id": {
            "type": "mina:publickey",
            "key": "B62qmNen3kDN74CJ2NQteNABrEN4AurGTbsLrraPy6ipQgUV9Q73tv2"
          }
        },
        "signature": "7mX4HzeYStmUna1bc76ZVEKqoesCqzjJwjJiLhXMzi4sxpLxEXR95Ex4iNbZBi422XgxUDZVMdsWZguaqx15biCbRrfXGeNh",
        "schema": {
          "attributes": {
            "issuanceDate": ["isodate-unixtime", "unixtime-uint64", "uint64-mina:field"],
            "subject": {
              "birthDate": ["isodate-unixtime19", "unixtime19-uint64", "uint64-mina:field"],
              "countryCode": ["iso3166alpha3-iso3166numeric", "iso3166numeric-uint16", "uint16-mina:field"],
              "document": {
                "id": ["utf8-bytes", "bytes-uint", "mina:mod.order", "uint-mina:field"]
              },
              "firstName": ["utf8-bytes", "bytes-uint", "mina:mod.order", "uint-mina:field"],
              "gender": ["ascii-bytes", "bytes-uint64", "uint64-mina:field"],
              "id": {
                "key": ["base58-mina:publickey", "mina:publickey-mina:fields"],
                "type": ["ascii-bytes", "bytes-uint128", "uint128-mina:field"]
              },
              "lastName": ["utf8-bytes", "bytes-uint", "mina:mod.order", "uint-mina:field"]
            },
            "type": ["ascii-bytes", "bytes-uint128", "uint128-mina:field"],
            "validFrom": ["isodate-unixtime", "unixtime-uint64", "uint64-mina:field"],
            "validUntil": ["isodate-unixtime", "unixtime-uint64", "uint64-mina:field"]
          },
          "type": ["ascii-bytes", "bytes-uint", "mina:mod.order", "uint-mina:field"],
          "signature": ["base58-mina:signature"],
          "issuer": {
            "id": {
              "type": ["ascii-bytes", "bytes-uint128", "uint128-mina:field"],
              "key": ["base58-mina:publickey"]
            }
          }
        }
      }
    },
    "aci:mina-poseidon": {
      "mina:publickey:B62qmNen3kDN74CJ2NQteNABrEN4AurGTbsLrraPy6ipQgUV9Q73tv2": {
        "type": "aci:mina-poseidon",
        "aci": "26BrkwFSTvGYj13eGGGTDNod9KgVnJriibgjurT99ukE",
        "schema": {
          "attributes": {
            "subject": {
              "birthDate": ["isodate-unixtime19", "unixtime19-uint64", "uint64-mina:field"],
              "countryCode": ["iso3166alpha3-iso3166numeric", "iso3166numeric-uint16", "uint16-mina:field"],
              "document": {
                "id": ["utf8-bytes", "bytes-uint", "mina:mod.order", "uint-mina:field"]
              },
              "firstName": ["utf8-bytes", "bytes-uint", "mina:mod.order", "uint-mina:field"],
              "gender": ["ascii-bytes", "bytes-uint64", "uint64-mina:field"],
              "lastName": ["utf8-bytes", "bytes-uint", "mina:mod.order", "uint-mina:field"]
            },
            "type": ["ascii-bytes", "bytes-uint128", "uint128-mina:field"],
            "validFrom": ["isodate-unixtime", "unixtime-uint64", "uint64-mina:field"]
          },
          "aci": ["base58-bytes", "bytes-uint256", "uint256-mina:field"],
          "type": ["ascii-bytes", "bytes-uint", "mina:mod.order", "uint-mina:field"]
        }
      }
    }
  }
};

const PROGRAM_PATH = new URL("./zk-program-test.js", import.meta.url);


const test = suite("INTEGRATION: mint token flow tests");

let app: App;
let fastify: FastifyInstance;
let tokenStorage: TokenStorage;
let config: Config;

test.before(async () => {
  app = await App.init();
  config = app.config;
  fastify = app.fastify;
  tokenStorage = app.tokenService.tokenStorage;
});

test.after.each(async () => {
  if (fs.existsSync(PROGRAM_PATH)) {
    fs.unlinkSync(PROGRAM_PATH);
  }
});

test.after(async () => {
  await tokenStorage.deleteAll();
  app.close();
});


test("mint token", async () => {
  const proposeResp = await fastify.inject({
    method: "GET",
    url: "/api/propose"
  });
  a.ok(
    proposeResp.statusCode === 200,
    `Propose response status code is not 200. Response body: ${proposeResp.body}`);
  const proposal = JSON.parse(proposeResp.body) as Proposal;
  a.is(proposal.verifierURL, `http://${config.host}:${config.port}${MINT_TOKEN_ENDPOINT}`);

  const inputSetup = {
    private: {
      credential: CREDENTIAL
    },
    public: {
      context: {
        nowU19: new Date().getTime() + 2208988800000
      }
    }
  };
  const jalProgram = o1jsJal.initProgram(proposal.program);
  const {
    publicInput,
    privateInput
  } = jalProgram.toInput<{ publicInput: any, privateInput: any[] }>(inputSetup);
  fs.writeFileSync(PROGRAM_PATH, jalProgram.translate(), { flag: "w" });

  let getTokenResp = await fastify.inject({
    method: "GET",
    url: `/api/token/${PublicInputMapper.toJson(publicInput).subject_id_key}`
  });
  a.ok(
    getTokenResp.statusCode === 400,
    `Get token response before mint is not 400. Response body: ${getTokenResp.body}`);

  console.log("Create proof start");
  const { zkProgram, PublicInput } = await import(PROGRAM_PATH.href);
  console.log("Compile zk-program start");
  const { verificationKey } = await zkProgram.compile();
  console.log("Compile zk-program end");
  const startCreateProof = new Date().getTime();
  console.log("Calculate proof start", startCreateProof / 1000, "s");

  const proof: Proof<any, void> = await zkProgram.execute(
    new PublicInput(publicInput),
    ...privateInput
  );
  console.log("Calculate proof end", (new Date().getTime() - startCreateProof) / 1000, "s");
  const mintBody: VerifyArgs = {
    verificationKey: verificationKey,
    proof: proof.toJSON(),
    publicInput: PublicInputMapper.toJson(publicInput)
  };
  const mintResp = await fastify.inject({
    method: "POST",
    url: MINT_TOKEN_ENDPOINT,
    body: mintBody
  });
  a.ok(
    mintResp.statusCode === 200,
    `Mint response status code is not 200. Response body: ${mintResp.body}`);

  const { token } = JSON.parse(mintResp.body) as { token: string };
  console.log(token);

  const secondMintResp = await fastify.inject({
    method: "POST",
    url: MINT_TOKEN_ENDPOINT,
    body: mintBody
  });
  a.ok(
    secondMintResp.statusCode === 400,
    `Second mint resp status code is not 400. Response body: ${secondMintResp.body}`);
  console.log(secondMintResp.body);
  getTokenResp = await fastify.inject({
    method: "GET",
    url: `/api/token/${PublicInputMapper.toJson(publicInput).subject_id_key}`
  });
  a.ok(
    getTokenResp.statusCode === 200,
    `Get token response after mint status code is not 200. Response body: ${getTokenResp.body}`);
  a.is(
    JSON.parse(getTokenResp.body).token,
    token,
    `Tokens not matched`);
});


test.run();