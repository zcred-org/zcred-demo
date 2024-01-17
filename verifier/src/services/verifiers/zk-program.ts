import { O1GraphLink, O1JalTarget, o1jsJal, Program } from "o1js-jal";
import sortKeys from "sort-keys";
import * as u8a from "uint8arrays";
import { hash as sha256 } from "@stablelib/sha256";
import { ROOT_DIR } from "../../util/index.js";
import fs from "node:fs";
import { Field, JsonProof, Proof, verify } from "o1js";
import { PublicInput } from "../../types.js";

export type InitProgramReq = {
  program: Program;
}

export type InitProgramResp = {
  error?: string;
  status: "ok" | "bad"
}

export type VerifyProofReq = {
  verificationKey: string;
  proof: JsonProof;
  publicInput: PublicInput
}

export type VerifyProofResp = {
  verified: boolean;
  error?: string;
}

export class ZkProgramVerifier {

  private constructor(
    public program: Program
  ) {}

  static async init(program: Program): Promise<ZkProgramVerifier> {
    const verifier = new ZkProgramVerifier(program);
    if (await verifier.setProgram(program)) {
      return verifier;
    }
    throw new Error(
      `Can not initialized zk-program verifier with program, ${JSON.stringify(program, null, 2)}`
    );
  }

  async setProgram(program: Program): Promise<boolean> {
    const initResp = await initZkProgram({ program });
    if (initResp.status === "bad") {
      console.log(`Can not set zk-program. Error: ${initResp.error}`);
      return false;
    }
    this.program = program;
    return true;
  }

  async verifyProof({
    proof,
    publicInput,
    verificationKey
  }: VerifyProofReq): Promise<boolean> {
    return verifyProof({
      proof,
      publicInput,
      verificationKey
    }).then((resp) => {
      if (resp.error) console.log(`Verify proof error: ${resp.error}`);
      return resp.verified;
    });
  }
}

const PROGRAMS_DIR = new URL("./programs", ROOT_DIR);


function hashProgram(program: Program): string {
  const strProgram = JSON.stringify(sortKeys(program, { deep: true }));
  const hash = sha256(u8a.fromString(strProgram, "utf8"));
  return u8a.toString(hash, "base64url");
}

async function initZkProgram({ program }: InitProgramReq): Promise<InitProgramResp> {
  try {
    const programId = hashProgram(program);
    const jalProgram = o1jsJal.initProgram(program);
    if (!fs.existsSync(PROGRAMS_DIR)) {
      fs.mkdirSync(PROGRAMS_DIR);
    }
    console.log("Save zk-program");
    const programPath = new URL(`./programs/${programId}.js`, ROOT_DIR);
    fs.writeFileSync(programPath, jalProgram.translate(), { flag: "w" });
    const {
      publicInput,
      privateInput
    } = jalProgram.toInput<{ publicInput: any, privateInput: any[] }>(inputSetup);
    const { zkProgram, PublicInput } = await import(programPath.href);
    console.log("Compile zk-program, start");
    const { verificationKey } = await zkProgram.compile();
    console.log(verificationKey);
    console.log("Compile zk-program, end");
    const proof: Proof<any, void> = await zkProgram.execute(
      new PublicInput(publicInput),
      ...privateInput
    );
    console.log(proof);
    return { status: "ok" };
  } catch (e) {
    console.log(`Error: ${String(e)}`);
    return { status: "bad", error: String(e) };
  }
}

function validatePublicInput(publicInput: PublicInput, proof: JsonProof): boolean {
  let index = 0;
  for (const key of Object.keys(publicInput)) {
    const fields: Field[] = (publicInput as any)[key]!.toFields();
    for (const field of fields) {
      const jsonField = field.toJSON();
      if (jsonField !== proof.publicInput[index]) return false;
      index++;
    }
  }
  return true;
}

async function verifyProof({
  verificationKey,
  publicInput,
  proof
}: VerifyProofReq): Promise<VerifyProofResp> {
  try {
    if (!validatePublicInput(publicInput, proof)) {
      throw new Error(`Incorrect publicInput in request body`);
    }
    const verified = await verify(proof, verificationKey);
    return {
      verified
    };
  } catch (e) {
    return {
      verified: false,
      error: String(e)
    };
  }
}

export const MINA_VERIFIER_PROGRAM: Program<O1JalTarget, O1GraphLink> = {
  target: "o1js:zk-program",
  inputSchema: {
    private: {
      credential: {
        attributes: {
          type: {
            type: "setup",
            transLinks: ["ascii-bytes", "bytes-uint128", "uint128-mina:field"],
          },
          issuanceDate: {
            type: "setup",
            transLinks: ["isodate-unixtime", "unixtime-uint64", "uint64-mina:field"],
          },
          validFrom: {
            type: "setup",
            transLinks: ["isodate-unixtime", "unixtime-uint64", "uint64-mina:field"]
          },
          validUntil: {
            type: "setup",
            transLinks: ["isodate-unixtime", "unixtime-uint64", "uint64-mina:field"]
          },
          subject: {
            id: {
              type: {
                type: "setup",
                transLinks: ["ascii-bytes", "bytes-uint128", "uint128-mina:field"]
              },
              key: {
                type: "setup",
                transLinks: ["base58-mina:publickey"]
              }
            },
            firstName: {
              type: "setup",
              transLinks: ["utf8-bytes", "bytes-uint", "mina:mod.order", "uint-mina:field"]
            },
            lastName: {
              type: "setup",
              transLinks: ["utf8-bytes", "bytes-uint", "mina:mod.order", "uint-mina:field"]
            },
            birthDate: {
              type: "setup",
              transLinks: ["isodate-unixtime19", "unixtime19-uint64", "uint64-mina:field"]
            },
            gender: {
              type: "setup",
              transLinks: ["ascii-bytes", "bytes-uint64", "uint64-mina:field"]
            },
            countryCode: {
              type: "setup",
              transLinks: [
                "iso3166alpha3-iso3166numeric",
                "iso3166numeric-uint16",
                "uint16-mina:field"
              ]
            },
            document: {
              id: {
                type: "setup",
                transLinks: ["utf8-bytes", "bytes-uint", "mina:mod.order", "uint-mina:field"]
              }
            }
          }
        },
        proofs: {
          "mina:poseidon-pasta": {
            "mina:publickey:B62qmNen3kDN74CJ2NQteNABrEN4AurGTbsLrraPy6ipQgUV9Q73tv2": {
              issuer: {
                id: {
                  type: {
                    type: "setup",
                    transLinks: ["ascii-bytes", "bytes-uint128", "uint128-mina:field"]
                  },
                  key: {
                    type: "setup",
                    transLinks: ["base58-mina:publickey"]
                  }
                }
              },
              signature: {
                type: "setup",
                transLinks: ["base58-mina:signature"]
              }
            }
          },
          "aci:mina-poseidon": {
            "mina:publickey:B62qmNen3kDN74CJ2NQteNABrEN4AurGTbsLrraPy6ipQgUV9Q73tv2": {
              aci: {
                type: "setup",
                transLinks: ["base58-bytes", "bytes-uint256", "uint256-mina:field"]
              }
            }
          }
        }
      }
    },
    public: {
      subject: {
        id: {
          type: {
            type: "reference",
            path: ["private", "credential", "attributes", "subject", "id", "type"]
          },
          key: {
            type: "reference",
            path: ["private", "credential", "attributes", "subject", "id", "key"]
          }
        }
      },
      proofs: {
        issuer: {
          id: {
            key: {
              type: "reference",
              path: [
                "private",
                "credential",
                "proofs",
                "mina:poseidon-pasta",
                "mina:publickey:B62qmNen3kDN74CJ2NQteNABrEN4AurGTbsLrraPy6ipQgUV9Q73tv2",
                "issuer",
                "id",
                "key"
              ]
            }
          }
        },
        aci: {
          type: "reference",
          path: [
            "private",
            "credential",
            "proofs",
            "aci:mina-poseidon",
            "mina:publickey:B62qmNen3kDN74CJ2NQteNABrEN4AurGTbsLrraPy6ipQgUV9Q73tv2",
            "aci"
          ]
        }
      },
      context: {
        nowU19: {
          type: "setup",
          transLinks: ["uint64-mina:field"]
        }
      }
    }
  },
  commands: [
    {
      assert: {
        in: [{
          type: "function", equal: {
            in: [
              {
                type: "reference",
                path: [
                  "private",
                  "credential",
                  "proofs",
                  "aci:mina-poseidon",
                  "mina:publickey:B62qmNen3kDN74CJ2NQteNABrEN4AurGTbsLrraPy6ipQgUV9Q73tv2",
                  "aci"
                ]
              },
              {
                type: "reference",
                path: ["public", "proofs", "aci"]
              }
            ]
          }
        }]
      }
    },
    {
      assert: {
        in: [{
          type: "function", equal: {
            in: [
              { type: "reference", path: ["private", "credential", "attributes", "type"] },
              {
                type: "static",
                value: "passport",
                transLinks: ["ascii-bytes", "bytes-uint128", "uint128-mina:field"]
              }
            ]
          }
        }]
      }
    },
    {
      assert: {
        in: [{
          type: "function", equal: {
            in: [
              {
                type: "reference",
                path: ["public", "subject", "id", "type"]
              },
              {
                type: "reference",
                path: ["private", "credential", "attributes", "subject", "id", "type"]
              }
            ]
          }
        }]
      }
    },
    {
      assert: {
        in: [{
          type: "function", equal: {
            in: [
              {
                type: "reference",
                path: ["public", "subject", "id", "key"]
              },
              {
                type: "reference",
                path: ["private", "credential", "attributes", "subject", "id", "key"]
              }
            ]
          }
        }]
      }
    },
    {
      assert: {
        in: [{
          type: "function", equal: {
            in: [
              {
                type: "reference", path: ["public", "proofs", "issuer", "id", "key"]
              },
              {
                type: "reference",
                path: [
                  "private",
                  "credential",
                  "proofs",
                  "mina:poseidon-pasta",
                  "mina:publickey:B62qmNen3kDN74CJ2NQteNABrEN4AurGTbsLrraPy6ipQgUV9Q73tv2",
                  "issuer",
                  "id",
                  "key"
                ]
              }
            ]
          }
        }]
      }
    },
    {
      assert: {
        in: [{
          type: "function", greaterEqual: {
            in: [
              {
                type: "function", sub: {
                  in: [
                    { type: "reference", path: ["public", "context", "nowU19"] },
                    {
                      type: "reference",
                      path: ["private", "credential", "attributes", "subject", "birthDate"]
                    }
                  ]
                }
              },
              {
                type: "function", mul: {
                  in: [
                    { type: "static", value: 18, transLinks: ["uint64-mina:field"] },
                    { type: "constant", name: "year" }
                  ]
                }
              }
            ]
          }
        }]
      }
    },
    {
      assert: {
        in: [{
          type: "function", equal: {
            in: [
              {
                type: "reference", path: ["public", "proofs", "aci"]
              },
              {
                type: "function", hash: {
                  in: [
                    "mina:poseidon",
                    {
                      type: "reference",
                      path: ["private", "credential", "attributes", "subject", "birthDate"]
                    },
                    {
                      type: "reference",
                      path: ["private", "credential", "attributes", "subject", "countryCode"]
                    },
                    {
                      type: "reference",
                      path: ["private", "credential", "attributes", "subject", "document", "id"]
                    },
                    {
                      type: "reference",
                      path: ["private", "credential", "attributes", "subject", "firstName"]
                    },
                    {
                      type: "reference",
                      path: ["private", "credential", "attributes", "subject", "gender"]
                    },
                    {
                      type: "reference",
                      path: ["private", "credential", "attributes", "subject", "lastName"]
                    },
                    {
                      type: "reference",
                      path: ["private", "credential", "attributes", "type"]
                    },
                    {
                      type: "reference",
                      path: ["private", "credential", "attributes", "validFrom"]
                    }
                  ]
                }
              }
            ]
          }
        }]
      }
    },
    {
      hash: {
        in: [
          "mina:poseidon",
          {
            type: "reference",
            path: ["private", "credential", "attributes", "issuanceDate"]
          },
          {
            type: "reference",
            path: ["private", "credential", "attributes", "subject", "birthDate"]
          },
          {
            type: "reference",
            path: ["private", "credential", "attributes", "subject", "countryCode"]
          },
          {
            type: "reference",
            path: ["private", "credential", "attributes", "subject", "document", "id"]
          },
          {
            type: "reference",
            path: ["private", "credential", "attributes", "subject", "firstName"]
          },
          {
            type: "reference",
            path: ["private", "credential", "attributes", "subject", "gender"]
          },
          {
            type: "function", spread: {
              in: [{
                type: "function", transform: {
                  in: [{
                    type: "reference",
                    path: ["private", "credential", "attributes", "subject", "id", "key"]
                  }, "mina:publickey-mina:fields"]
                }
              }]
            }
          },
          {
            type: "reference",
            path: ["private", "credential", "attributes", "subject", "id", "type"]
          },
          {
            type: "reference",
            path: ["private", "credential", "attributes", "subject", "lastName"]
          },
          {
            type: "reference",
            path: ["private", "credential", "attributes", "type"]
          },
          {
            type: "reference",
            path: ["private", "credential", "attributes", "validFrom"]
          },
          {
            type: "reference",
            path: ["private", "credential", "attributes", "validUntil"]
          }
        ],
        out: "hash"
      }
    },
    {
      assert: {
        in: [{
          type: "function", verifySign: {
            in: [
              "mina:pasta",
              {
                type: "reference",
                path: [
                  "private",
                  "credential",
                  "proofs",
                  "mina:poseidon-pasta",
                  "mina:publickey:B62qmNen3kDN74CJ2NQteNABrEN4AurGTbsLrraPy6ipQgUV9Q73tv2",
                  "signature"
                ]
              },
              {
                type: "reference",
                path: ["hash"]
              },
              {
                type: "reference",
                path: ["public", "proofs", "issuer", "id", "key"]
              },
            ]
          }
        }]
      }
    }
  ]
};

const credential = {
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

const inputSetup = {
  private: {
    credential: credential
  },
  public: {
    context: {

      nowU19: new Date().getTime() + 2208988800000
    }
  }
};