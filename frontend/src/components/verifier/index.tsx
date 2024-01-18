"use client";
import { AuroWalletAdapter, IAuroWallet } from "@zcredjs/mina";
import { Identifier, repeatUtil } from "@zcredjs/core";
import { useEffect, useState } from "react";
import { TokenService } from "@/services/token";
import { VerifierService } from "@/services/verifier";
import * as u8a from "uint8arrays";
import styles from "./styles.module.css";
import { VoteService } from "@/services/vote";

function createRedirectURL(subjectId: Identifier) {
  const proposalURL = new URL(VerifierService.PROPOSE_URL);
  proposalURL.searchParams.set("subjectId.key", subjectId.key);
  proposalURL.searchParams.set("subjectId.type", subjectId.type);
  const base64urlProposeURL = u8a.toString(u8a.fromString(proposalURL.href), "base64url");
  return `${window.location.origin}/subject?proposalURL=${base64urlProposeURL}`;
}

export function Verifier() {

  const [token, setToken] = useState<string | null>(null);
  const [walletAdapter, setWalletAdapter] = useState<AuroWalletAdapter | null>(null);
  const [subjectId, setSubjectId] = useState<Identifier | null>(null);
  const [voteMessage, setVoteMessage] = useState("");
  const [isVoted, setIsVoted] = useState<boolean>(false);

  useEffect(() => {
    const wallet = "mina" in window && ((window as any).mina as IAuroWallet);
    if (wallet) {
      setWalletAdapter(new AuroWalletAdapter(wallet));
    }
  }, []);

  useEffect(() => {
    if (subjectId) {
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
          const resp = await TokenService.getToken(subjectId.key);
          if (resp) {
            setToken(resp.token);
            return true;
          }
          return false;
        }
      );
    }
  }, [subjectId]);

  async function onConnectWallet() {
    if (walletAdapter) {
      const subjectId = await walletAdapter.getSubjectId();
      setSubjectId(subjectId);
    }
  }

  async function onVote(vote: "red" | "blue") {
    if (subjectId) {
      const { message, isVoted } = await VoteService.vote(subjectId.key, vote);
      setIsVoted(isVoted);
      setVoteMessage(message);
    }
  }

  const walletComponent = () => {
    if (!walletAdapter) {
      return <div><a href={"https://www.aurowallet.com/"} target={"_blank"}> Install Auro Wallet </a></div>;
    }
    if (!subjectId) {
      return <button onClick={onConnectWallet}> Connect Wallet </button>;
    }
    if (subjectId) {
      return <div> Connected as: {subjectId.key}</div>;
    }
    return <></>;
  };

  const tokenComponent = () => {
    if (!subjectId) return <></>;
    if (token) {
      return <div>Your token: {token}</div>;
    } else {
      return <a href={createRedirectURL(subjectId)} target={"_blank"}>
        <button>
          Get token
        </button>
      </a>;
    }
  };

  const voteComponent = () => {
    if (!subjectId || !token) {
      return <></>;
    }
    return (
      <>
        <div className={styles.vote_container}>
          <button onClick={() => onVote("blue")}>Vote blue</button>
          <button onClick={() => onVote("red")}>Vote red</button>
        </div>
        {voteMessage && <div
          className={isVoted ? styles.vote_message__good : styles.vote_message__bad}>
          {voteMessage}
        </div>}
      </>
    );
  };

  return (
    <div className={styles.container}>
      <div>
        {walletComponent()}
      </div>
      <div>
        {tokenComponent()}
      </div>
      <div>
        {voteComponent()}
      </div>
    </div>
  );

}