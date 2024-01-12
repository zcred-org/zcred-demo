import {
  Bool,
  Provable,
  CircuitString,
  ZkProgram,
  Field,
  Poseidon,
  PublicKey,
  Signature,
  Struct,
  UInt64,
} from "o1js";

export class PublicInput extends Struct({ 
  context_nowU19: Field, 
  proofs_aci: Field, 
  proofs_issuer_id_key: PublicKey, 
  subject_id_key: PublicKey, 
  subject_id_type: Field, 
}) {}

export const zkProgram = ZkProgram({
  publicInput: PublicInput,
  methods: {
    execute: {
      privateInputs: [
        Field,
        Field,
        Field,
        Field,
        Field,
        Field,
        PublicKey,
        Field,
        Field,
        Field,
        Field,
        Field,
        Field,
        PublicKey,
        Field,
        Signature,
      ],
      method(
        publicInput,
        private_credential_attributes_issuanceDate,
        private_credential_attributes_subject_birthDate,
        private_credential_attributes_subject_countryCode,
        private_credential_attributes_subject_document_id,
        private_credential_attributes_subject_firstName,
        private_credential_attributes_subject_gender,
        private_credential_attributes_subject_id_key,
        private_credential_attributes_subject_id_type,
        private_credential_attributes_subject_lastName,
        private_credential_attributes_type,
        private_credential_attributes_validFrom,
        private_credential_attributes_validUntil,
        private_credential_proofs_aci_mina_poseidon_mina_publickey_B62qmNen3kDN74CJ2NQteNABrEN4AurGTbsLrraPy6ipQgUV9Q73tv2_aci,
        private_credential_proofs_mina_poseidon_pasta_mina_publickey_B62qmNen3kDN74CJ2NQteNABrEN4AurGTbsLrraPy6ipQgUV9Q73tv2_issuer_id_key,
        private_credential_proofs_mina_poseidon_pasta_mina_publickey_B62qmNen3kDN74CJ2NQteNABrEN4AurGTbsLrraPy6ipQgUV9Q73tv2_issuer_id_type,
        private_credential_proofs_mina_poseidon_pasta_mina_publickey_B62qmNen3kDN74CJ2NQteNABrEN4AurGTbsLrraPy6ipQgUV9Q73tv2_signature,
      ) {
        private_credential_proofs_aci_mina_poseidon_mina_publickey_B62qmNen3kDN74CJ2NQteNABrEN4AurGTbsLrraPy6ipQgUV9Q73tv2_aci.equals(publicInput.proofs_aci).assertTrue()
        private_credential_attributes_type.equals(Field(8097880544633647732n)).assertTrue()
        publicInput.subject_id_type.equals(private_credential_attributes_subject_id_type).assertTrue()
        publicInput.subject_id_key.equals(private_credential_attributes_subject_id_key).assertTrue()
        publicInput.proofs_issuer_id_key.equals(private_credential_proofs_mina_poseidon_pasta_mina_publickey_B62qmNen3kDN74CJ2NQteNABrEN4AurGTbsLrraPy6ipQgUV9Q73tv2_issuer_id_key).assertTrue()
        publicInput.context_nowU19.sub(private_credential_attributes_subject_birthDate).greaterThanOrEqual(Field(18).mul(Field(365.25 * 24 * 60 * 60 * 1000))).assertTrue()
        const hash = Poseidon.hash([
          private_credential_attributes_issuanceDate,
          private_credential_attributes_subject_birthDate,
          private_credential_attributes_subject_countryCode,
          private_credential_attributes_subject_document_id,
          private_credential_attributes_subject_firstName,
          private_credential_attributes_subject_gender,
          ...private_credential_attributes_subject_id_key.toFields(),
          private_credential_attributes_subject_id_type,
          private_credential_attributes_subject_lastName,
          private_credential_attributes_type,
          private_credential_attributes_validFrom,
          private_credential_attributes_validUntil]) 
        private_credential_proofs_mina_poseidon_pasta_mina_publickey_B62qmNen3kDN74CJ2NQteNABrEN4AurGTbsLrraPy6ipQgUV9Q73tv2_signature.verify(publicInput.proofs_issuer_id_key, [hash]).assertTrue()
      }
    }
  }
});
