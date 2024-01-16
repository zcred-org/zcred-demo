import { type Program } from "o1js-jal";
import type { Field, JsonProof, PublicKey } from "o1js";

export type PublicInput = {
  context_nowU19: Field,
  proofs_aci: Field,
  proofs_issuer_id_key: PublicKey,
  subject_id_key: PublicKey,
  subject_id_type: Field,
}

export type JsonPublicInput = {
  context_nowU19: string,
  proofs_aci: string,
  proofs_issuer_id_key: string,
  subject_id_key: string,
  subject_id_type: string,
}

export type Proposal = {
  verifierURL: string;
  program: Program
}

export type ProofInfo = {
  proof: JsonProof;
  publicInput: JsonPublicInput;
  verificationKey: string;
}

export type CreateProgramResp = {
  programURL: string;
  programId: string;
}

export type VerifyReq = {
  proofInfo: ProofInfo,
  verifierURL: string;
}

export type TokenResp = {
  token: string;
}