import { suite } from "uvu";
import { App } from "../../src/app.js";
import { FastifyInstance } from "fastify";
import { InputSchema, Program } from "o1js-jal";
import * as a from "uvu/assert";

const inputSchema: InputSchema = {
  private: {
    credential: {
      attributes: {
        type: { type: "setup", transLinks: ["ascii-bytes", "bytes-uint128", "uint128-mina:field"] },
        issuanceDate: { type: "setup", transLinks: ["isodate-unixtime", "unixtime-uint64", "uint64-mina:field"] },
        validFrom: { type: "setup", transLinks: ["isodate-unixtime", "unixtime-uint64", "uint64-mina:field"], },
        validUntil: { type: "setup", transLinks: ["isodate-unixtime", "unixtime-uint64", "uint64-mina:field"], },
        subject: {
          id: {
            type: { type: "setup", transLinks: ["ascii-bytes", "bytes-uint128", "uint128-mina:field"] },
            key: { type: "setup", transLinks: ["base58-mina:publickey"] }
          },
          birthDate: { type: "setup", transLinks: ["isodate-unixtime", "unixtime-uint64", "uint64-mina:field"] },
          name: { type: "setup", transLinks: ["ascii-bytes", "bytes-uint128", "uint128-mina:field"] }
        }
      },
      proofs: {
        "mina:poseidon-pasta": {
          "mina:publickey:B62qj2aocCw3Ub1BnQXhUj1omS7dmVEvC3z8dsL2MkLcrw1cUgD3Apo": {
            issuer: {
              id: {
                key: { type: "setup", transLinks: ["base58-mina:publickey"] }
              }
            },
            signature: { type: "setup", transLinks: ["base58-mina:signature"] }
          }
        }
      }
    }
  }
};

const program: Program = {
  target: "o1js:zk-program",
  inputSchema: inputSchema,
  commands: [
    {
      assert: {
        in: [{
          type: "function",
          equal: {
            in: [
              { type: "reference", path: ["private", "credential", "attributes", "subject", "id", "key"] },
              {
                type: "static",
                value: "B62qokENrriEU3XWkob65JcbbcLLMKBvM2HRwx7sPdahjkqjXnXZPaA",
                transLinks: ["base58-mina:publickey"]
              }
            ]
          }
        }]
      }
    },
    {
      assert: {
        in: [{
          type: "function",
          equal: {
            in: [
              {
                type: "reference", path: [
                  "private", "credential", "proofs",
                  "mina:poseidon-pasta", "mina:publickey:B62qj2aocCw3Ub1BnQXhUj1omS7dmVEvC3z8dsL2MkLcrw1cUgD3Apo",
                  "issuer", "id", "key"]
              },
              {
                type: "static",
                value: "B62qokENrriEU3XWkob65JcbbcLLMKBvM2HRwx7sPdahjkqjXnXZPaA",
                transLinks: ["base58-mina:publickey"]
              }
            ]
          }
        }]
      }
    },
    // Verify credential attributes
    {
      hash: {
        in: [
          "mina:poseidon",
          { type: "reference", path: ["private", "credential", "attributes", "issuanceDate"] },
          { type: "reference", path: ["private", "credential", "attributes", "subject", "birthDate"] },
          {
            type: "function",
            spread: {
              in: [{
                type: "function",
                transform: {
                  in: [{
                    type: "reference",
                    path: ["private", "credential", "attributes", "subject", "id", "key"]
                  }, "mina:publickey-mina:fields"]
                }
              }]
            }
          },
          { type: "reference", path: ["private", "credential", "attributes", "subject", "id", "type"] },
          { type: "reference", path: ["private", "credential", "attributes", "subject", "name"] },
          { type: "reference", path: ["private", "credential", "attributes", "type"] },
          { type: "reference", path: ["private", "credential", "attributes", "validFrom"] },
          { type: "reference", path: ["private", "credential", "attributes", "validUntil"] }
        ],
        out: "hashedAttributes"
      },
    },
    {
      verifySign: {
        in: [
          "mina:pasta",
          {
            type: "reference",
            path: ["private", "credential", "proofs", "mina:poseidon-pasta",
              "mina:publickey:B62qj2aocCw3Ub1BnQXhUj1omS7dmVEvC3z8dsL2MkLcrw1cUgD3Apo", "signature"]
          }, {
            type: "reference",
            path: ["hashedAttributes"]
          }, {
            type: "reference", path: ["private", "credential", "proofs",
              "mina:poseidon-pasta", "mina:publickey:B62qj2aocCw3Ub1BnQXhUj1omS7dmVEvC3z8dsL2MkLcrw1cUgD3Apo",
              "issuer", "id", "key"]
          }], out: "verified"
      }
    },
    { assert: { in: [{ type: "reference", path: ["verified"] }] } }
  ]
};

const test = suite("TEST: zkprogram controller");

let app: App;
let fastify: FastifyInstance;

test.before(async () => {
  app = new App();
  fastify = app.fastify;
});

test.after(async () => {
  await app.close();
});

test("create and get", async () => {
  const createResp = await fastify.inject({
    method: "POST",
    url: "/api/zkprogram",
    body: program
  });
  a.is(createResp.statusCode, 200, `Create zk-program status code is not 200`);
  const { programURL } = JSON.parse(createResp.body) as { programURL: string };
  console.log(programURL);
  const getResp = await fastify.inject({
    method: "GET",
    url: "/api/zkprogram/1R18RPGqBGJfm0disUswAeJ71EKPktH_xaG_ekJYRZ0/program.js",
  });
  a.is(getResp.statusCode, 200, `Get zk program resp status code is not 200`);
  a.is(getResp.headers["content-type"], "text/javascript");
});

test("", async () => {
  // @ts-ignore
  const program = await import("http://127.0.0.1:8081/api/zkprogram/1R18RPGqBGJfm0disUswAeJ71EKPktH_xaG_ekJYRZ0/program.js");
  console.log(program);
});

test.run();