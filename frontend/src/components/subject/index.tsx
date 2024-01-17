"use client";
import { useEffect, useState } from "react";
import * as u8a from "uint8arrays";
import { AuroWalletAdapter, IAuroWallet } from "@zcredjs/mina";
import { ChallengeReq, HttpIssuer, Identifier, PassportCred } from "@zcredjs/core";
import { VerifierService } from "@/services/verifier";
import { ZkProgramProver } from "@/services/provers/zk-program/index";
import { TokenService } from "@/services/token";
import { Proposal, TokenResp } from "@/types/index";
import styles from "./styles.module.css";
import JsonModal from "@/components/modal/json-modal/index";


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

const issuer = new HttpIssuer("https://api.dev.sybil.center/api/v1/zcred/issuers/passport-test/");

function identifierEquals(first: Identifier, last: Identifier) {
  return first.key === last.key && first.type === last.type;
}

const SHOW_PROGRAM_ELEMENT_ID = "show-program-id";
const SHOW_CREDENTIAL_ELEMENT_ID = "show-credential-id";

export default function Subject() {

  const [proposalURL, setProposeURL] = useState<URL | null>(null);
  const [requiredSubjectId, setRequiredSubjectId] = useState<Identifier | null>(null);
  const [walletAdapter, setWalletAdapter] = useState<AuroWalletAdapter | null>(null);
  const [connectedSubjectId, setConnectedSubjectId] = useState<Identifier | null>();
  const [loading, setLoading] = useState<string>("");
  const [error, setError] = useState("");
  const [credential, setCredential] = useState<PassportCred | null>(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [isProgramOpen, setIsProgramOpen] = useState(false);
  const [isCredentialOpen, setIsCredentialOpen] = useState(false);
  const [isVerified, setIsIsVerified] = useState(false);

  useEffect(() => {
    const currentURL = new URL(window.location.href);
    const base64ProposalURL = currentURL.searchParams.get("proposalURL");
    if (base64ProposalURL) {
      try {
        const proposalURL = new URL(u8a.toString(u8a.fromString(base64ProposalURL, "base64url")));
        setProposeURL(proposalURL);
        const subjectId = paramsGetSubjectId(proposalURL);
        VerifierService.getProposal(proposalURL.href)
          .then(proposal => setProposal(proposal));
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

  useEffect(() => {
    const bodyElement = document.getElementsByTagName("body")[0]!;
    const showJalElement = document.createElement("div");
    showJalElement.id = SHOW_PROGRAM_ELEMENT_ID;
    bodyElement.appendChild(showJalElement);
    const showCredentialElement = document.createElement("div");
    showCredentialElement.id = SHOW_CREDENTIAL_ELEMENT_ID;
    bodyElement.appendChild(showCredentialElement);
  }, []);

  async function onVerify() {
    try {
      if (proposalURL && requiredSubjectId && walletAdapter) {
        setLoading("Loading ...");
        const _proposal = proposal
          ? proposal
          : await VerifierService.getProposal(proposalURL.href);
        setProposal(_proposal);
        const proofResult = await ZkProgramProver.createProof(_proposal.program, credential!);
        await VerifierService.verify<TokenResp>({
          verifierURL: TokenService.MINT_ENDPOINT.href,
          proofInfo: proofResult
        });
        setIsIsVerified(true);
      }
    } catch (e) {
      console.log(String(e));
      setError(`Error during verification process`);
      setTimeout(() => setError(""), 2000);
    } finally {
      setLoading("");
    }
  }

  async function onWalletConnect() {
    try {
      setLoading("Loading ...");
      if (walletAdapter && requiredSubjectId) {
        const subjectId = await walletAdapter.getSubjectId();
        if (identifierEquals(subjectId, requiredSubjectId)) {
          setConnectedSubjectId(subjectId);
        } else {
          setError(`You need connect as ${requiredSubjectId.key}`);
          setTimeout(() => setError(""), 3000);
        }
      }
    } catch (e) {
      setError("Wallet connection error");
      setTimeout(() => setError(""), 4000);
    } finally {
      setLoading("");
    }
  }

  async function onGetCredential() {
    try {
      if (walletAdapter) {
        setLoading("Loading ...");
        const challengeReq: ChallengeReq = {
          subject: { id: await walletAdapter.getSubjectId() },
          validUntil: new Date(2030, 0, 0).toISOString(),
          options: {
            chainId: await walletAdapter.getChainId()
          }
        };
        const credential = await issuer.browserIssue!<PassportCred>({
          challengeReq,
          sign: walletAdapter.sign,
        });
        console.log(credential);
        setCredential(credential);
      }
    } catch (e) {
      console.log(String(e));
      setError("Get passport credential error");
      setTimeout(() => setError(""), 2000);
    } finally {
      setLoading("");
    }
  }

  const walletElement = () => {
    if (walletAdapter) {
      if (!connectedSubjectId) {
        return <button onClick={onWalletConnect}>Connect to wallet</button>;
      } else {
        return <div>Connected as: {connectedSubjectId.key} </div>;
      }
    } else return <div><a href={"https://www.aurowallet.com/"}>Install Auro wallet</a></div>;
  };

  const component = () => {
    if (error) {
      return <div>{error}</div>;
    }
    if (loading) {
      return <div>{loading}</div>;
    }
    return (
      <>
        <JsonModal
          json={(proposal?.program ? proposal.program : {})}
          elementId={SHOW_PROGRAM_ELEMENT_ID}
          isOpen={isProgramOpen}
          setIsOpen={setIsProgramOpen}/>
        <JsonModal
          json={(credential!)}
          elementId={SHOW_CREDENTIAL_ELEMENT_ID}
          isOpen={isCredentialOpen}
          setIsOpen={setIsCredentialOpen}/>
        <div>
          {walletElement()}
        </div>
        {!credential && connectedSubjectId && <div>
          <button onClick={onGetCredential}>Get credential</button>
        </div>}
        {credential && <div>
          <button onClick={() => setIsCredentialOpen(true)}>
            Show credential
          </button>
        </div>}
        {proposal && connectedSubjectId && <div>
          <button onClick={() => setIsProgramOpen(true)}>
            Show program
          </button>
        </div>}
        {credential && proposal && !isVerified && <div>
          <button onClick={onVerify}>Verify</button>
        </div>}
        {!isVerified && <div>
          Not verified
        </div>}
        {isVerified && <div>
          You verified !!!
        </div>}
      </>
    );
  };

  return <div className={styles.container}>
    {component()}
  </div>;
}