import { TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

export default abstract class TextDocumentService<T> {
  protected documents: TextDocuments<T>;

  public constructor(documents: TextDocuments<T>) {
    this.documents = documents;
  }

  protected getDocument(uri: string): T | undefined {
    return this.documents.get(uri);
  }
}
