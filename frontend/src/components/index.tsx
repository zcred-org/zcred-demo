"use client";
import { useEffect } from "react";
import styles from "./GetCredential/style.module.css";

export function Test() {


  async function importJS() {
  }
  useEffect(() => {
    const fn = async () => {
      // // @ts-expect-error
      // const imported = await
      // import("http://127.0.0.1:8081/api/zkprogram/1R18RPGqBGJfm0disUswAeJ71EKPktH_xaG_ekJYRZ0/program.js");
      // console.log(imported);
      // const proof = await ZkProgramProver.createProof()
    };
    console.log(window.location.href);

    fn();
  });

  return (
    <span className={styles.loader}></span>
  );
}