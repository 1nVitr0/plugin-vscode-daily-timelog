import { SecretStorage, Event, SecretStorageChangeEvent } from "vscode";

interface TypedSecretStorage<Entries extends string> extends SecretStorage {
  store(key: Entries, value: string): Thenable<void>;
  get(key: Entries): Thenable<string | undefined>;
  delete(key: Entries): Thenable<void>;
  onDidChange: Event<SecretStorageChangeEvent & { readonly key: Entries }>;
}

export default interface Secrets extends TypedSecretStorage<"jiraToken"> {}
