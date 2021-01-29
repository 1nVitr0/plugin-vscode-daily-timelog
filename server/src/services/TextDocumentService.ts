import { Position, TextDocumentIdentifier, TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

export default abstract class TextDocumentService {
  protected currentDocument?: TextDocument;
  protected documents: TextDocuments<TextDocument>;

  public constructor(documents: TextDocuments<TextDocument>) {
    this.documents = documents;
  }

  public for(document: TextDocumentIdentifier): this {
    this.currentDocument = this.getDocument(document.uri);
    return this;
  }

  protected offsetAt(position: Position): number {
    return this.currentDocument?.offsetAt(position) || 0;
  }

  protected positionAt(offset: number): Position {
    return this.currentDocument?.positionAt(offset) || { line: 0, character: 0 };
  }

  private getDocument(uri: string): TextDocument | undefined {
    return this.documents.get(uri);
  }
}
