import { Credential as _validateCredentialGenerated } from "./credential_validation_generated.js";
import { Keystore as _validateKeystoreGenerated } from "./keystore_validation_generated.js";

type ErrorObject = {
  instancePath: string;
  schemaPath: string;
  keyword: string;
  params: object;
  message: string;
};

type ValidatorFn = ((data: unknown) => boolean) & { errors: ErrorObject[] };

const _validateKeystore = _validateKeystoreGenerated as ValidatorFn;
const _validateCredential = _validateCredentialGenerated as ValidatorFn;

function schemaValidationErrors(
  validator: ValidatorFn,
  data: unknown
): ErrorObject[] | null {
  const validated = validator(data);
  if (validated) {
    return null;
  }
  return validator.errors;
}

export function isKeystoreValid(keystore: unknown): boolean {
  return !schemaValidationErrors(_validateKeystore, keystore);
}

export function isCredentialValid(credential: unknown): boolean {
  return !schemaValidationErrors(_validateCredential, credential);
}
