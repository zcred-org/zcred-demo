import { suite } from "uvu";
import { o1jsJal } from "o1js-jal";
import { Proof } from "o1js";
import fs from "node:fs";
import * as a from "uvu/assert";
import { MINA_VERIFIER_PROGRAM, ZkProgramVerifier } from "../../../src/services/verifiers/zk-program.js";

const test = suite("ZK-program verifier tests");

const programPath = new URL("./zk-program-test.js", import.meta.url);

test.after.each(() => {
  if (fs.existsSync(programPath)) {
    fs.unlinkSync(programPath);
  }
});

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

test("passport zk-credential proof verification", async () => {
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
  const zkProgramVerifier = await ZkProgramVerifier.init(MINA_VERIFIER_PROGRAM);
  const jalProgram = o1jsJal.initProgram(MINA_VERIFIER_PROGRAM);
  const {
    publicInput,
    privateInput
  } = jalProgram.toInput<{ publicInput: any, privateInput: any[] }>(inputSetup);

  fs.writeFileSync(programPath, jalProgram.translate(), { flag: "w" });

  console.log("Create proof start");
  const { zkProgram, PublicInput } = await import(programPath.href);
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
  const verified = await zkProgramVerifier.verifyProof({
    proof: proof.toJSON(),
    verificationKey,
    publicInput
  });
  a.ok(verified, `zk-program is not verified`);
});

test.run();