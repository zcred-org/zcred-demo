"use client";
import { ChallengeReq, HttpIssuer, IWalletAdapter, PassportCred } from "@zcredjs/core";
import { useState } from "react";

type Props = {
  walletAdapter: IWalletAdapter;
  onGetCredential: (credential: PassportCred) => Promise<void>
}

type CredState = {
  loading: boolean;
  error: string;
  cred: PassportCred | null;
}

const initCredState: CredState = {
  loading: false,
  error: "",
  cred: null
};

const issuer = new HttpIssuer("https://api.dev.sybil.center/api/v1/zcred/issuers/passport");

export function GetCredential({
  walletAdapter,
  onGetCredential
}: Props) {
  const [credState, setCredState] = useState<CredState>(initCredState);

  async function getCredential() {
    try {
      setCredState((prev) => ({ ...prev, loading: true }));
      const challengeReq: ChallengeReq = {
        subject: {
          id: await walletAdapter.getSubjectId()
        },
        validUntil: new Date(2030, 0, 0).toISOString(),
        options: {
          chainId: await walletAdapter.getChainId()
        }
      };
      const credential = await issuer.browserIssue!<PassportCred>({
        challengeReq,
        sign: walletAdapter.sign,
      });
      await onGetCredential(credential);
      setCredState((prev) => ({ ...prev, cred: credential }));
    } catch (e) {
      console.log(String(e));
      setCredState((prev) => ({ ...prev, error: "Something went wrong" }));
      setTimeout(() => setCredState(initCredState), 2000);
    } finally {
      setCredState((prev) => ({ ...prev, loading: false }));
    }
  }

  const component = () => {
    if (credState.error) {
      return (<div>${credState.error}</div>);
    } else if (credState.loading) {
      return (<div>Loading ...</div>);
    }
    if (credState.cred) {
      return (<div>You've got credential</div>);
    }
    return (<div onClick={getCredential}> Get ZK-Passport</div>);
  };

  return (
    <button>
      {component()}
    </button>
  );
}