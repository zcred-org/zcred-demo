"use client";
import { useEffect, useState } from "react";
import * as u8a from "uint8arrays";
import { AuroWalletAdapter, IAuroWallet } from "@zcredjs/mina";
import { Identifier, PassportCred } from "@zcredjs/core";
import { VerifierService } from "@/services/verifier";
import { ZkProgramProver } from "@/services/provers/zk-program/index";
import { TokenService } from "@/services/token";
import { TokenResp } from "@/types/index";

const stubCredential: PassportCred = {
  "meta": {
    "issuer": {
      "type": "http",
      "uri": "http://localhost:8080/api/v1/zcred/issuers/passport"
    }
  },
  "attributes": {
    "type": "passport",
    "issuanceDate": "2024-01-14T13:31:18.914Z",
    "validFrom": "2020-06-21",
    "validUntil": "2030-01-31T21:00:00.000Z",
    "subject": {
      "id": {
        "type": "mina:publickey",
        "key": "B62qqXhJ8qgXdApGoAvZHeXrHEg6YGqmThFcRN8xKqAvJsqjmUMVaZE"
      },
      "firstName": "JOHN",
      "lastName": "TEST",
      "birthDate": "2000-01-01",
      "gender": "male",
      "countryCode": "USA",
      "document": {
        "id": "DOCUMENTID123123"
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
        "signature": "7mX139FPqrGHVVZyEtdD9aZvz1Xb4sh8VBjmc5pzHtB3Fq5BTScHkHcPY7Q9J9FTVPoVwc8tvqaEG8oi8QF3PKbTnX5Tgg8V",
        "schema": {
          "attributes": {
            "issuanceDate": [
              "isodate-unixtime",
              "unixtime-uint64",
              "uint64-mina:field"
            ],
            "subject": {
              "birthDate": [
                "isodate-unixtime19",
                "unixtime19-uint64",
                "uint64-mina:field"
              ],
              "countryCode": [
                "iso3166alpha3-iso3166numeric",
                "iso3166numeric-uint16",
                "uint16-mina:field"
              ],
              "document": {
                "id": [
                  "utf8-bytes",
                  "bytes-uint",
                  "mina:mod.order",
                  "uint-mina:field"
                ]
              },
              "firstName": [
                "utf8-bytes",
                "bytes-uint",
                "mina:mod.order",
                "uint-mina:field"
              ],
              "gender": [
                "ascii-bytes",
                "bytes-uint64",
                "uint64-mina:field"
              ],
              "id": {
                "key": [
                  "base58-mina:publickey",
                  "mina:publickey-mina:fields"
                ],
                "type": [
                  "ascii-bytes",
                  "bytes-uint128",
                  "uint128-mina:field"
                ]
              },
              "lastName": [
                "utf8-bytes",
                "bytes-uint",
                "mina:mod.order",
                "uint-mina:field"
              ]
            },
            "type": [
              "ascii-bytes",
              "bytes-uint128",
              "uint128-mina:field"
            ],
            "validFrom": [
              "isodate-unixtime",
              "unixtime-uint64",
              "uint64-mina:field"
            ],
            "validUntil": [
              "isodate-unixtime",
              "unixtime-uint64",
              "uint64-mina:field"
            ]
          },
          "type": [
            "ascii-bytes",
            "bytes-uint",
            "mina:mod.order",
            "uint-mina:field"
          ],
          "signature": [
            "base58-mina:signature"
          ],
          "issuer": {
            "id": {
              "type": [
                "ascii-bytes",
                "bytes-uint128",
                "uint128-mina:field"
              ],
              "key": [
                "base58-mina:publickey"
              ]
            }
          }
        }
      }
    },
    "aci:mina-poseidon": {
      "mina:publickey:B62qmNen3kDN74CJ2NQteNABrEN4AurGTbsLrraPy6ipQgUV9Q73tv2": {
        "type": "aci:mina-poseidon",
        "aci": "3FauCqtBELaFGi5C4LmyzvRBv7Zu3KNszPvZm8gAXJ4J",
        "schema": {
          "attributes": {
            "subject": {
              "birthDate": [
                "isodate-unixtime19",
                "unixtime19-uint64",
                "uint64-mina:field"
              ],
              "countryCode": [
                "iso3166alpha3-iso3166numeric",
                "iso3166numeric-uint16",
                "uint16-mina:field"
              ],
              "document": {
                "id": [
                  "utf8-bytes",
                  "bytes-uint",
                  "mina:mod.order",
                  "uint-mina:field"
                ]
              },
              "firstName": [
                "utf8-bytes",
                "bytes-uint",
                "mina:mod.order",
                "uint-mina:field"
              ],
              "gender": [
                "ascii-bytes",
                "bytes-uint64",
                "uint64-mina:field"
              ],
              "lastName": [
                "utf8-bytes",
                "bytes-uint",
                "mina:mod.order",
                "uint-mina:field"
              ]
            },
            "type": [
              "ascii-bytes",
              "bytes-uint128",
              "uint128-mina:field"
            ],
            "validFrom": [
              "isodate-unixtime",
              "unixtime-uint64",
              "uint64-mina:field"
            ]
          },
          "aci": [
            "base58-bytes",
            "bytes-uint256",
            "uint256-mina:field"
          ],
          "type": [
            "ascii-bytes",
            "bytes-uint",
            "mina:mod.order",
            "uint-mina:field"
          ]
        }
      }
    }
  },
  "jws": "eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa21TWkd5aE1rTkhIR0NnUVJKYVN2NXlRbjVqMjgzZEZ0clpHNnp1QmpNREttI3o2TWttU1pHeWhNa05ISEdDZ1FSSmFTdjV5UW41ajI4M2RGdHJaRzZ6dUJqTURLbSJ9..s_35XkHDRitomRsWc5TNpmrIczbultfaxGgWI2JL2zDwTbPqT_KDFJYsQWqQSEdivNGt0f7K2WJPT-5nb_nJDg"
};


function paramsGetSubjectId(proposalURL: URL): Identifier {
  const key = proposalURL.searchParams.get("subjectId.key");
  const type = proposalURL.searchParams.get("subjectId.type");
  if (key && type) return { key, type };
  throw new Error(
    `Proposal url does not contains subjectId.key & subjectId.type. URL: ${proposalURL.href}`
  );
}

function identifierEquals(first: Identifier, last: Identifier) {
  return first.key === last.key && first.type === last.type;
}

export default function Subject() {

  const [proposalURL, setProposeURL] = useState<URL | null>(null);
  const [requiredSubjectId, setRequiredSubjectId] = useState<Identifier | null>(null);
  const [walletAdapter, setWalletAdapter] = useState<AuroWalletAdapter | null>(null);
  const [connectedSubjectId, setConnectedSubjectId] = useState<Identifier | null>({
    type: "mina:publickey",
    key: "B62qqXhJ8qgXdApGoAvZHeXrHEg6YGqmThFcRN8xKqAvJsqjmUMVaZE"
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const currentURL = new URL(window.location.href);
    const base64ProposalURL = currentURL.searchParams.get("proposalURL");
    if (base64ProposalURL) {
      try {
        const proposalURL = new URL(u8a.toString(u8a.fromString(base64ProposalURL, "base64url")));
        setProposeURL(proposalURL);
        const subjectId = paramsGetSubjectId(proposalURL);
        setRequiredSubjectId(subjectId);
      } catch (e) {
        setError("Bad verifier redirect attempt");
        setTimeout(() => setError(""), 2000);
      }
    }
  }, []);

  useEffect(() => {
    const wallet = "mina" in window && ((window as any).mina as IAuroWallet);
    if (wallet) {
      const walletAdapter = new AuroWalletAdapter(wallet);
      setWalletAdapter(walletAdapter);
    }
  }, []);

  async function onVerify() {
    try {
      if (proposalURL && requiredSubjectId && walletAdapter) {
        const proposal = await VerifierService.getProposal(proposalURL.href);
        console.log(`proposal:`, JSON.stringify(proposal, null, 2));
        const proofResult = await ZkProgramProver.createProof(proposal.program, stubCredential);
        console.log("proof result:",JSON.stringify(proofResult, null, 2));
        const verifyResp = await VerifierService.verify<TokenResp>({
          verifierURL: TokenService.MINT_ENDPOINT.href,
          proofInfo: proofResult
        });
        console.log("verification done", JSON.stringify(verifyResp));
      }
    } catch (e) {
      console.log(String(e));
      setError(`Error during verification process`);
      setTimeout(() => setError(""), 2000);
    }
  }

  async function onGetSubjectId() {
    try {
      if (walletAdapter && requiredSubjectId) {
        const subjectId = await walletAdapter.getSubjectId();
        if (identifierEquals(subjectId, requiredSubjectId)) {
          setConnectedSubjectId(subjectId);
        } else setError(`You need connect as ${requiredSubjectId.key}`);
      }
    } catch (e) {
      setError("Wallet connection error");
    } finally {
      if (error) setTimeout(() => setError(""), 4000);
    }
  }

  return <>
    <button onClick={onVerify}>verify</button>
  </>;
}