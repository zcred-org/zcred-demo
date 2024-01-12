import { JsonPublicInput, PublicInput } from "../types.js";
import { Field, PublicKey } from "o1js";

export const ROOT_DIR = new URL("../", import.meta.url);

export function fromJsonPublicInput(jsonPublicInput: JsonPublicInput): PublicInput {
  return {
    context_nowU19: Field.fromJSON(jsonPublicInput.context_nowU19),
    proofs_aci: Field.fromJSON(jsonPublicInput.proofs_aci),
    proofs_issuer_id_key: PublicKey.fromJSON(jsonPublicInput.proofs_issuer_id_key),
    subject_id_key: PublicKey.fromJSON(jsonPublicInput.subject_id_key),
    subject_id_type: Field.fromJSON(jsonPublicInput.subject_id_type)
  };
}

function toJsonPublicInput(publicInput: PublicInput): JsonPublicInput {
  const target: Record<string, string> = {};
  for (const key of Object.keys(publicInput)) {
    target[key] = (<any>publicInput)[key].toJSON();
  }
  return target as JsonPublicInput;
}

export const PublicInputMapper = {
  toJson: toJsonPublicInput,
  fromJson: fromJsonPublicInput
};