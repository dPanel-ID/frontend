/** The connected account whose credential the modal replaces. */
export interface CloudProjectCredentialTarget {
  id: string;
  name: string;
  /** Raw provider ID of the account, matched against the provider contracts. */
  provider: string;
}

export interface CloudProjectCreateModalProps {
  onSubmitSuccess: () => void;
  /** When set, the modal replaces this account's credential instead of connecting a new account. */
  credentialTarget?: CloudProjectCredentialTarget;
}
