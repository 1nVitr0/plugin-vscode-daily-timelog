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

  protected getCharBeforePosition(position: Position): string | undefined {
    return this.currentDocument?.getText({
      start: { line: position.line, character: position.character - 1 },
      end: position,
    });
  }

  protected getIndent(position: Position, indentSpaces = 2): number {
    const line = this.currentDocument?.getText({
      start: { line: position.line, character: 0 },
      end: position,
    });
    let indent = 0;
    while (line && indent < line.length && line[indent].match(/\s/)) indent++;

    return Math.floor(indent / indentSpaces);
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

  private getLineCount(): number | undefined {
    return this.currentDocument?.lineCount;
  }
}
