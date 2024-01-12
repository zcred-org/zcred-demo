import type { Field, PublicKey } from "o1js";
import { Program } from "o1js-jal";
import { JsonProof } from "o1js";

export type JsonPublicInput = {
  context_nowU19: string,
  proofs_aci: string,
  proofs_issuer_id_key: string,
  subject_id_key: string,
  subject_id_type: string,
}

export type PublicInput = {
  context_nowU19: Field,
  proofs_aci: Field,
  proofs_issuer_id_key: PublicKey,
  subject_id_key: PublicKey,
  subject_id_type: Field,
}

export type Config = {
  port: number;
  host: string;
}

export type Proposal = {
  verifierURL: string;
  program: Program
}

export type VerifyArgs = {
  proof: JsonProof;
  publicInput: JsonPublicInput;
  verificationKey: string;
}

export type TokenResp = {
  token: string;
}