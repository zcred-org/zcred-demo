"use client"
import { IAuroWallet } from "@zcredjs/mina";
import { repeatUtil } from "@zcredjs/core";
import { useEffect, useState } from "react";
import { TokenService } from "@/services/token";
import { VerifierService } from "@/services/verifier";
import * as u8a from "uint8arrays";

const base64urlProposeURL = u8a.toString(u8a.fromString(VerifierService.PROPOSE_URL), "base64url");

export function Verifier() {

  const [wallet, setWallet] = useState<IAuroWallet | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const wallet = "mina" in window && ((window as any).mina as IAuroWallet);
    if (wallet) {
      setWallet(wallet);
    }
  }, []);

  useEffect(() => {
    if (address) {
      repeatUtil<boolean>(
        (stop) => {
          if (stop instanceof Error) {
            console.log(String(stop));
            return false;
          }
          return stop;
        },
        1000,
        async () => {
          const resp = await TokenService.getToken(address);
          if (resp) {
            setToken(resp.token);
            return true;
          }
          return false;
        }
      );
    }
  }, [address]);

  async function onConnectWallet() {
    if (wallet) {
      const address = await wallet.requestAccounts().then(it => it[0]);
      setAddress(address);
    }
  }

  const walletComponent = () => {
    if (!wallet) {
      return <div><a href={"https://www.aurowallet.com/"}> Install Auro Wallet </a></div>;
    }
    if (!address) {
      return <button onClick={onConnectWallet}> Connect Wallet </button>;
    }
    if (address) {
      return <div> Connected as: {address}</div>;
    }
    return <></>;
  };

  const tokenComponent = () => {
    if (!address) return <></>;
    if (token) {
      return <div>Your token: {token}</div>;
    } else {
      return <div>
        <a href={`${window.location.origin}?proposeUrl=${base64urlProposeURL}`}>Get token</a>
      </div>;
    }
  };

  return (
    <div>
      <div>
        {walletComponent()}
      </div>
      <div>
        {tokenComponent()}
      </div>
    </div>
  );

}